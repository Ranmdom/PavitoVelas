import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient()
type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/pedidos/[id] - Listar todos os pedidos de um usuário
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;  
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Garante que usuário só veja os próprios pedidos
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Busca todos os pedidos ativos (deletedAt = null) daquele usuário
    const pedidos = await prisma.pedido.findMany({
      where: {
        usuarioId: BigInt(id),
        deletedAt: null,
      },
      include: {
        itensPedido: {
          include: {
            produto: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataPedido: "desc", // opcional: ordena do mais recente ao mais antigo
      },
    })

    // Formata cada pedido
    const formatted = pedidos.map((pedido) => ({
      pedidoId: Number(pedido.pedidoId),
      dataPedido: pedido.dataPedido.toISOString(),
      statusPedido: pedido.statusPedido,
      valorTotal: Number(pedido.valorTotal),
      status: pedido.statusPedido,
      itensPedido: pedido.itensPedido.map((item) => ({
        itemPedidoId: Number(item.itemPedidoId),
        produtoId: Number(item.produtoId),
        nome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario: Number(item.precoUnitario),
      })),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Erro ao listar pedidos do usuário:", error)
    return NextResponse.json(
      { error: "Erro ao listar pedidos do usuário" },
      { status: 500 }
    )
  }
}
