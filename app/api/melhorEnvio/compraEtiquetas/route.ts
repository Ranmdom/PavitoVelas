// app/api/melhorEnvio/compraEtiquetas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MELHOR_BASE = "https://sandbox.melhorenvio.com.br/api/v2"
const TOKEN       = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!

export async function POST(req: NextRequest) {
  const { pedidoId, orders }: { pedidoId: string; orders: string[] } = await req.json()
  const pedidoIdBigInt = BigInt(pedidoId)

  // 1⃣ chama o sandbox do MelhorEnvío
  const resp = await fetch(`${MELHOR_BASE}/me/shipment/checkout`, {
    method:  "POST",
    headers: {
      Accept:        "application/json",
      "Content-Type":"application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent":  "PavitoVelas (suporte@pavito.com)",
    },
    body: JSON.stringify({ orders }),
  })

 // 2) parse do JSON já testado anteriormente
  const data: any = await resp.json()

  const ordersResp = data.purchase?.orders
  if (!resp.ok || !Array.isArray(ordersResp)) {
    return NextResponse.json({ error: data }, { status: resp.status })
  }

  // usa upsert para criar ou atualizar
  const createdOrUpdated = await Promise.all(
    ordersResp.map((o: any) =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: o.id },
        update: {
          status: data.purchase.status,
          updatedAt: new Date(),
        },
        create: {
          pedidoId:           pedidoIdBigInt,
          melhorEnvioOrderId: o.id,
          status:             data.purchase.status,
          etiquetaUrl:        "", // placeholder
        },
      })
    )
  )

  // 3) enriquecer com dados da ordem (transportadora e, se já tiver, tracking)
  await Promise.all(
    createdOrUpdated.map(async (s) => {
      const r = await fetch(`${MELHOR_BASE}/me/orders/${s.melhorEnvioOrderId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${TOKEN}`,
          "User-Agent": "PavitoVelas (suporte@pavito.com)",
        },
        cache: "no-store",
      });

      if (!r.ok) return;
      const order = await r.json();

      const trackingCode = order?.tracking ?? null;
      const trackingUrl  = order?.tracking_url ?? null;
      const carrierName  = order?.service?.company?.name ?? order?.company?.name ?? null;

      await prisma.shipment.update({
        where: { melhorEnvioOrderId: s.melhorEnvioOrderId },
        data: {
          trackingCarrier: carrierName ?? undefined,
          trackingCode:    trackingCode ?? undefined,   // pode ainda não existir
          trackingUrl:     trackingUrl ?? undefined,
        },
      });
    })
  );


  // retorna a lista de ids
  return NextResponse.json({
    shipments: createdOrUpdated.map(s => ({ id: s.melhorEnvioOrderId })),
  })
}
