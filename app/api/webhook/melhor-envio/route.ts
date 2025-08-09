import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrder, verifyMESignature } from "@/lib/melhorEnvio";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-me-signature");
  const raw = await req.arrayBuffer();
  if (!(await verifyMESignature(raw, sig))) return new NextResponse("invalid signature", { status: 401 });

  const { event, data } = JSON.parse(Buffer.from(raw).toString("utf8")) as {
    event: string;
    data: { id: string; tracking?: string; tracking_url?: string };
  };

  if (!["order.generated", "order.posted", "order.delivered"].includes(event)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const order = await getOrder(data.id);
    const trackingCode = order?.tracking ?? data?.tracking ?? null;
    const trackingUrl  = order?.tracking_url ?? data?.tracking_url ?? null;
    const carrierName  = order?.service?.company?.name ?? order?.company?.name ?? null;

    // Atualiza pelo melhorEnvioOrderId (que você já salva ao comprar/gerar etiqueta)
    const shipment = await prisma.shipment.update({
      where: { melhorEnvioOrderId: data.id },
      data: {
        trackingCode: trackingCode ?? undefined,
        trackingCarrier: carrierName ?? undefined,
        trackingUrl: trackingUrl ?? undefined,
        status: event, // opcional: guardar último evento
      },
    });

    return NextResponse.json({ ok: true, shipmentId: shipment.shipmentId });
  } catch (e) {
    console.error(e);
    return new NextResponse("error", { status: 500 });
  }
}
