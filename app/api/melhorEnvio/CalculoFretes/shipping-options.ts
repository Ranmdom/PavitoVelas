import { NextRequest, NextResponse } from "next/server";

// Tipagem para o produto no payload
interface ShippingItem {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { postalCode, items }: { postalCode: string; items: ShippingItem[] } = await req.json();
    if (!postalCode || postalCode.length < 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sem itens para cotação" }, { status: 400 });
    }

    const resp = await fetch(
      "https://api.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          from: { postal_code: "96020360" },
          to: { postal_code: postalCode },
          products: items,
          options: { receipt: false, own_hand: false },
          services: items.flatMap((_, idx) => [])[0] || "1,2,18"
        }),
      }
    );
    const json = await resp.json();
    return NextResponse.json(json.packages || []);
  } catch (err) {
    console.error("Erro shipping-options:", err);
    return NextResponse.json({ error: "Falha ao obter opções" }, { status: 500 });
  }
}
