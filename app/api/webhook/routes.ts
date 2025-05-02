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
  // Extrair metadados da sessão
  const metadata = session.metadata
  if (!metadata || !metadata.items) {
    console.error("Metadados ausentes na sessão de checkout")
    return
  }

  const items = JSON.parse(metadata.items)
  const userId = metadata.userId ? BigInt(metadata.userId) : null

  // Se não houver usuário, não podemos criar um pedido no banco
  if (!userId) {
    console.log("Pedido de usuário não autenticado")
    return
  }

  try {
    // Criar um novo pedido no banco de dados
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId: userId,
        statusPedido: "Pagamento confirmado",
        valorTotal: Number(session.amount_total) / 100, // Converter de centavos para reais
        itensPedido: {
          create: await Promise.all(
            items.map(async (item: { id: string; quantity: number }) => {
              // Buscar informações do produto
              const produto = await prisma.produto.findUnique({
                where: { produtoId: BigInt(item.id) },
              })

              if (!produto) {
                throw new Error(`Produto não encontrado: ${item.id}`)
              }

              return {
                produtoId: BigInt(item.id),
                quantidade: item.quantity,
                precoUnitario: Number(produto.preco),
              }
            }),
          ),
        },
        pagamentos: {
          create: {
            metodoPagamentoId: BigInt(1), // ID padrão para pagamentos Stripe
            valor: Number(session.amount_total) / 100,
            statusPagamento: "Confirmado",
          },
        },
      },
    })

    console.log(`Pedido criado com sucesso: ${pedido.pedidoId}`)
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Implementação adicional se necessário
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`)
}
