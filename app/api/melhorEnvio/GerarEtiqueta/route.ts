    // app/api/melhorEnvio/shipment/generate/route.ts
    import { NextResponse } from 'next/server';

    const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN!; // configure no .env

    export interface GenerateShipmentRequest {
    orders: string[];
    }

    export async function POST(request: Request) {
    try {
        const { orders } = (await request.json()) as GenerateShipmentRequest;

        const resp = await fetch(
        'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/generate',
        {
            method: 'POST',
            headers: {
            'Accept':        'application/json',
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
            'User-Agent':    'PavitoVelas (suporte@pavito.com)'
            },
            body: JSON.stringify({ orders })
        }
        );

        const data = await resp.json();

        if (!resp.ok) {
        // retorna status e corpo do MelhorEnvio em caso de erro
        return NextResponse.json(
            { error: data.error || 'Falha ao gerar etiqueta', details: data },
            { status: resp.status }
        );
        }

        // sucesso: devolve o JSON exatamente como veio
        return NextResponse.json(data);
    } catch (err) {
        console.error('🛑 Erro interno:', err);
        return NextResponse.json(
        { error: 'Erro interno do servidor ao gerar etiqueta' },
        { status: 500 }
        );
    }
    }
