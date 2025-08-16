// app/api/melhorEnvio/compraEtiquetas/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrackingForOrders } from "@/lib/melhorEnvio";

const BASE_RAW  = process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "";
const TOKEN_RAW = process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "";

// higieniza/base
const BASE  = BASE_RAW.trim();
const TOKEN = TOKEN_RAW.replace(/\r|\n|^"+|"+$|^'+|'+$/g, "").trim();

const baseHost = (() => { try { return new URL(BASE).host; } catch { return BASE; } })();
const token_fp  = TOKEN ? `${TOKEN.slice(0,6)}…${TOKEN.slice(-6)}` : "(vazio)";
const token_len = TOKEN.length;

function hdrAuth() {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
    "User-Agent": "Aplicacao suporte@pavito.com",
  } as const;
}
function hdrJsonAuth() {
  return { ...hdrAuth(), "Content-Type": "application/json" } as const;
}

export async function POST(req: NextRequest) {
  try {
    // (opcional) bloquear chamadas vindas do browser — descomente se quiser
    // const isBrowser = !!req.headers.get("sec-fetch-mode");
    // if (isBrowser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { pedidoId } = (await req.json()) as { pedidoId: string };
    if (!pedidoId) return NextResponse.json({ error: "pedidoId é obrigatório" }, { status: 400 });

    if (!BASE || !TOKEN) {
      return NextResponse.json(
        { error: "ENV ausente", debug: { baseHost, token_fp, token_len } },
        { status: 500 }
      );
    }

    // 0) valida token no /me (se falhar, é 401 do ME)
    const me = await fetch(`${BASE}/me`, { headers: hdrAuth(), cache: "no-store" });
    const meBody = (await me.text()).slice(0, 300);
    if (!me.ok) {
      return NextResponse.json(
        { error: "Auth falhou no /me", status: me.status, debug: { baseHost, token_fp, token_len, meBody } },
        { status: 401 }
      );
    }

    // 1) pega orders (ids do carrinho do ME) amarrados ao pedido
    const shipments = await prisma.shipment.findMany({
      where: { pedidoId: BigInt(pedidoId) },
      select: { melhorEnvioOrderId: true },
    });
    const orders = shipments.map(s => s.melhorEnvioOrderId).filter(Boolean);
    if (!orders.length) {
      return NextResponse.json({ error: "Sem melhor_envio_order_id para comprar" }, { status: 400 });
    }

    // 2) checkout (compra)
    const resp = await fetch(`${BASE}/me/shipment/checkout`, {
      method: "POST",
      headers: hdrJsonAuth(),
      body: JSON.stringify({ orders }),
    });

    const raw = await resp.text();
    let data: any; try { data = JSON.parse(raw); } catch { data = { raw } }

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Checkout falhou", status: resp.status, detail: data },
        { status: resp.status }
      );
    }

    const ordersResp = data?.purchase?.orders;
    if (!Array.isArray(ordersResp)) {
      return NextResponse.json(
        { error: "Resposta inesperada do checkout", detail: data },
        { status: 502 }
      );
    }

    const orderIds: string[] = ordersResp.map((o: any) => o.id);
    const purchaseStatus: string = data?.purchase?.status ?? "paid";

    // 3) persiste status nos Shipments
    await Promise.all(orderIds.map((id) =>
      prisma.shipment.upsert({
        where: { melhorEnvioOrderId: id },
        update: { status: purchaseStatus, updatedAt: new Date() },
        create: { pedidoId: BigInt(pedidoId), melhorEnvioOrderId: id, status: purchaseStatus, etiquetaUrl: "" },
      })
    ));

    // 4) tracking best-effort (pode ainda não existir agora)
    try {
      const arr = await fetchTrackingForOrders(orderIds);
      await Promise.all((arr || []).map((t: any) =>
        prisma.shipment.update({
          where: { melhorEnvioOrderId: t.id },
          data: {
            trackingCode:    t?.tracking ?? undefined,
            trackingUrl:     t?.tracking_url ?? undefined,
            trackingCarrier: t?.service?.company?.name ?? t?.company?.name ?? undefined,
            updatedAt:       new Date(),
          },
        })
      ));
    } catch { /* normal se tracking ainda não estiver pronto */ }

    return NextResponse.json({ ok: true, orders: orderIds, status: purchaseStatus });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno", message: e?.message }, { status: 500 });
  }
}
