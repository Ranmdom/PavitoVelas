// app/api/melhorEnvio/gerarEtiquetas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders, extractTracking } from "@/lib/melhorEnvio";

const MELHOR_BASE = `${process.env.BASEURL_MELHOR_ENVIO}`;
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;

export async function POST(req: NextRequest) {
  const { pedidoId, shipments: shipmentIds }: { pedidoId: string; shipments: string[] } = await req.json();

  // 1) gerar etiqueta
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
  console.log("📦 ME /generate ->", JSON.stringify(data));

  // 2) normalizar o retorno (aceitar ambos os shapes)
  // a) shape antigo: { shipments: [{ id, label_url?, status? }, ...] }
  let normalized: Array<{ id: string; label_url?: string | null; status?: string | null }> = [];
  if (Array.isArray((data as any).shipments)) {
    normalized = (data as any).shipments.map((s: any) => ({
      id: s.id,
      label_url: s.label_url ?? s.url ?? s.label?.url ?? null,
      status: s.status ?? null,
    }));
  } else {
    // b) shape novo: { generate_key, "<id>": { message, status } ... }
    // nesse caso usamos os ids que enviamos e, por ora, não há label_url no payload
    normalized = shipmentIds.map((id) => ({
      id,
      label_url: null,
      status: (data as any)?.[id]?.status ? "label_generating" : null,
    }));
  }

  if (!resp.ok || !normalized.length) {
    console.error("❌ /generate sem itens normalizados:", resp.status, data);
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  // 3) salvar status e tentar label_url (se tiver) para cada shipment
  await Promise.all(
    normalized.map((s) =>
      prisma.shipment.update({
        where: { melhorEnvioOrderId: s.id },
        data: {
          etiquetaUrl: s.label_url ?? undefined,    // não sobrescreve com null
          status:      s.status ?? "label_generated",
          updatedAt:   new Date(),
        },
      })
    )
  );

  // 4) tentar pegar tracking imediatamente via /shipment/tracking
  try {
    const trackingArr = await fetchTrackingForOrders(normalized.map((s) => s.id));
    await Promise.all(
      trackingArr.map((t: any) => {
        const { code, url, carrier } = extractTracking(t);
        return prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode:    code ?? undefined,
            trackingUrl:     url ?? undefined,
            trackingCarrier: carrier ?? undefined,
            updatedAt:       new Date(),
          },
        });
      })
    );
  } catch (e) {
    console.warn("📭 tracking ainda não disponível logo após /generate:", e);
  }

  return NextResponse.json({
    shipments: normalized,
    generate_key: (data as any).generate_key ?? null,
  });
}
