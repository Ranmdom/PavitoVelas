// pages/api/checkout.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Usando o client Stripe já inicializado
const stripeClient: Stripe = stripe;

// Tipagem para itens do checkout
interface CheckoutItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
}
interface CheckoutRequestBody {
  items: CheckoutItem[];
  userId?: string;
  postalCode: string;
  shippingServiceId: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      items,
      userId,
      postalCode,
      shippingServiceId,
    }: CheckoutRequestBody = await req.json();

    // Validações
    if (!items || items.length === 0)
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    if (!postalCode || postalCode.length < 8)
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });

    const sessionLogin = await getServerSession(authOptions);
    if (!sessionLogin?.user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // 1) Cria pedido no banco (sem frete)
    const totalProducts = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const novoPedido = await prisma.pedido.create({
      data: {
        usuario: { connect: { usuarioId: sessionLogin.user.id } },
        valorTotal: Math.round(totalProducts),
        statusPedido: "pendente",
        itensPedido: {
          create: items.map((item) => ({
            quantidade: item.quantity,
            precoUnitario: Math.round(item.price),
            produto: { connect: { produtoId: item.id } },
          })),
        },
      },
    });

    // 2) Cotação de frete no Melhor Envio
    const meCalcRes = await fetch(
      "https://api.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          from: { postal_code: "96020360" },
          to: { postal_code: postalCode },
          products: items.map((i) => ({
            id: i.id,
            width: i.width,
            height: i.height,
            length: i.length,
            weight: i.weight,
            insurance_value: i.insurance_value,
            quantity: i.quantity,
          })),
          options: { receipt: false, own_hand: false },
          services: shippingServiceId,
        }),
      }
    );
    const meCalcJson = await meCalcRes.json();
    const pkg = meCalcJson.packages.find(
      (p: any) => String(p.service) === String(shippingServiceId)
    );
    if (!pkg)
      return NextResponse.json(
        { error: "Serviço de frete inválido" },
        { status: 400 }
      );

    // 3) Monta line_items com tipagem Stripe
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const imageUrl = item.image?.startsWith("http")
          ? item.image
          : `${origin}${item.image}`;
        return {
          price_data: {
            currency: "brl",
            product_data: {
              name: item.name,
              images: [imageUrl].filter(Boolean) as string[],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      }
    );

    // Frete como item separado
    lineItems.push({
      price_data: {
        currency: "brl",
        product_data: {
          name: `Frete (${pkg.service})`,
          images: [], // imagens opcionais para frete
        },
        unit_amount: Math.round(pkg.price * 100),
      },
      quantity: 1,
    });

    // 4) Cria sessão Stripe
    const session = await stripeClient.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/carrinho`,
        metadata: {
          pedidoId: novoPedido.pedidoId.toString(),
          me_cart_payload: JSON.stringify({
            from: { postal_code: "96020360" },
            to: { postal_code: postalCode },
            volumes:
              pkg.volumes ||
              (pkg.dimensions
                ? [
                    {
                      height: pkg.dimensions.height,
                      width: pkg.dimensions.width,
                      length: pkg.dimensions.length,
                      weight: pkg.weight,
                    },
                  ]
                : []),
            service: pkg.service,
            options: {
              insurance_value: pkg.insurance_value,
              receipt: false,
              own_hand: false,
              invoice: { key: "00011122233344445555" },
              platform: "Minha Loja",
            },
          }),
        },
        shipping_address_collection: { allowed_countries: ["BR"] },
        locale: "pt-BR",
      }
    );

    // 5) Atualiza pedido com sessionId
    await prisma.pedido.update({
      where: { pedidoId: novoPedido.pedidoId },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json(
      { error: "Erro ao processar checkout" },
      { status: 500 }
    );
  }
}
