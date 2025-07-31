export const runtime = 'nodejs'

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
  const meta     = session.metadata!
  const pedidoId = BigInt(meta.pedidoId!)
  const userId   = meta.userId ? BigInt(meta.userId) : null
  const BASE     = process.env.API_URL! // ex: https://meuapp.com

  console.log("WEBHOOK RECEBIDO:", session.id, session.metadata)

  if (!userId) {
    console.log("Pedido sem usuário, abortando etiqueta.")
    return
  }

  // 1) Marca pagamento confirmado
  await prisma.pedido.update({
    where: { pedidoId },
    data: {
      statusPedido: "pagamento_confirmado",
      updatedAt:    new Date(),
    },
  })
  console.log(`Pedido ${pedidoId} marcado como pago.`)

  // 2) Busca o cartItemId salvo no Pedido
  const pedidoRecord = await prisma.pedido.findUnique({
    where:  { pedidoId },
    select: { cartItemId: true },
  })
  if (!pedidoRecord?.cartItemId) {
    console.error("❌ Pedido sem cartItemId no banco")
    return
  }
  const orders = [pedidoRecord.cartItemId]
  console.log("→ Usando orders:", orders)

  // 3) Chama rota interna de compra de frete
  let coJson: any
  try {
    const co = await fetch(`${BASE}/api/melhorEnvio/compraEtiquetas`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ pedidoId: pedidoId.toString(), orders }),
    })
    const coText = await co.text()
    try {
      coJson = JSON.parse(coText)
    } catch {
      console.error("❌ /checkout não retornou JSON:", co.status, coText)
      return
    }
    if (!co.ok) {
      console.error("❌ Erro no checkout interno:", co.status, coJson)
      return
    }
  } catch (err) {
    console.error("❌ Falha ao chamar /api/melhorEnvio/checkout:", err)
    return
  }

  const shipments: Array<{ id: string }> = coJson.shipments
  console.log("✓ Fretes comprados:", shipments)

  // 4) Chama rota interna de geração de etiqueta
  try {
    const gen = await fetch(`${BASE}/api/melhorEnvio/gerarEtiquetas`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        pedidoId:  pedidoId.toString(),
        shipments: shipments.map(s => s.id),
      }),
    })
    const genText = await gen.text()
    let genJson: any
    try {
      genJson = JSON.parse(genText)
    } catch {
      console.error("❌ /generate não retornou JSON:", gen.status, genText)
      return
    }
    if (!gen.ok) {
      console.error("❌ Erro na geração interna:", gen.status, genJson)
      return
    }
    console.log("✓ Etiquetas geradas:", genJson.shipments)
  } catch (err) {
    console.error("❌ Falha ao chamar /api/melhorEnvio/generate:", err)
    return
  }

  console.log(`✅ Frete e etiquetas processados para pedido ${pedidoId}`)
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Implementação adicional se necessário
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`)
}
