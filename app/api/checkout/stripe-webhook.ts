import { buffer } from 'micro';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

// Inicializa cliente Stripe com versão padrão
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: any, res: any) {
  try {
    // Verificação de assinatura
    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);
    const event = stripeClient.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Recupera payload ME do metadata
      const payload = JSON.parse(session.metadata?.me_cart_payload as string);

      // 1) Reserva o frete
      await fetch('https://api.melhorenvio.com.br/api/v2/me/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      // 2) Paga o frete (debita da sua carteira ME)
      await fetch('https://api.melhorenvio.com.br/api/v2/me/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ type: 'balance' }),
      });

      // 3) Fecha ('checkout') todos os envios no carrinho
      await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
      });

      // 4) Geração de etiquetas
      // Busca lista de envios pendentes no carrinho
      const cartResp = await fetch('https://api.melhorenvio.com.br/api/v2/me/cart', {
        headers: { Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}` },
      });
      const cartItems = await cartResp.json();

      // Gera etiqueta PDF para cada envio
      for (const shipment of cartItems) {
        const labelRes = await fetch(
          `https://api.melhorenvio.com.br/api/v2/me/shipment/${shipment.id}/label`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
            },
          }
        );
        const arrayBuffer = await labelRes.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Salva o arquivo na pasta 'labels'
        const labelsDir = path.resolve(process.cwd(), 'labels');
        if (!fs.existsSync(labelsDir)) fs.mkdirSync(labelsDir);
        const filePath = path.join(labelsDir, `${shipment.id}.pdf`);
        fs.writeFileSync(filePath, fileBuffer);
        console.log(`Etiqueta ${shipment.id} salva em ${filePath}`);
      }

      // 5) Atualiza status do pedido no banco
      const pedidoId = session.metadata?.pedidoId;
      if (pedidoId) {
        await prisma.pedido.update({
          where: { pedidoId: Number(pedidoId) },
          data: { statusPedido: 'pago' },
        });
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}