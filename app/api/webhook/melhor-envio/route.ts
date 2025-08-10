// /app/api/webhooks/melhor-envio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOrder,
  verifyMESignature,
  fetchTrackingForOrders,
  extractTracking,
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

  // 0) log básico (sempre)
  console.log("ME ▶︎ headers:", Object.fromEntries(req.headers));
  console.log("ME ▶︎ raw length:", raw.byteLength);

  // 1) assinatura
  const ok = await verifyMESignature(raw, sig);
  if (!ok) {
    console.error("❌ assinatura inválida");
    return new NextResponse("invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(Buffer.from(raw).toString("utf8"));
  } catch (e) {
    console.error("❌ payload inválido:", e);
    return new NextResponse("bad payload", { status: 400 });
  }

  const { event, data } = payload as {
    event: string;
    data: { id: string; tracking?: string; tracking_url?: string };
  };

  console.log("ME ▶︎ evento recebido:", event, "orderId:", data?.id, "payloadTracking:", data?.tracking);

  if (!INTERESSA.has(event)) {
    console.log("ME ▶︎ ignorando evento:", event);
    return NextResponse.json({ ok: true });
  }

  const orderId = data.id;

  try {
    // 2) checa se existe shipment
    const existing = await prisma.shipment.findUnique({
      where: { melhorEnvioOrderId: orderId },
      select: { pedidoId: true, trackingCode: true, trackingCarrier: true, trackingUrl: true, status: true },
    });

    if (!existing) {
      console.error("⚠️ shipment NÃO encontrado p/ orderId:", orderId, "— verifique sua rota /compraEtiquetas salvando antes do webhook");
      return NextResponse.json({ ok: true });
    }
    console.log("ME ▶︎ shipment atual:", existing);

    // 3) /me/orders/:id
    const order = await getOrder(orderId);
    let { code, url, carrier } = extractTracking(order);
    // mistura com o payload (se veio algo)
    code = data?.tracking ?? code;
    url  = data?.tracking_url ?? url;

    console.log("ME ▶︎ /orders extract:", { code, url, carrier, status: order?.status });

    // 4) fallback /shipment/tracking
    if (!code) {
      try {
        const arr = await fetchTrackingForOrders(orderId);
        const item = Array.isArray(arr) ? arr.find((x: any) => x?.id === orderId) ?? arr[0] : null;
        const t = extractTracking(item);
        if (t.code) {
          code    = t.code;
          url     = t.url     ?? url;
          carrier = t.carrier ?? carrier;
          console.log("ME ▶︎ tracking via /shipment/tracking:", t);
        } else {
          console.log("ME ▶︎ tracking ainda indisponível no /shipment/tracking");
        }
      } catch (e) {
        console.warn("ME ▶︎ fallback tracking falhou:", e);
      }
    }

    // 5) sobrescrita segura
    const next = {
      trackingCode:    code    ?? existing.trackingCode    ?? undefined,
      trackingCarrier: carrier ?? existing.trackingCarrier ?? undefined,
      trackingUrl:     url     ?? existing.trackingUrl     ?? undefined,
      status:          event,
    };
    console.log("ME ▶︎ salvando:", next);

    const saved = await prisma.shipment.upsert({
      where: { melhorEnvioOrderId: orderId },
      create: {
        pedidoId: existing.pedidoId,
        melhorEnvioOrderId: orderId,
        etiquetaUrl: "",
        ...next,
      },
      update: next,
    });

    console.log("ME ▶︎ salvo:", {
      orderId,
      trackingCode: saved.trackingCode,
      trackingCarrier: saved.trackingCarrier,
      trackingUrl: saved.trackingUrl,
      status: saved.status,
      updatedAt: saved.updatedAt,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ erro no webhook ME:", e);
    return new NextResponse("error", { status: 500 });
  }
}
