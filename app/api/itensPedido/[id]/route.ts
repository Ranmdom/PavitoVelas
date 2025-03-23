// app/api/itemPedidos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/itemPedidos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const itemPedidoId = Number(params.id)
    const itemPedido = await prisma.itemPedido.findUnique({ where: { itemPedidoId } })
    if (!itemPedido) {
      return NextResponse.json({ error: 'itemPedido não encontrado.' }, { status: 404 })
    }
    return jsonResponse(itemPedido)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar itemPedido.' }, { status: 500 })
  }
}

// PUT /api/itemPedidos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const itemPedidoId = Number(params.id)
    const data = await req.json()

    const itemPedidoAtualizado = await prisma.itemPedido.update({
      where: { itemPedidoId },
      data: {
        ...data
      },
    })

    return jsonResponse(itemPedidoAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar itemPedido.' }, { status: 500 })
  }
}

// DELETE /api/itemPedidos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const itemPedidoId = Number(params.id)

    // Soft-delete
    const itemPedidoDeletado = await prisma.itemPedido.update({
      where: { itemPedidoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(itemPedidoDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar itemPedido.' }, { status: 500 })
  }
}
