// pages/api/calculate-shipping.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Lê o corpo da requisição
    const payload = await req.json();

    // Chama o endpoint de cálculo de frete do Melhor Envio
    const response = await fetch(
      'https://api.melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    // Converte a resposta para JSON
    const data = await response.json();

    // Retorna os dados para o front-end
    return NextResponse.json(data);
  } catch (error) {
    console.error('calculate-shipping error:', error);
    return NextResponse.json(
      { error: 'Falha ao calcular o frete' },
      { status: 500 }
    );
  }
}
