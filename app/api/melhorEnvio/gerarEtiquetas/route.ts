import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MELHOR_BASE = "https://sandbox.melhorenvio.com.br/api/v2"
const TOKEN       = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!

export async function POST(req: NextRequest) {
  const { pedidoId, shipments: shipmentIds }: { pedidoId: string; shipments: string[] } = await req.json()
  const pedidoIdBigInt = BigInt(pedidoId)

  // 1) gera etiqueta
  const resp = await fetch(
    `${MELHOR_BASE}/me/shipment/generate`,
    {
      method: "POST",
      headers: {
        Accept:        "application/json",
        "Content-Type":"application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent":  "PavitoVelas (suporte@pavito.com)",
      },
      body: JSON.stringify({ orders: shipmentIds }),
    }
  )
  const data = await resp.json()
  console.log("📦 MelhorEnvio generate response:", data)
if (!resp.ok || !Array.isArray(data.shipments)) {
  console.error("❌ /shipment/generate retornou sem shipments:", resp.status, data)
  return NextResponse.json({ error: data }, { status: resp.status })
}

// data.shipments agora conterá um array de { id, label_url, status }
await Promise.all(
  data.shipments.map((s: any) =>
    prisma.shipment.update({
      where: { melhorEnvioOrderId: s.id },
      data: {
        etiquetaUrl: s.label_url,
        status:      s.status,
        updatedAt:   new Date(),
      },
    })
  )
)

return NextResponse.json({ shipments: data.shipments })
}
