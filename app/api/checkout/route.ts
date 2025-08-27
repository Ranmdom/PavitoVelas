// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import crypto from "crypto";
import { insertFreteNoCarrinho } from "@/lib/insertInCart";

export const runtime = "nodejs";

const APP_HOST = new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").hostname;
const SUPABASE_HOST   = "zgtqpisusyupfcegrcnh.supabase.co";
const SUPABASE_BUCKET = "produtos";

const BodySchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^\d+$/),
      quantity: z.number().int().min(1).max(50),
    })
  ).min(1).max(100),
  shippingToken: z.string().min(16),
  address: z.object({
    cep: z.string().min(8),
    logradouro: z.string().min(1),
    numero: z.string().min(1),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().length(2),
  }).optional(),
});

// ---------- helpers ----------
function verifyShippingToken(
  token: string,
  expect: { uid: string; items: {id:string;quantity:number}[]; postalCode: string }
) {
  const SECRET = process.env.SHIPPING_TOKEN_SECRET!;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) throw new Error("Invalid token");
  const mac = crypto.createHmac("sha256", SECRET).update(b64).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(mac, "hex"))) {
    throw new Error("Bad signature");
  }

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
  return p;
}

function safeImages(urls?: string[] | null) {
  const out: string[] = [];
  for (const raw of urls || []) {
    try {
      const u = new URL(raw);
      if (u.protocol !== "https:") continue;
      const isSupabasePublic =
        u.hostname === SUPABASE_HOST &&
        u.pathname.startsWith(`/storage/v1/object/public/${SUPABASE_BUCKET}/`);
      if (!isSupabasePublic) continue;
      const cleanPath = u.pathname.split("/").map(seg => encodeURIComponent(decodeURIComponent(seg))).join("/");
      u.pathname = cleanPath;
      u.hash = "";
      out.push(u.toString());
    } catch {/* ignore */}
  }
  return out.slice(0, 1);
}

// ---------- rota ----------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.id;

    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { items, shippingToken, address } = parsed.data;

    // fonte da verdade
    const ids = Array.from(new Set(items.map(i => BigInt(i.id))));
    const produtos = await prisma.produto.findMany({
      where: { produtoId: { in: ids }, deletedAt: null },
      select: { produtoId: true, nome: true, preco: true, imagens: true, estoque: true, altura: true, largura: true, peso: true },
    });
    const byId = new Map(produtos.map(p => [p.produtoId.toString(), p]));

    for (const i of items) {
      const p = byId.get(i.id);
      if (!p) return NextResponse.json({ error: `Produto ${i.id} indisponível` }, { status: 400 });
      const available = typeof p.estoque === "number" ? p.estoque : 1;
      if (i.quantity > available) {
        return NextResponse.json({ error: `Estoque insuficiente para ${p.nome}` }, { status: 400 });
      }
    }

    const tok = verifyShippingToken(shippingToken, {
      uid: session.user.id,
      items,
      postalCode: address?.cep || "",
    });

    const shippingName  = tok.name;
    const shippingCents = tok.priceCents;

    const cartItems = items.map(i => {
      const p = byId.get(i.id)!;
      const priceCents = Math.round(Number(p.preco) * 100);
      return {
        id: i.id,
        name: p.nome,
        quantity: i.quantity,
        priceCents,
        images: safeImages(p.imagens),
      };
    });

    // totais
    const productsTotalCents = cartItems.reduce((acc, it) => acc + it.priceCents * it.quantity, 0);
    const totalCents = productsTotalCents + shippingCents;
    const toDecimal = (cents: number) => (cents / 100).toFixed(2);

    // --- chave de idempotência CANÔNICA (ordena e versiona) ---
    const canonicalCart = [...cartItems]
      .map(it => ({ id: it.id, q: it.quantity, c: it.priceCents }))
      .sort((a,b)=> Number(a.id) - Number(b.id));

    const idemPayload = {
      v: 1,
      u: userId,
      host: APP_HOST,
      cart: canonicalCart,
      ship: { name: shippingName, c: shippingCents },
    };
    const idemKey = crypto.createHash("sha256").update(JSON.stringify(idemPayload)).digest("hex");

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

    // === 1) CRIA A SESSÃO (Stripe cuida da idempotência) ===
    const stripeSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card", "boleto"],
        payment_method_options: { boleto: { expires_after_days: 3 } },
        line_items: [
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
        ],
        success_url: `${BASE_URL}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/carrinho`,
        locale: "pt-BR",
        customer_email: session.user.email || undefined,
        metadata: {
          clientToken: idemKey,
          userId,
          items: JSON.stringify(cartItems.map(it => ({ id: it.id, quantity: it.quantity }))),
        },
      },
      { idempotencyKey: idemKey }
    );

    // === 2) Reusa/Cria Pedido pelo stripeSessionId ===
    const existing = await prisma.pedido.findFirst({
      where: { stripeSessionId: stripeSession.id as any },
      select: { pedidoId: true },
    });

    const pedido = existing
      ? await prisma.pedido.update({
          where: { pedidoId: existing.pedidoId },
          data: {
            valorTotal: toDecimal(totalCents),
            statusPedido: "pendente",
          },
        })
      : await prisma.pedido.create({
          data: {
            usuarioId: BigInt(userId),
            statusPedido: "pendente",
            valorTotal: toDecimal(totalCents),
            stripeSessionId: stripeSession.id,
            // guarda idemKey por enquanto (o helper troca para o orderId do ME)
            cartItemId: idemKey,
            itensPedido: {
              create: cartItems.map(it => ({
                quantidade: it.quantity,
                precoUnitario: toDecimal(it.priceCents),
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

    // === 2.1) INSERIR FRETE NO CARRINHO (via helper) — não bloqueia o checkout
    try {
      if (tok.svc == null) {
        console.warn("ME: token de frete sem serviceId; pulando inserção no carrinho");
      } else {
        await insertFreteNoCarrinho({
          pedidoId: pedido.pedidoId,              // BigInt
          userId: BigInt(userId),
          serviceId: Number(tok.svc),
          items,
          toAddress: address,
        });
        console.log("ME: inserido no carrinho e salvo (orderId gravado em Pedido/Shipments).");
      }
    } catch (e) {
      console.warn("⚠️ Inserção no carrinho ME falhou (segue checkout):", e);
    }

    // (Opcional) Atualiza metadata da sessão com o pedidoId para facilitar o webhook
    try {
      await stripe.checkout.sessions.update(stripeSession.id, {
        metadata: { ...(stripeSession.metadata || {}), pedidoId: String(pedido.pedidoId) },
      });
    } catch { /* segue o jogo */ }

    return NextResponse.json({ url: stripeSession.url, pedidoId: String(pedido.pedidoId) });
  } catch (err: any) {
    console.error("Erro ao criar checkout:", err?.message || err);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}
