import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/pedidos - Listar todos os pedidos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é admin, caso contrário, retornar apenas seus pedidos
    const isAdmin = session.user.tipo === "admin"

    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get("usuarioId")

    // Construir a consulta base
    let pedidos = await prisma.pedido.findMany({
      where: {
        // Se não for admin, filtrar apenas pelos pedidos do usuário
        ...((!isAdmin && session.user.id) ? { usuarioId: BigInt(session.user.id) } : {}),
        // Se for admin e tiver um usuarioId específico
        ...(usuarioId && isAdmin ? { usuarioId: BigInt(usuarioId) } : {}),
        // Apenas pedidos não deletados
        deletedAt: null,
      },
      include: {
        usuario: {
          select: {
            nome: true,
            sobrenome: true,
          },
        },
        itensPedido: true,
      },
      orderBy: {
        dataPedido: "desc",
      },
    })

    // Formatar os pedidos para a resposta
    const pedidosFormatados = pedidos.map((pedido) => ({
      pedidoId: pedido.pedidoId.toString(),
      cliente: `${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
      status: pedido.statusPedido as "pendente" | "em_producao" | "a_caminho" | "entregue" | "cancelado",
      data: pedido.dataPedido.toISOString(),
      total: Number(pedido.valorTotal),
      itens: pedido.itensPedido.length,
    }))

    return NextResponse.json(pedidosFormatados)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
