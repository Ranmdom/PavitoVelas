import { type NextRequest, NextResponse } from "next/server"

// Tipagem para o produto no payload
interface ShippingItem {
  id: string
  width: number
  height: number
  length: number
  weight: number
  insurance_value: number
  quantity: number
}

export async function POST(req: NextRequest) {
  try {
    const { postalCode, items }: { postalCode: string; items: ShippingItem[] } = await req.json()

    if (!postalCode || postalCode.replace(/\D/g, "").length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sem itens para cotação" }, { status: 400 })
    }

    // Corpo exigido pela API — serviços como array numérico
    const body = {
      from: { postal_code: "96020360" }, // CEP de origem fixo
      to: { postal_code: postalCode.replace(/\D/g, "") },
      products: items,
      options: { receipt: false, own_hand: false },
      services: ["1", "2", "18"], // PAC, SEDEX, Loggi
    }

    const resp = await fetch("https://api.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    })

    // Lê como texto primeiro (a API devolve texto puro em alguns erros)
    const text = await resp.text()
    let data: unknown = text
    try {
      data = JSON.parse(text)
    } catch {
      /* se não for JSON, mantém texto puro */
    }

    if (!resp.ok) {
      // Se possível extrai mensagem, senão devolve texto bruto
      const errMsg =
        typeof data === "object" && data && "message" in data ? (data as any).message : text || "Erro desconhecido"
      return NextResponse.json({ error: errMsg }, { status: resp.status })
    }

    // Resposta OK (data é JSON)
    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("Erro shipping-calculate:", err)
    return NextResponse.json({ error: "Falha ao calcular frete" }, { status: 500 })
  }
}
