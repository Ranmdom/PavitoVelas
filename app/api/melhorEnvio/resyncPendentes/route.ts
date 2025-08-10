// app/api/melhorEnvio/force-sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders, extractTracking } from "@/lib/melhorEnvio";

export async function POST(req: NextRequest) {
  try {
    const { pedidoId } = await req.json();
    if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 });

    const shipments = await prisma.shipment.findMany({
      where: { pedidoId: BigInt(pedidoId) },
      select: { melhorEnvioOrderId: true },
    });
    const ids = shipments.map(s => s.melhorEnvioOrderId);
    if (!ids.length) return NextResponse.json({ ok: true, updated: 0, ids: [] });

    const arr = await fetchTrackingForOrders(ids);

    let updated = 0;
    await Promise.all(
      arr.map(async (t: any) => {
        const { code, url, carrier } = extractTracking(t);
        if (!code) return;
        await prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode: code,
            trackingUrl:  url ?? undefined,
            trackingCarrier: carrier ?? undefined,
            updatedAt: new Date(),
          },
        });
        updated++;
      })
    );

    return NextResponse.json({ ok: true, updated, ids });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "erro" }, { status: 500 });
  }
}
