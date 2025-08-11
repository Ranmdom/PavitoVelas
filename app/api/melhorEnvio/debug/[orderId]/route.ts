import { NextRequest, NextResponse } from "next/server";

const BASE = `${process.env.BASEURL_MELHOR_ENVIO}`;
const TOKEN = process.env.MELHOR_ENVIO_TOKEN!;

export async function GET(_: NextRequest, { params }: { params: { orderId: string } }) {
  const id = params.orderId;

  const h = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    "User-Agent": "PavitoVelas (suporte@pavito.com)",
  };

  // /me/orders/:id
  const r1 = await fetch(`${BASE}/me/orders/${id}`, { headers: h, cache: "no-store" });
  const txt1 = await r1.text();

  // /me/shipment/tracking (POST)
  const r2 = await fetch(`${BASE}/me/shipment/tracking`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ orders: [id] }),
    cache: "no-store",
  });
  const txt2 = await r2.text();

  return NextResponse.json({
    orderId: id,
    orders_status: r1.status,
    orders_raw: tryParse(txt1),
    tracking_status: r2.status,
    tracking_raw: tryParse(txt2),
  });
}

function tryParse(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}
