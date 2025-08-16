// app/api/melhorEnvio/debug/me/route.ts
import { NextResponse } from "next/server";
import { ME_BASE, ME_TOKEN, ME_DEBUG, hAuth } from "@/lib/melhorEnvioEnv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!ME_BASE || !ME_TOKEN) {
    return NextResponse.json({ stage:"env", error:"ENV ausente", debug: ME_DEBUG }, { status: 500 });
  }
  const r = await fetch(`${ME_BASE}/me`, { headers: hAuth(), cache: "no-store" });
  const t = await r.text();
  if (!r.ok) {
    return NextResponse.json({ stage:"precheck-me", status:r.status, debug:ME_DEBUG, body:t.slice(0,300) }, { status: r.status });
  }
  let me:any; try { me = JSON.parse(t); } catch { me = t; }
  return NextResponse.json({ stage:"ok", debug:ME_DEBUG, me });
}
