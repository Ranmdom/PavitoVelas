import { buffer } from "micro";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

// Removendo apiVersion para usar default do Stripe lib
const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export default async function handler(req: any, res: any) {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    const buf = await buffer(req);
    event = stripeClient.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const payload = JSON.parse(session.metadata?.me_cart_payload as string);

    // 1) Reserva o frete no Melhor Envio
    await fetch("https://api.melhorenvio.com.br/api/v2/me/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    // 2) Paga o frete
    await fetch("https://api.melhorenvio.com.br/api/v2/me/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ type: "balance" }),
    });

    // 3) Atualiza status do pedido no banco
    const pedidoId = session.metadata?.pedidoId;
    if (pedidoId) {
      await prisma.pedido.update({
        where: { pedidoId: Number(pedidoId) },
        data: { statusPedido: "pago" },
      });
    }
  }

  res.json({ received: true });
}