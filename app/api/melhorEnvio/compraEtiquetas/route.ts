// app/api/melhorEnvio/compraEtiquetas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders } from "@/lib/melhorEnvio";

const MELHOR_BASE = `${process.env.BASEURL_MELHOR_ENVIO}`;
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;

export async function POST(req: NextRequest) {
  const { pedidoId, orders }: { pedidoId: string; orders: string[] } = await req.json();
  const pedidoIdBigInt = BigInt(pedidoId);

  // 1) Checkout (compra)
  const resp = await fetch(`${MELHOR_BASE}/me/shipment/checkout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "PavitoVelas (suporte@pavito.com)",
    },
    body: JSON.stringify({ orders }),
  });

  const data: any = await resp.json();
  const ordersResp = data?.purchase?.orders; // geralmente [{ id, ... }, ...]
  if (!resp.ok || !Array.isArray(ordersResp)) {
    console.error("❌ Checkout erro:", resp.status, data);
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  const orderIds: string[] = ordersResp.map((o: any) => o.id);
  console.log("🧾 ME checkout => orderIds:", orderIds);

  // 2) Upsert dos Shipments (amarrando pedidoId + melhorEnvioOrderId)
  const createdOrUpdated = await Promise.all(
    orderIds.map((id) =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: id },
        update: {
          status: data?.purchase?.status ?? "paid",
          updatedAt: new Date(),
        },
        create: {
          pedidoId: pedidoIdBigInt,
          melhorEnvioOrderId: id,
          status: data?.purchase?.status ?? "paid",
          etiquetaUrl: "",
        },
      })
    )
  );

  // 3) (opcional) Tentativa inicial de descobrir transportadora/tracking
  //    Dica: tracking costuma vir só depois do /generate ou via webhook.
  try {
    const trackingArr = await fetchTrackingForOrders(orderIds);
    console.log("🔎 /shipment/tracking (compra):", trackingArr);

    await Promise.all(
      trackingArr.map((t: any) =>
        prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode:    t?.tracking ?? undefined,
            trackingUrl:     t?.tracking_url ?? undefined,
            trackingCarrier: t?.service?.company?.name ?? t?.company?.name ?? undefined,
            updatedAt:       new Date(),
          },
        })
      )
    );
  } catch (e) {
    console.warn("📭 Tracking ainda não disponível na COMPRA (normal):", e);
  }

  // 4) (opcional) GET /me/orders/{id} só pra preencher carrier se faltou
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
      const carrierName = order?.service?.company?.name ?? order?.company?.name ?? null;
      if (carrierName) {
        await prisma.shipment.update({
          where: { melhorEnvioOrderId: s.melhorEnvioOrderId },
          data: { trackingCarrier: carrierName, updatedAt: new Date() },
        });
      }
    })
  );

  return NextResponse.json({ shipments: orderIds.map((id) => ({ id })) });
}
