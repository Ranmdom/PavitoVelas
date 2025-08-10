// app/api/melhorEnvio/rastreio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pedidoId = req.nextUrl.searchParams.get("pedidoId");
  if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 });

  const s = await prisma.shipment.findFirst({
    where: { pedidoId: BigInt(pedidoId) },
    orderBy: { updatedAt: "desc" },
    select: { trackingCarrier: true, trackingCode: true, trackingUrl: true },
  });

  return NextResponse.json({
    trackingCarrier: s?.trackingCarrier ?? null,
    trackingCode: s?.trackingCode ?? null,
    trackingUrl: s?.trackingUrl ?? null,
  });
}
