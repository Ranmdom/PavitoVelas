// app/api/webhook/route.ts
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";
import { sendPaymentConfirmed, sendPaymentPending } from "../services/emailService";

// (opcional no App Router)
export const config = { api: { bodyParser: false } };

// ===== Melhor Envio: env e helpers =====
const ME_BASE_RAW  = process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "";
const ME_TOKEN_RAW = process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "";

const ME_BASE  = ME_BASE_RAW.trim();
const ME_TOKEN = ME_TOKEN_RAW.replace(/\r|\n|^"+|"+$|^'+|'+$/g, "").trim();

function meHeaders() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${ME_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "PavitoVelas (suporte@pavito.com)",
  } as const;
}

// Busca tracking via /me/shipment/tracking e grava no banco.
// Faz fallback em GET /me/orders/{id} pra garantir carrier/urls.
async function persistTracking(orderIds: string[]) {
  try {
    // 1) tracking em lote
    const r = await fetch(`${ME_BASE}/me/shipment/tracking`, {
      method: "POST",
      headers: meHeaders(),
      body: JSON.stringify({ orders: orderIds }),
    });
    const arr: any[] = r.ok ? await r.json() : [];

    if (Array.isArray(arr) && arr.length) {
      await Promise.all(arr.map((t: any) =>
        prisma.shipment.update({
          where: { melhorEnvioOrderId: String(t.id) },
          data: {
            trackingCode:    t?.tracking ?? undefined,
            trackingUrl:     t?.tracking_url ?? undefined,
            trackingCarrier: t?.service?.company?.name ?? t?.company?.name ?? undefined,
            updatedAt:       new Date(),
          },
        })
      ));
    }

    // 2) fallback por ID
    await Promise.all(orderIds.map(async (id) => {
      const rr = await fetch(`${ME_BASE}/me/orders/${id}`, { headers: meHeaders(), cache: "no-store" });
      if (!rr.ok) return;
      const ord = await rr.json();
      const carrier = ord?.service?.company?.name ?? ord?.company?.name ?? null;
      const code    = ord?.tracking ?? ord?.shipment?.tracking ?? null;
      const url     = ord?.tracking_url ?? ord?.shipment?.tracking_url ?? null;

      await prisma.shipment.update({
        where: { melhorEnvioOrderId: String(id) },
        data: {
          trackingCarrier: carrier ?? undefined,
          trackingCode:    code    ?? undefined,
          trackingUrl:     url     ?? undefined,
          updatedAt: new Date(),
        },
      });
    }));
  } catch (e) {
    console.warn("📭 persistTracking falhou (normal se ME ainda não gerou o código):", e);
  }
}

function buildPublicPrintUrl(base: string, orders: string[], extra?: Record<string,string>) {
  const u = new URL(`${base}/me/shipment/print`);
  u.searchParams.set("mode", "public");          // link público
  // u.searchParams.set("format", "a4");         // se quiser A4
  for (const id of orders) u.searchParams.append("orders[]", id);
  for (const [k,v] of Object.entries(extra || {})) u.searchParams.set(k, v);
  return u.toString();
}
// =======================================

