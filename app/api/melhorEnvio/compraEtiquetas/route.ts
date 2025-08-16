export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders } from "@/lib/melhorEnvio";

const BASE_RAW  = process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "";
const TOKEN_RAW = process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "";

const BASE  = BASE_RAW.trim();
const TOKEN = TOKEN_RAW.replace(/\r|\n|^"+|"+$|^'+|'+$/g, "").trim();

function hdr() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "Aplicacao suporte@pavito.com",
  } as const;
}
const baseHost = (() => { try { return new URL(BASE).host; } catch { return BASE; } })();
const token_fp  = TOKEN ? `${TOKEN.slice(0,6)}…${TOKEN.slice(-6)}` : "(vazio)";
const token_len = TOKEN.length;

export async function POST(req: NextRequest) {
  try {
    const { pedidoId } = (await req.json()) as { pedidoId: string };
    if (!pedidoId) return NextResponse.json({ error: "pedidoId é obrigatório" }, { status: 400 });
    if (!BASE || !TOKEN) {
      return NextResponse.json({ error: "ENV ausente", debug:{ baseHost, token_fp, token_len }}, { status: 500 });
    }

    // 0) pré-cheque do token
    const me = await fetch(`${BASE}/me`, { headers: hdr(), cache: "no-store" });
    const meBody = (await me.text()).slice(0, 300);
    if (!me.ok) {
      return NextResponse.json(
        { error: "Auth falhou no /me", status: me.status, debug: { baseHost, token_fp, token_len, meBody } },
        { status: 401 }
      );
    }

    // 1) orders pelo pedidoId
    const shipments = await prisma.shipment.findMany({
      where: { pedidoId: BigInt(pedidoId) },
      select: { melhorEnvioOrderId: true },
    });
    const orders = shipments.map(s => s.melhorEnvioOrderId).filter(Boolean);
    if (!orders.length) {
      return NextResponse.json({ error: "Sem melhor_envio_order_id para comprar" }, { status: 400 });
    }

    // 2) checkout
    const resp = await fetch(`${BASE}/me/shipment/checkout`, {
      method: "POST",
      headers: hdr(),
      body: JSON.stringify({ orders }),
    });
    const raw = await resp.text();
    let data: any; try { data = JSON.parse(raw); } catch { data = { raw } }

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Checkout falhou", status: resp.status, debug: { baseHost, token_fp, token_len }, detail: data },
        { status: resp.status }
      );
    }

    const ordersResp = data?.purchase?.orders;
    if (!Array.isArray(ordersResp)) {
      return NextResponse.json({ error: "Resposta inesperada do checkout", detail: data }, { status: 502 });
    }

    const orderIds: string[] = ordersResp.map((o: any) => o.id);
    const purchaseStatus: string = data?.purchase?.status ?? "paid";

    await Promise.all(orderIds.map((id) =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: id },
        update: { status: purchaseStatus, updatedAt: new Date() },
        create: { pedidoId: BigInt(pedidoId), melhorEnvioOrderId: id, status: purchaseStatus, etiquetaUrl: "" },
      })
    ));

    // tracking best-effort
    try {
      const arr = await fetchTrackingForOrders(orderIds);
      await Promise.all((arr || []).map((t: any) =>
        prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode:    t?.tracking ?? undefined,
            trackingUrl:     t?.tracking_url ?? undefined,
            trackingCarrier: t?.service?.company?.name ?? t?.company?.name ?? undefined,
            updatedAt: new Date(),
          },
        })
      ));
    } catch {}

    return NextResponse.json({ ok: true, baseHost, token_fp, token_len, orders: orderIds, status: purchaseStatus });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno", message: e?.message }, { status: 500 });
  }
}
