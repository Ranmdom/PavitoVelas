import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    // 1) Recebe items, shipping selecionado e userId
    const { items, userId, shipping, address } = await req.json() as {
      items: Array<{ id: string; quantity: number; price: number; name: string; image?: string }>;
      userId?: string;
      shipping: { name: string; price: number };
      address?: { cep: string; logradouro: string; numero: string; bairro: string; cidade: string; estado: string };
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    // 2) Autentica usuário
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // 3) Calcula valor total (produtos + frete)
    const productsTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalWithShipping = productsTotal + shipping.price

    // 4) Cria pedido no banco
    const novoPedido = await prisma.pedido.create({
      data: {
        usuario: { connect: { usuarioId: BigInt(session.user.id) } },
        valorTotal: Math.round(totalWithShipping),
        statusPedido: "pendente",
        itensPedido: {
          create: items.map(item => ({
            quantidade: item.quantity,
            precoUnitario: Math.round(item.price),
            produto: { connect: { produtoId: BigInt(item.id) } }
          }))
        },
        EnderecoPedido: {
          create: {
            cep: address?.cep,
            logradouro: address?.logradouro,
            numero: address?.numero,
            bairro: address?.bairro,
            cidade: address?.cidade,
            estado: address?.estado
          }
        }
      }
    })

    // 5) Monta line items para Stripe
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const lineItems = items.map(item => {
      // Garante URL válida ou array vazio, utilizando URL constructor
      let images: string[] = []
      if (item.image) {
        try {
          const imageUrl = new URL(item.image, origin).toString()
          images = [imageUrl]
        } catch {
          // imagem inválida, mantemos array vazio
          images = []
        }
      }

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            images
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      }
    })

    // Adiciona o frete como um item separado no Stripe
    lineItems.push({
      price_data: {
        currency: "brl",
        product_data: {
          name: `Frete - ${shipping.name}`,
          images: [] // Stripe exige array de imagens mesmo que vazio
        },
        unit_amount: Math.round(shipping.price * 100)
      },
      quantity: 1
    })

    // 6) Cria sessão de checkout Stripe com produtos + frete
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho`,
      metadata: {
        pedidoId: novoPedido.pedidoId.toString(),
        userId: session.user.id,
        items: JSON.stringify(
          items.map(p => ({
          id: p.id,
          quantity: p.quantity
        }))
  )
      },
      locale: "pt-BR"
    })

    // 7) Atualiza pedido com session id do Stripe
    await prisma.pedido.update({
      where: { pedidoId: novoPedido.pedidoId },
      data: { stripeSessionId: stripeSession.id }
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
