import { NextResponse, NextRequest } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/app/api/auth/[...nextauth]/route";
import { prisma }                    from "@/lib/prisma";   // se preferir, continue usando new PrismaClient()

// ─────────────────────────────────────────
// PUT /api/enderecos/[id]  – editar endereço
// ─────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const enderecoId = BigInt(params.id);
  const usuarioId  = BigInt(session.user.id);
  const body       = await req.json();

  console.log("enderecoId", enderecoId);

  const { logradouro, numero, bairro, cidade, estado, cep } = body;
  if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  try {
    const atualizado = await prisma.endereco.updateMany({
      where: { enderecoId, usuarioId, deletedAt: null },
      data:  { logradouro, numero, bairro, cidade, estado, cep },
    });

    if (atualizado.count === 0) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensagem: "Endereço atualizado com sucesso" });
  } catch (e) {
    console.error("Erro ao atualizar endereço:", e);
    return NextResponse.json(
      { error: "Erro ao atualizar endereço" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// DELETE /api/enderecos/[id] – excluir (soft-delete)
// ─────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const enderecoId = BigInt(params.id);
  const usuarioId  = BigInt(session.user.id);

  try {
    const removido = await prisma.endereco.updateMany({
      where: { enderecoId, usuarioId, deletedAt: null },
      data:  { deletedAt: new Date() },          // soft-delete
    });

    if (removido.count === 0) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ mensagem: "Endereço excluído com sucesso" });
  } catch (e) {
    console.error("Erro ao excluir endereço:", e);
    return NextResponse.json(
      { error: "Erro ao excluir endereço" },
      { status: 500 }
    );
  }
}
