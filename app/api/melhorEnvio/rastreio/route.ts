import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pedidoId = searchParams.get("pedidoId");
  if (!pedidoId) return new NextResponse("pedidoId é obrigatório", { status: 400 });

  const id = BigInt(pedidoId);
  // último envio desse pedido (se houver mais de um)
  const shipment = await prisma.shipment.findFirst({
    where: { pedidoId: id },
    orderBy: { createdAt: "desc" },
    select: { trackingCarrier: true, trackingCode: true },
  });

  if (!shipment) return new NextResponse("not found", { status: 404 });
  return NextResponse.json(shipment, { headers: { "Cache-Control": "no-store" } });
}
