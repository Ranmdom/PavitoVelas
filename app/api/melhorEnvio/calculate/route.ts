// app/api/melhorEnvio/calculate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN         = process.env.MELHOR_ENVIO_TOKEN!;
const ORIGIN_POSTAL = process.env.FROM_POSTAL_CODE!;
const MELHOR_BASE = `${process.env.BASEURL_MELHOR_ENVIO}`;
//Teste
export async function POST(request: Request) {
  try {
    // 1) Lê body do front
    const { postalCode, items } = await request.json() as {
      postalCode: string;
      items: { id: string; quantity: number }[];
    };

    // 2) Puxa do banco dimensões e preço de cada produto
    const ids = items.map(i => BigInt(i.id));
    const produtos = await prisma.produto.findMany({
      where: { produtoId: { in: ids } },
      select: {
        produtoId: true,
        preco:      true,
        altura:     true,
        largura:    true,
        peso:       true
      }
    });

    // 3) Monta o array “products” no formato da API
    // app/api/melhorEnvio/calculate/route.ts

// … (mantenha o resto igual)

    const products = items.map(({ id, quantity }) => {
      const p = produtos.find(x => x.produtoId === BigInt(id))!
      const grams = p.peso?.toNumber() ?? 100     // ex: 900 g
      const weight = grams / 1000                  // agora 0.9 kg

     return {
       id:               p.produtoId.toString(),
       width:            p.largura?.toNumber() ?? 1,
       height:           p.altura?.toNumber()   ?? 1,
       length:           (p.largura?.toNumber() ?? 1),
       weight,                                   // <— em kg
       insurance_value:  p.preco.toNumber() * quantity,
       quantity
      }
    })


    // 4) Chama a API *uma vez* passando esse array completo
    const resp = await fetch(
      `${MELHOR_BASE}/me/shipment/calculate`,
      {
        method:  "POST",
        headers: {
          "Accept":        "application/json",
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${TOKEN}`,
          "User-Agent":    "PavitoVelas (suporte@pavito.com)"
        },
        body: JSON.stringify({
          from:     { postal_code: ORIGIN_POSTAL },
          to:       { postal_code: postalCode },
          products,                  // <-- aqui
          options:  { receipt: false, own_hand: false }
        })
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || JSON.stringify(data));
    }

    // 5) Retorna o JSON puro com price e delivery_time preenchidos
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ /api/melhorEnvio/calculate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
