// app/api/melhorEnvio/gerarEtiquetas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders, extractTracking } from "@/lib/melhorEnvio";

const MELHOR_BASE = "https://sandbox.melhorenvio.com.br/api/v2";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!;

export async function POST(req: NextRequest) {
  const { pedidoId, shipments: shipmentIds }: { pedidoId: string; shipments: string[] } = await req.json();
  // const pedidoIdBigInt = BigInt(pedidoId); // use se precisar

  // 1) gerar etiqueta no Melhor Envio
  const resp = await fetch(`${MELHOR_BASE}/me/shipment/generate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent": "PavitoVelas (suporte@pavito.com)",
    },
    body: JSON.stringify({ orders: shipmentIds }),
  });

  const data = await resp.json();
  console.log("📦 MelhorEnvio /generate ->", JSON.stringify(data));

  if (!resp.ok || !Array.isArray(data.shipments)) {
    console.error("❌ /shipment/generate sem `shipments`:", resp.status, data);
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  // 2) salvar label_url e status de cada shipment
  await Promise.all(
    data.shipments.map((s: any) => {
      const labelUrl = s.label_url ?? s.url ?? s.label?.url ?? null;
      return prisma.shipment.update({
        where: { melhorEnvioOrderId: s.id },
        data: {
          etiquetaUrl: labelUrl ?? undefined,
          status:      s.status ?? "label_generated",
          updatedAt:   new Date(),
        },
      });
    })
  );

  // 3) tentar pegar tracking imediatamente (uma única chamada)
  try {
    const ids = data.shipments.map((s: any) => s.id);
    const trackingArr = await fetchTrackingForOrders(ids); // retorna array (shape pode variar)

    await Promise.all(
      trackingArr.map((t: any) => {
        const { code, url, carrier } = extractTracking(t);
        return prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode:    code ?? undefined,
            trackingUrl:     url ?? undefined,
            trackingCarrier: carrier ?? undefined,
            // mantém status "label_generated"
            updatedAt:       new Date(),
          },
        });
      })
    );
  } catch (e) {
    console.warn("📭 Tracking ainda não disponível após geração:", e);
    // tudo bem: o webhook do ME completará depois
  }

  return NextResponse.json({
    shipments: data.shipments.map((s: any) => ({
      id: s.id,
      label_url: s.label_url ?? s.url ?? s.label?.url ?? null,
      status: s.status ?? "label_generated",
    })),
  });
}
