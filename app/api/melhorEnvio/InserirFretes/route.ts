import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { insertFreteNoCarrinho } from "@/lib/insertInCart";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { toPostal, items, serviceId, options, pedidoId } = await req.json() as {
      toPostal?: string;
      items: Array<{ id: string; quantity: number }>;
      serviceId: number;
      options?: Partial<{ receipt: boolean; own_hand: boolean; reverse: boolean; non_commercial: boolean }>;
      pedidoId: string | number;
    };

    if (!pedidoId) {
      return NextResponse.json({ error: "pedidoId é obrigatório" }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "items vazio" }, { status: 400 });
    }

    // Se quiser forçar CEP do front, monte um toAddress parcial.
    // Caso contrário, o helper usa o endereço padrão do usuário no DB.
    const toAddress = toPostal
      ? { cep: toPostal, logradouro: "", numero: "", bairro: "", cidade: "", estado: "" } // os demais campos serão ignorados se vazios; prefira não passar e usar o endereço do DB
      : undefined;

    const result = await insertFreteNoCarrinho({
      pedidoId: BigInt(pedidoId as any),
      userId: BigInt(session.user.id),
      serviceId,
      items,
      toAddress,     // deixe undefined para usar o endereço do DB
      options,       // opcional
    });

    return NextResponse.json({ ok: true, orderId: result.orderId });
  } catch (err: any) {
    console.error("Erro em InserirFretes:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
