import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MELHOR_BASE = "https://sandbox.melhorenvio.com.br/api/v2";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!;

export async function POST(req: NextRequest) {
  const { pedidoId, shipments: shipmentIds }: { pedidoId: string; shipments: string[] } = await req.json();
  const pedidoIdBigInt = BigInt(pedidoId); // (não é usado aqui, mas ok manter se quiser logar/validar)

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
  console.log("📦 MelhorEnvio /generate ->", JSON.stringify(data));

  if (!resp.ok || !Array.isArray(data.shipments)) {
    console.error("❌ /shipment/generate sem `shipments`:", resp.status, data);
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  // 2) atualizar cada shipment com a URL da etiqueta e status retornado
  await Promise.all(
    data.shipments.map((s: any) => {
      const labelUrl =
        s.label_url ??
        s.url ??
        s.label?.url ??
        null;

      return prisma.shipment.update({
        where: { melhorEnvioOrderId: s.id },
        data: {
          etiquetaUrl: labelUrl ?? undefined,
          status: s.status ?? "label_generated",
          updatedAt: new Date(),
        },
      });
    })
  );

  // 3) (opcional) tentar enriquecer tracking imediatamente após geração
  //    (o webhook do ME ainda é quem "garante" quando o tracking sair)
  // await Promise.all(
  //   data.shipments.map(async (s: any) => {
  //     const r = await fetch(`${MELHOR_BASE}/me/orders/${s.id}`, {
  //       headers: { Accept: "application/json", Authorization: `Bearer ${TOKEN}`, "User-Agent": "PavitoVelas (suporte@pavito.com)" },
  //     });
  //     if (!r.ok) return;
  //     const order = await r.json();
  //     await prisma.shipment.update({
  //       where: { melhorEnvioOrderId: s.id },
  //       data: {
  //         trackingCode: order?.tracking ?? undefined,
  //         trackingCarrier: (order?.service?.company?.name ?? order?.company?.name) ?? undefined,
  //         trackingUrl: order?.tracking_url ?? undefined,
  //       },
  //     });
  //   })
  // );

  return NextResponse.json({
    shipments: data.shipments.map((s: any) => ({
      id: s.id,
      label_url: s.label_url ?? s.url ?? s.label?.url ?? null,
      status: s.status ?? "label_generated",
    })),
  });
}
