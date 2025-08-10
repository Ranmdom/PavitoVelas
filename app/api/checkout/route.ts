// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import crypto from "crypto";

export const runtime = "nodejs";

// Coloque isso perto do checkout
const APP_HOST = new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").hostname;

// 🔒 hardcoded do seu projeto Supabase:
const SUPABASE_HOST   = "zgtqpisusyupfcegrcnh.supabase.co";
const SUPABASE_BUCKET = "produtos";



// 1) O cliente só informa id/quantity (+ token de frete assinado)
const BodySchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^\d+$/),        // produtoId em string numérica
      quantity: z.number().int().min(1).max(50),
    })
  ).min(1).max(100),
  shippingToken: z.string().min(16),        // vamos exigir token assinado (mais seguro)
  address: z.object({
    cep: z.string().min(8),
    logradouro: z.string().min(1),
    numero: z.string().min(1),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().length(2),
  }).optional(),
});

// 2) valida token de frete (HMAC com expiração)
function verifyShippingToken(token: string, expect: { uid: string; items: {id:string;quantity:number}[]; postalCode: string }) {
  const SECRET = process.env.SHIPPING_TOKEN_SECRET!;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) throw new Error("Invalid token");

  const mac = crypto.createHmac("sha256", SECRET).update(b64).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(mac, "hex"))) throw new Error("Bad signature");

  const p = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as {
    uid: string; svc: number|null; name: string; priceCents: number; itemsDigest: string; pc: string; exp: number; v: number;
  };

  if (Date.now() > p.exp) throw new Error("Expired token");
  if (p.uid !== expect.uid) throw new Error("Token de outro usuário");
  const digestNow = crypto.createHash("sha256")
    .update([...expect.items].sort((a,b)=>a.id.localeCompare(b.id)).map(i=>`${i.id}x${i.quantity}`).join("|"))
    .digest("hex");
  if (digestNow !== p.itemsDigest) throw new Error("Carrinho alterado");
  if (p.pc !== expect.postalCode.replace(/\D/g, "")) throw new Error("CEP diferente");

  return p; // { name, priceCents, svc, ... }
}

  // 3) só permita imagens do seu domínio (ou CDN) para a Stripe

  function safeImages(urls?: string[] | null) {
    const out: string[] = [];
    for (const raw of urls || []) {
      try {
        const u = new URL(raw);                // garante URL absoluta
        if (u.protocol !== "https:") continue; // Stripe exige https

        // whitelist: só Supabase público no bucket certo
        const isSupabasePublic =
          u.hostname === SUPABASE_HOST &&
          u.pathname.startsWith(`/storage/v1/object/public/${SUPABASE_BUCKET}/`);
        if (!isSupabasePublic) continue;

        // ✨ saneia o path: encode de cada segmento (espaços, vírgulas, acentos…)
        const cleanPath = u.pathname
          .split("/")
          .map(seg => encodeURIComponent(decodeURIComponent(seg)))
          .join("/");
        u.pathname = cleanPath;
        u.hash = ""; // sem fragmentos

        out.push(u.toString()); // ex.: .../ChatGPT%20Image%2027%20de%20abr.%20de%202025,%2020_19_43.png
      } catch {
        /* ignora inválida */
      }
    }
    return out.slice(0, 1); 
  }

export async function POST(req: NextRequest) {
  try {
    // sessão
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.id;

    // body
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { items, shippingToken, address } = parsed.data;

    // produtos do banco (fonte da verdade)
    const ids = Array.from(new Set(items.map(i => BigInt(i.id))));
    const produtos = await prisma.produto.findMany({
      where: { produtoId: { in: ids }, deletedAt: null }, // sem soft-deleted
      select: { produtoId: true, nome: true, preco: true, imagens: true, estoque: true },
    });
    const byId = new Map(produtos.map(p => [p.produtoId.toString(), p]));

    // existência + estoque (se estoque for null, tratamos como 1 por default do schema)
    for (const i of items) {
      const p = byId.get(i.id);
      if (!p) return NextResponse.json({ error: `Produto ${i.id} indisponível` }, { status: 400 });
      const available = typeof p.estoque === "number" ? p.estoque : 1;
      if (i.quantity > available) {
        return NextResponse.json({ error: `Estoque insuficiente para ${p.nome}` }, { status: 400 });
      }
    }

    // frete confiável via token
    const tok = verifyShippingToken(shippingToken, {
      uid: session.user.id,
      items,
      postalCode: address?.cep || "", // ou o CEP que você usa
    });

    const shippingName  = tok.name;
    const shippingCents = tok.priceCents;

    // monta carrinho (preços em centavos para Stripe)
    const cartItems = items.map(i => {
      const p = byId.get(i.id)!;
      const priceCents = Math.round(Number(p.preco) * 100); // preco é Decimal(10,2)
      return {
        id: i.id,
        name: p.nome,
        quantity: i.quantity,
        priceCents,
        images: safeImages(p.imagens),
      };
    });

    const productsTotalCents = cartItems.reduce((acc, it) => acc + it.priceCents * it.quantity, 0);
    const totalCents = productsTotalCents + shippingCents;

    // cria pedido (gravando Decimal como string "xx.yy")
    const toDecimal = (cents: number) => (cents / 100).toFixed(2);

    const novoPedido = await prisma.pedido.create({
      data: {
        usuarioId: BigInt(userId),
        statusPedido: "pendente",
        valorTotal: toDecimal(totalCents), // Decimal(10,2)
        itensPedido: {
          create: cartItems.map(it => ({
            quantidade: it.quantity,
            precoUnitario: toDecimal(it.priceCents), // Decimal(10,2)
            produtoId: BigInt(it.id),
          })),
        },
        EnderecoPedido: address ? {
          create: [{
            cep: address.cep.replace(/\D/g, ""),
            logradouro: address.logradouro.trim(),
            numero: address.numero.trim(),
            bairro: address.bairro.trim(),
            cidade: address.cidade.trim(),
            estado: address.estado.toUpperCase(),
          }],
        } : undefined,
      },
    });

    // line_items para Stripe
    const lineItems = [
      ...cartItems.map(it => ({
        price_data: {
          currency: "brl",
          product_data: { name: it.name, images: it.images },
          unit_amount: it.priceCents,
        },
        quantity: it.quantity,
      })),
      {
        price_data: {
          currency: "brl",
          product_data: { name: `Frete - ${shippingName}`, images: [] },
          unit_amount: shippingCents,
        },
        quantity: 1,
      },
    ];

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

    // idempotência
    const idemKey = crypto.createHash("sha256")
      .update(JSON.stringify({ u: userId, c: cartItems.map(it => [it.id, it.quantity, it.priceCents]), s: [shippingName, shippingCents] }))
      .digest("hex");

    const stripeSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        success_url: `${BASE_URL}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/carrinho`,
        metadata: {
          pedidoId: String(novoPedido.pedidoId),
          userId,
          items: JSON.stringify(cartItems.map(it => ({ id: it.id, quantity: it.quantity }))),
        },
        locale: "pt-BR",
      },
      { idempotencyKey: idemKey }
    );

    await prisma.pedido.update({
      where: { pedidoId: novoPedido.pedidoId },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url, pedidoId: String(novoPedido.pedidoId) });
  } catch (err) {
    console.error("Erro ao criar checkout:", err);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}
