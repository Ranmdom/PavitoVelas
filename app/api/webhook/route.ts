export const runtime = 'node'

// app/api/webhook/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

// Desativar o bodyParser para webhooks do Stripe
export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: ReadableStream) {
  const reader = readable.getReader()
  const chunks = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(typeof value === "string" ? Buffer.from(value) : value)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Método não permitido" }, { status: 405 })
  }

  const buf = await buffer(req.body as ReadableStream)
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (err: any) {
    console.error(`Erro na assinatura do webhook: ${err.message}`)
    return NextResponse.json({ error: `Erro na assinatura do webhook` }, { status: 400 })
  }

  // Processar eventos do Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Evento não processado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata!;
  const pedidoId = BigInt(meta.pedidoId!);
  const userId   = meta.userId ? BigInt(meta.userId) : null;
  const quoteId  = meta.shippingOptionId!; // string

  if (!userId) {
    console.log("Pedido sem usuário autenticado, pulando geração de etiqueta");
    return;
  }

  // 1) Atualiza status do pedido
  await prisma.pedido.update({
    where: { pedidoId },
    data: {
      statusPedido: "pagamento_confirmado",
      updatedAt:    new Date(),
    },
  });
  console.log(`Pedido ${pedidoId} marcado como pago.`);

  // 2) Gera etiqueta no Melhor Envio
  try {
    const resp = await fetch(
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/generate",
      {
        method: "POST",
        headers: {
          "Accept":        "application/json",
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
          "User-Agent":    "PavitoVelas (suporte@pavito.com)",
        },
        body: JSON.stringify({ orders: [quoteId] }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      console.error("❌ Erro MelhorEnvio:", data);
      return;
    }

    // 3) Persiste o Shipment no banco
    const ship = data.shipments[0];
    await prisma.shipment.create({
      data: {
        pedidoId,
        melhorEnvioQuoteId: parseInt(quoteId, 10),
        melhorEnvioOrderId: ship.id,
        etiquetaUrl:        ship.label_url,
        status:             ship.status,
      },
    });

    console.log(
      `Etiqueta gerada e salva para pedido ${pedidoId}: shipmentId=${ship.id}`
    );
  } catch (err) {
    console.error("❌ Falha ao gerar etiqueta:", err);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Implementação adicional se necessário
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`)
}
