// app/api/melhorEnvio/debug/me/route.ts
import { NextResponse } from "next/server";

function fp(t: string) { return t ? `${t.slice(0,6)}…${t.slice(-6)}` : "(vazio)"; }
function audFromJwt(t: string) {
  try {
    const mid = t.split(".")[1];
    const json = JSON.parse(Buffer.from(mid, "base64url").toString("utf8"));
    return json?.aud ?? null;
  } catch { return null; }
}

export async function GET(req: Request) {
  const h = new Headers(req.headers);
  // permite override por header; senão, pega do .env
  const BASE  = (h.get("x-me-base")  || process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "").trim();
  const TOKEN = (h.get("x-me-token") || process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "").trim();

  if (!BASE || !TOKEN) {
    return NextResponse.json({ ok:false, error:"Missing BASE or TOKEN", BASE, token_fp: fp(TOKEN) }, { status: 500 });
  }

  const meRes = await fetch(`${BASE}/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "Pavito Debug (debug@local)"
    },
    cache: "no-store",
  });

  const bodyTxt = await meRes.text();

  return NextResponse.json({
    ok: meRes.ok,
    status: meRes.status,
    baseHost: (() => { try { return new URL(BASE).host; } catch { return BASE; } })(),
    token_fp: fp(TOKEN),
    token_len: TOKEN.length,
    token_aud: audFromJwt(TOKEN),
    body_snippet: bodyTxt.slice(0, 400),
  }, { status: meRes.ok ? 200 : meRes.status });
}
