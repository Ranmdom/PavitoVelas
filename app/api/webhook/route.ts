// app/api/webhook/route.ts
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";
import { sendPaymentConfirmed, sendPaymentPending } from "../services/emailService";

// (opcional no App Router, deixei como estava)
export const config = {
  api: { bodyParser: false },
};

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

      // opcional: útil quando você precisa de garantias adicionais
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

/**
 * Trata tanto:
 *  - checkout.session.completed (cartão: geralmente já pago; boleto: pendente)
 *  - checkout.session.async_payment_succeeded (boleto compensado)
 */
async function handleCheckoutSession(session: Stripe.Checkout.Session, eventType: string) {
  const meta = session.metadata || {};
  const BASE = (process.env.API_URL)?.trim(); // ex.: https://meuapp.com

  console.log("WEBHOOK RECEBIDO:", session.id, meta, "event=", eventType, "status=", session.payment_status);

  // Está pago agora?
  const isPaidNow =
    session.payment_status === "paid" || eventType === "checkout.session.async_payment_succeeded";

  // 1) Descobrir pedidoId
  let pedidoId: bigint | null = null;
  if (meta.pedidoId) {
    try {
      pedidoId = BigInt(meta.pedidoId);
    } catch { /* ignore */ }
  }
  if (!pedidoId) {
    const bySession = await prisma.pedido.findFirst({
      where: { stripeSessionId: session.id as any },
      select: { pedidoId: true },
    });
    if (!bySession) {
      console.error("❌ Não encontrei Pedido por metadata nem por stripeSessionId:", session.id);
      return;
    }
    pedidoId = bySession.pedidoId;
  }

  // 2) Carregar pedido + usuário
  const pedido = await prisma.pedido.findUnique({
    where: { pedidoId },
    include: {
      itensPedido: { include: { produto: true } },
      usuario: { select: { usuarioId: true, email: true } },
    },
  });
  if (!pedido) {
    console.error("❌ Pedido não encontrado:", pedidoId.toString());
    return;
  }

  // 3) Se completed mas NÃO pago (caso boleto pendente)
  if (!isPaidNow) {
    // marca como pendente (se desejar)
    if (pedido.statusPedido !== "pagamento_confirmado") {
      await prisma.pedido.update({
        where: { pedidoId },
        data: { statusPedido: "pagamento_pendente", updatedAt: new Date() },
      });
    }

    // e-mail "pendente" se conseguir resolver email
    const email = pedido.usuario?.email || null;
    try {
      if (email) {
        const nomes = pedido.itensPedido.map((i) => i.produto.nome);
        await sendPaymentPending(email, nomes);
      }
    } catch (e) {
      console.error("⚠️ Falha ao enviar e-mail pendente:", e);
    }

    console.log(`🕒 Pagamento pendente (boleto) para pedido ${pedidoId}.`);
    return;
  }

  // 4) Se está pago agora: evita reprocessar
  if (pedido.statusPedido === "pagamento_confirmado") {
    console.log(`Pedido ${pedidoId} já está pago. Ignorando repetição.`);
    return;
  }

  // 5) Marca pagamento confirmado
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await prisma.pedido.update({
    where: { pedidoId },
    data: {
      statusPedido: "pagamento_confirmado",
      updatedAt: new Date(),
      // stripePaymentIntentId: paymentIntentId, // descomente se existir no schema
      // pagoEm: new Date(),
    },
  });
  console.log(`✅ Pedido ${pedidoId} marcado como pago.`);

  // 6) E-mail de confirmação (se tiver e-mail)
  try {
    const email = pedido.usuario?.email || null;
    if (email) {
      const nomes: string[] = pedido.itensPedido.map((i) => i.produto.nome);
      await sendPaymentConfirmed(email, nomes);
    }
  } catch (e) {
    console.error("⚠️ Falha ao enviar e-mail de confirmação:", e);
  }

  // 7) Fluxo de frete (opcional): exige cartItemId salvo no Pedido
  const pedidoRecord = await prisma.pedido.findUnique({
    where: { pedidoId },
    select: { cartItemId: true },
  });

  if (!pedidoRecord?.cartItemId) {
    console.warn("⚠️ Pedido sem cartItemId; pulando compra/geração de etiqueta.");
    return;
  }
  const orders = [pedidoRecord.cartItemId];
  console.log("→ Usando orders:", orders);

  // 8) Compra de etiquetas
  
  let coJson: any;
  try {
    const co = await fetch(`${BASE}/api/melhorEnvio/compraEtiquetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // <- sem x-internal-key
      body: JSON.stringify({ pedidoId: pedidoId.toString() }),
    });
    const coText = await co.text();
    try {
      coJson = JSON.parse(coText);
    } catch {
      console.error("❌ /compraEtiquetas não retornou JSON:", co.status, coText);
      return;
    }
    if (!co.ok) {
      console.error("❌ Erro na compra de etiquetas:", co.status, coJson);
      return;
    }
  } catch (err) {
    console.error("❌ Falha ao chamar /api/melhorEnvio/compraEtiquetas:", err);
    return;
  }

  const shipments: Array<{ id: string }> = coJson.shipments;
  console.log("✓ Fretes comprados:", shipments);

  // 9) Geração de etiquetas
  try {
    const gen = await fetch(`${BASE}/api/melhorEnvio/gerarEtiquetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedidoId: pedidoId.toString(),
        shipments: shipments.map((s) => s.id),
      }),
    });
    const genText = await gen.text();
    let genJson: any;
    try {
      genJson = JSON.parse(genText);
    } catch {
      console.error("❌ /gerarEtiquetas não retornou JSON:", gen.status, genText);
      return;
    }
    if (!gen.ok) {
      console.error("❌ Erro na geração de etiquetas:", gen.status, genJson);
      return;
    }
    console.log("✓ Etiquetas geradas:", genJson.shipments);
  } catch (err) {
    console.error("❌ Falha ao chamar /api/melhorEnvio/gerarEtiquetas:", err);
    return;
  }

  console.log(`✅ Frete e etiquetas processados para pedido ${pedidoId}`);
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  let pedidoId: bigint | null = null;

  if (meta.pedidoId) {
    try {
      pedidoId = BigInt(meta.pedidoId);
    } catch { /* ignore */ }
  }
  if (!pedidoId) {
    const bySession = await prisma.pedido.findFirst({
      where: { stripeSessionId: session.id as any },
      select: { pedidoId: true },
    });
    if (!bySession) {
      console.error("❌ async_payment_failed: não encontrei Pedido:", session.id);
      return;
    }
    pedidoId = bySession.pedidoId;
  }

  await prisma.pedido.update({
    where: { pedidoId },
    data: { statusPedido: "pagamento_falhou", updatedAt: new Date() },
  });

  console.log(`⛔ Pagamento falhou (boleto) para pedido ${pedidoId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // opcional: útil se você precisar conciliar por payment_intent fora do Checkout
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`);
}
