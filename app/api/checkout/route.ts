import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma" 
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const { items, userId } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    const sessionLogin = await getServerSession(authOptions);
    if (!sessionLogin?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }


    
    const novoPedido = await prisma.pedido.create({
      data: {
        usuario: { connect: { usuarioId: sessionLogin.user.id } },
        valorTotal: Math.round(items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)),
        statusPedido: "PENDENTE",
        itensPedido: {
          create: items.map((item: any) => ({
            quantidade: item.quantity,
            precoUnitario: Math.round(item.price),
            produto: {
              connect: {
                produtoId: item.id,
              },
            },
          })),
        },
      },
    });

    // Criar os line items para o Stripe
    const lineItems = items.map((item: any) => {
      const imageUrl = item.image?.startsWith("http")
        ? encodeURI(item.image)
        : `${origin}${item.image}`;
    
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            images: [imageUrl],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });
    

    // Criar metadados para rastrear os itens do pedido
    const metadata: { items: string; userId?: string } = {
      items: JSON.stringify(
        items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      ),
    }

    // Se o usuário estiver logado, adicionar o ID do usuário aos metadados
    if (userId) {
      metadata.userId = userId
    }
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Criar a sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho`,
      metadata,
      shipping_address_collection: {
        allowed_countries: ["BR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "brl",
            },
            display_name: "Frete Grátis",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 10,
              },
            },
          },
        },
      ],
      locale: "pt-BR",
    })

    await prisma.pedido.update({
      where: { pedidoId: novoPedido.pedidoId },
      data: { stripeSessionId: session.id },
    });

    console.log("Sessão de checkout criada:", session)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error)
    console.log("Erro:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
