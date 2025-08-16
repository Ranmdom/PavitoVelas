// app/api/melhorEnvio/debug/me/route.ts
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const h = new Headers(req.headers);
  const BASE  = (h.get("x-me-base")  || "https://sandbox.melhorenvio.com.br/api/v2").trim();
  const TOKEN = (h.get("x-me-token") || "").trim();
  const r = await fetch(`${BASE}/me`, {
    headers: { Accept:"application/json", Authorization:`Bearer ${TOKEN}`, "Content-Type":"application/json", "User-Agent":"Pavito Debug" },
    cache: "no-store"
  });
  const txt = await r.text();
  return NextResponse.json({ ok:r.ok, status:r.status, body: txt.slice(0,400) }, { status: r.status });
}
