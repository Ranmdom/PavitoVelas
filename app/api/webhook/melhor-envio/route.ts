// /app/api/webhooks/melhor-envio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOrder,
  verifyMESignature,
  fetchTrackingForOrders,
  extractTracking,          // << importa o parser
} from "@/lib/melhorEnvio";

export const runtime = "nodejs";

const INTERESSA = new Set([
  "order.generated",
  "order.posted",
  "order.delivered",
  "order.updated",
  "purchase.paid",
  "shipment.posted",
]);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-me-signature");
  const raw = await req.arrayBuffer();

  if (!(await verifyMESignature(raw, sig))) {
    console.warn("❌ Assinatura inválida do Melhor Envio");
    return new NextResponse("invalid signature", { status: 401 });
  }

  const { event, data } = JSON.parse(Buffer.from(raw).toString("utf8")) as {
    event: string;
    data: { id: string; tracking?: string; tracking_url?: string };
  };

  if (!INTERESSA.has(event)) {
    console.log("ℹ️ ME WEBHOOK ignorado:", event, data?.id);
    return NextResponse.json({ ok: true });
  }

  console.log("📦 ME WEBHOOK:", { event, orderId: data.id, payloadTracking: data.tracking });

  try {
    // 1) Busca completa da ordem
    const order = await getOrder(data.id);

    // 2) Extrai tracking do /me/orders e mistura com payload (se vier)
    let { code, url, carrier } = extractTracking(order);
    if (!code && (data?.tracking || data?.tracking_url)) {
      code = data.tracking ?? code;
      url  = data.tracking_url ?? url;
    }

    console.log("🔍 ME /orders retorno:", {
      status: order?.status,
      code, url, carrier,
    });

    // 3) Fallback: /me/shipment/tracking (caso ainda não tenha código)
    if (!code) {
      try {
        const arr = await fetchTrackingForOrders(data.id);
        const item = Array.isArray(arr) ? arr.find((x: any) => x?.id === data.id) ?? arr[0] : null;
        const t = extractTracking(item);
        code    = t.code    ?? code;
        url     = t.url     ?? url;
        carrier = t.carrier ?? carrier;
        if (t.code) console.log("🧲 Tracking via /shipment/tracking:", t.code);
        else console.log("⏳ Ainda sem tracking via /shipment/tracking");
      } catch (e) {
        console.warn("⚠️ Fallback /shipment/tracking falhou:", e);
      }
    }

    // 4) Garante que existe o shipment (criado na compra)
    const existing = await prisma.shipment.findUnique({
      where: { melhorEnvioOrderId: data.id },
      select: { pedidoId: true },
    });
    if (!existing) {
      console.warn("⚠️ Nenhum shipment encontrado para", data.id, "- crie na compra das etiquetas.");
      return NextResponse.json({ ok: true });
    }

    // 5) Upsert sem sobrescrever com null
    const saved = await prisma.shipment.upsert({
      where: { melhorEnvioOrderId: data.id },
      create: {
        pedidoId: existing.pedidoId,
        melhorEnvioOrderId: data.id,
        status: event,
        trackingCode:    code    ?? undefined,
        trackingCarrier: carrier ?? undefined,
        trackingUrl:     url     ?? undefined,
        etiquetaUrl: "",
      },
      update: {
        status: event,
        trackingCode:    code    ?? undefined,
        trackingCarrier: carrier ?? undefined,
        trackingUrl:     url     ?? undefined,
      },
    });

    console.log("✅ Tracking salvo/atualizado:", saved.trackingCode);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Erro webhook ME:", e);
    return new NextResponse("error", { status: 500 });
  }
}