async function buffer(readable: ReadableStream) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(typeof value === "string" ? Buffer.from(value) : value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Método não permitido" }, { status: 405 });
  }

  const buf = await buffer(req.body as ReadableStream);
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    console.error(`Erro na assinatura do webhook: ${err.message}`);
    return NextResponse.json({ error: "Erro na assinatura do webhook" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSession(event.data.object as Stripe.Checkout.Session, event.type);
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutSession(event.data.object as Stripe.Checkout.Session, event.type);
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Evento não processado: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session, eventType: string) {
  const meta = session.metadata || {};
  console.log("WEBHOOK RECEBIDO:", session.id, meta, "event=", eventType, "status=", session.payment_status);

  const isPaidNow =
    session.payment_status === "paid" ||
    eventType === "checkout.session.async_payment_succeeded";

  // 1) pedidoId
  let pedidoId: bigint | null = null;
  if (meta.pedidoId) { try { pedidoId = BigInt(meta.pedidoId); } catch {} }
  if (!pedidoId) {
    const bySession = await prisma.pedido.findFirst({
      where: { stripeSessionId: session.id as any },
      select: { pedidoId: true },
    });
    if (!bySession) { console.error("❌ Não encontrei Pedido:", session.id); return; }
    pedidoId = bySession.pedidoId;
  }

  // 2) Carrega pedido + usuário
  const pedido = await prisma.pedido.findUnique({
    where: { pedidoId },
    include: {
      itensPedido: { include: { produto: true } },
      usuario: { select: { usuarioId: true, email: true } },
    },
  });
  if (!pedido) { console.error("❌ Pedido não encontrado:", pedidoId.toString()); return; }

  // 3) completed porém não pago (boleto pendente)
  if (!isPaidNow) {
    if (pedido.statusPedido !== "pagamento_confirmado") {
      await prisma.pedido.update({
        where: { pedidoId },
        data: { statusPedido: "pagamento_pendente", updatedAt: new Date() },
      });
    }
    try {
      const email = pedido.usuario?.email || null;
      if (email) {
        const nomes = pedido.itensPedido.map(i => i.produto.nome);
        await sendPaymentPending(email, nomes);
      }
    } catch (e) { console.error("⚠️ Falha ao enviar e-mail pendente:", e); }
    console.log(`🕒 Pagamento pendente para pedido ${pedidoId}.`);
    return;
  }

  // 4) evita duplicidade
  if (pedido.statusPedido === "pagamento_confirmado") {
    console.log(`Pedido ${pedidoId} já está pago. Ignorando repetição.`);
    return;
  }

  // 5) marca como pago
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  await prisma.pedido.update({
    where: { pedidoId },
    data: { statusPedido: "pagamento_confirmado", updatedAt: new Date() },
  });
  console.log(`✅ Pedido ${pedidoId} marcado como pago. PI=${paymentIntentId}`);

  // 6) e-mail de confirmação
  try {
    const email = pedido.usuario?.email || null;
    if (email) {
      const nomes = pedido.itensPedido.map(i => i.produto.nome);
      await sendPaymentConfirmed(email, nomes);
    }
  } catch (e) { console.error("⚠️ Falha ao enviar e-mail de confirmação:", e); }

  // 7) obter orders do ME (Shipment -> fallback cartItemId)
  const ships = await prisma.shipment.findMany({
    where: { pedidoId },
    select: { melhorEnvioOrderId: true },
  });
  const orders: string[] = ships.map(s => s.melhorEnvioOrderId).filter((v): v is string => Boolean(v));
  if (!orders.length && pedido.cartItemId) orders.push(pedido.cartItemId);
  if (!orders.length) { console.warn("⚠️ Sem melhorEnvioOrderId/cartItemId; pulando compra/geração."); return; }
  console.log("→ Usando orders:", orders);

  // 8) COMPRA (checkout) + persistTracking
  try {
    if (!ME_BASE || !ME_TOKEN) { console.warn("ME: BASE/TOKEN ausente; pulando."); return; }

    // sanity do token
    const meRes = await fetch(`${ME_BASE}/me`, { headers: meHeaders(), cache: "no-store" });
    if (!meRes.ok) { console.error("ME /me FAIL:", meRes.status, (await meRes.text()).slice(0,200)); return; }

    const coRes = await fetch(`${ME_BASE}/me/shipment/checkout`, {
      method: "POST", headers: meHeaders(), body: JSON.stringify({ orders }),
    });
    const coTxt = await coRes.text();
    let coJson:any; try { coJson = JSON.parse(coTxt); } catch { coJson = { raw: coTxt }; }
    if (!coRes.ok) { console.error("ME checkout FAIL:", coRes.status, coJson); return; }

    const purchased: string[] = (coJson?.purchase?.orders || []).map((o: any) => o.id);
    const purchaseStatus: string = coJson?.purchase?.status ?? "paid";
    console.log("✓ Fretes comprados:", purchased);

    await Promise.all(purchased.map(id =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: id },
        update: { status: purchaseStatus, updatedAt: new Date() },
        create: { pedidoId, melhorEnvioOrderId: id, status: purchaseStatus, etiquetaUrl: "" },
      })
    ));

    // tracking após a compra (pode ou não existir ainda)
    await persistTracking(purchased);

    // 9) GERAR ETIQUETA + persistTracking novamente
    if (purchased.length) {
      const genRes = await fetch(`${ME_BASE}/me/shipment/generate`, {
        method: "POST",
        headers: meHeaders(),
        body: JSON.stringify({ orders: purchased }),
      });
      const genTxt = await genRes.text();
      let genJson:any; try { genJson = JSON.parse(genTxt); } catch { genJson = { raw: genTxt }; }

      if (!genRes.ok) {
        console.error("ME generate FAIL:", genRes.status, genJson);
      } else {
        console.log("✓ Etiquetas geradas:", (genJson?.generate?.orders || purchased));

        // salva status e URL pública de impressão
        const publicPrintUrl = buildPublicPrintUrl(ME_BASE, purchased);
        await Promise.all(purchased.map(id =>
          prisma.shipment.update({
            where: { melhorEnvioOrderId: id },
            data: {
              status: "generated",
              etiquetaUrl: publicPrintUrl, // link público de impressão
              updatedAt: new Date(),
            },
          })
        ));

        // tenta tracking de novo (muitas vezes aparece só após generate)
        await persistTracking(purchased);
      }
    }

    console.log(`✅ Frete + etiqueta processados para pedido ${pedidoId}`);
  } catch (err) {
    console.error("❌ Falha no fluxo de frete/etiqueta:", err);
  }
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
  let pedidoId: bigint | null = null;
  if (session.metadata?.pedidoId) { try { pedidoId = BigInt(session.metadata.pedidoId); } catch {} }
  if (!pedidoId) {
    const bySession = await prisma.pedido.findFirst({
      where: { stripeSessionId: session.id as any },
      select: { pedidoId: true },
    });
    if (!bySession) { console.error("❌ async_payment_failed: pedido não encontrado:", session.id); return; }
    pedidoId = bySession.pedidoId;
  }

  await prisma.pedido.update({
    where: { pedidoId },
    data: { statusPedido: "pagamento_falhou", updatedAt: new Date() },
  });

  console.log(`⛔ Pagamento falhou (boleto) para pedido ${pedidoId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`);
}
