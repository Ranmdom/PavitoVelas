// app/api/melhorEnvio/compraEtiquetas/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders } from "@/lib/melhorEnvio";

const BASE_RAW  = process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "";
const TOKEN_RAW = process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "";

const BASE  = BASE_RAW.trim();
const TOKEN = TOKEN_RAW.replace(/\r|\n|^"+|"+$|^'+|'+$/g, "").trim();

const baseHost  = (() => { try { return new URL(BASE).host; } catch { return BASE; } })();
const token_fp  = TOKEN ? `${TOKEN.slice(0,6)}…${TOKEN.slice(-6)}` : "(vazio)";
const token_len = TOKEN.length;

function hAuth() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
    "User-Agent": "Aplicacao suporte@pavito.com",
  } as const;
}
function hJsonAuth() {
  return { ...hAuth(), "Content-Type": "application/json" } as const;
}

export async function POST(req: NextRequest) {
  try {
    const { pedidoId } = (await req.json()) as { pedidoId: string };
    if (!pedidoId) {
      return NextResponse.json({ stage: "input", error: "pedidoId é obrigatório" }, { status: 400 });
    }
    if (!BASE || !TOKEN) {
      return NextResponse.json(
        { stage: "env", error: "ENV ausente", debug: { baseHost, token_fp, token_len } },
        { status: 500 }
      );
    }

    // 0) AUTH: /me
    const meRes = await fetch(`${BASE}/me`, { headers: hAuth(), cache: "no-store" });
    const meTxt = await meRes.text();
    if (!meRes.ok) {
      return NextResponse.json(
        { stage: "precheck-me", error: "Auth falhou no /me", status: meRes.status,
          debug: { baseHost, token_fp, token_len, meBody: meTxt.slice(0,300) } },
        { status: 401 }
      );
    }
    let me: any = {}; try { me = JSON.parse(meTxt); } catch {}
    const meUserId = me?.id ?? me?.user?.id ?? null;

    // 1) ORDERS do DB
    const shipments = await prisma.shipment.findMany({
      where: { pedidoId: BigInt(pedidoId) },
      select: { melhorEnvioOrderId: true },
    });
    const orders = shipments.map(s => s.melhorEnvioOrderId).filter(Boolean);
    if (!orders.length) {
      return NextResponse.json({ stage: "orders-db", error: "Sem melhor_envio_order_id para comprar" }, { status: 400 });
    }

    // 2) VALIDATE ownership/ambiente
    const validations: Array<{ id: string; ok: boolean; status?: number; body?: string; owner?: string|null }> = [];
    for (const id of orders) {
      const r = await fetch(`${BASE}/me/orders/${id}`, { headers: hAuth(), cache: "no-store" });
      const t = await r.text();
      if (!r.ok) { validations.push({ id, ok:false, status:r.status, body:t.slice(0,200) }); continue; }
      let ord:any={}; try{ ord=JSON.parse(t);}catch{}
      const ownerId = ord?.user_id ?? ord?.user?.id ?? null;
      validations.push({ id, ok: !meUserId || !ownerId || String(meUserId)===String(ownerId), owner: ownerId??null });
    }
    const bad = validations.filter(v => !v.ok);
    if (bad.length) {
      return NextResponse.json(
        { stage: "validate-orders",
          error: "Orders não pertencem a este token/ambiente (ou não existem neste BASE).",
          me: { id: meUserId }, baseHost, token_fp,
          details: bad, okOnes: validations.filter(v=>v.ok).map(v=>v.id) },
        { status: 409 }
      );
    }

    // 3) CHECKOUT
    const co = await fetch(`${BASE}/me/shipment/checkout`, {
      method: "POST", headers: hJsonAuth(), body: JSON.stringify({ orders }),
    });
    const coTxt = await co.text();
    let data:any; try { data = JSON.parse(coTxt); } catch { data = { raw: coTxt } }

    if (!co.ok) {
      return NextResponse.json(
        { stage: "checkout", error: "Checkout falhou", status: co.status,
          baseHost, token_fp, request: { orders }, detail: data },
        { status: co.status }
      );
    }

    const ordersResp = data?.purchase?.orders;
    if (!Array.isArray(ordersResp)) {
      return NextResponse.json({ stage: "parse", error: "Resposta inesperada do checkout", detail: data }, { status: 502 });
    }

    const orderIds: string[] = ordersResp.map((o:any) => o.id);
    const purchaseStatus: string = data?.purchase?.status ?? "paid";

    await Promise.all(orderIds.map(id =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: id },
        update: { status: purchaseStatus, updatedAt: new Date() },
        create: { pedidoId: BigInt(pedidoId), melhorEnvioOrderId: id, status: purchaseStatus, etiquetaUrl: "" },
      })
    ));

    // 4) tracking best-effort
    try {
      const arr = await fetchTrackingForOrders(orderIds);
      await Promise.all((arr||[]).map((t:any) =>
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

    return NextResponse.json({ ok:true, baseHost, token_fp, orders: orderIds, status: purchaseStatus });
  } catch (e:any) {
    return NextResponse.json({ stage: "exception", error: "Erro interno", message: e?.message }, { status: 500 });
  }
}
