import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/admin/pedidos/[id] - Obter detalhes de um pedido específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar o pedido com todos os detalhes
    const pedido = await prisma.pedido.findUnique({
      where: { pedidoId: BigInt(params.id), deletedAt: null },
      include: {
        usuario: true,
        itensPedido: { include: { produto: true } },
        EnderecoPedido: true,
        shipments: {
          select: {
            melhorEnvioOrderId: true,
            trackingCarrier: true,
            trackingCode: true,
            trackingUrl: true,
            status: true,
          },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para ver este pedido
    const isAdmin = session.user.tipo === "admin"
    if (!isAdmin && pedido.usuarioId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Buscar o endereço principal do usuário
    const enderecoPedido = pedido.EnderecoPedido[0] ?? null;



    // Formatar o pedido para a resposta
    const pedidoFormatado = {
      pedidoId: pedido.pedidoId.toString(),
      statusPedido: pedido.statusPedido,
      dataPedido: pedido.dataPedido.toISOString(),
      valorTotal: Number(pedido.valorTotal),
      cliente: {
        id: pedido.usuarioId.toString(),
        nome: pedido.usuario.nome,
        sobrenome: pedido.usuario.sobrenome,
        email: pedido.usuario.email,
      },
      itensPedido: pedido.itensPedido.map((item) => ({
        itemPedidoId: item.itemPedidoId.toString(),
        produtoId: item.produtoId.toString(),
        quantidade: item.quantidade,
        precoUnitario: Number(item.precoUnitario),
        produto: {
          nome: item.produto.nome,
          descricao: item.produto.descricao,
          imagens: item.produto.imagens,
        },
      })),
      endereco: enderecoPedido
        ? {
          enderecopedidoid: enderecoPedido.enderecopedidoid.toString(),
          logradouro: enderecoPedido.logradouro,
          numero: enderecoPedido.numero,
          bairro: enderecoPedido.bairro,
          cidade: enderecoPedido.cidade,
          estado: enderecoPedido.estado,
          cep: enderecoPedido.cep,
          }
        : null,
    }

    return NextResponse.json(pedidoFormatado)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PATCH /api/admin/pedidos/[id] - Atualizar o status de um pedido
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário é admin
    const isAdmin = session.user.tipo === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Apenas administradores podem atualizar pedidos" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 })
    }

    // Validar o status
    const statusValidos = ["pendente", "em_producao", "a_caminho", "entregue", "cancelado"]
    if (!statusValidos.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Atualizar o status do pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: {
        pedidoId: BigInt(params.id),
      },
      data: {
        statusPedido: status,
        updatedAt: new Date(),
      },
    })



    return NextResponse.json({
      pedidoId: pedidoAtualizado.pedidoId.toString(),
      statusPedido: pedidoAtualizado.statusPedido,
      mensagem: "Status atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
