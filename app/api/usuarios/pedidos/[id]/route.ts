import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient()

// GET /api/pedidos/[id] - Buscar detalhes de um pedido específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    const pedido = await prisma.pedido.findFirst({
      where: {
        usuarioId: BigInt(userId),
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
    })

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Transformar os dados para o formato esperado pelo cliente
    const formattedPedido = {
      pedidoId: Number(pedido.pedidoId),
      dataPedido: pedido.dataPedido.toISOString(),
      statusPedido: pedido.statusPedido,
      valorTotal: Number(pedido.valorTotal),
      itensPedido: pedido.itensPedido.map((item) => ({
        itemPedidoId: Number(item.itemPedidoId),
        produtoId: Number(item.produtoId),
        nome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario: Number(item.precoUnitario),
      })),
    }

    return NextResponse.json(formattedPedido)
  } catch (error) {
    console.error("Erro ao buscar detalhes do pedido:", error)
    return NextResponse.json({ error: "Erro ao buscar detalhes do pedido" }, { status: 500 })
  }
}
