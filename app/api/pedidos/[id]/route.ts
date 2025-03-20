// app/api/pedidos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/pedidos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const pedidoId = Number(params.id)
    const pedido = await prisma.pedido.findUnique({ where: { pedidoId } })
    if (!pedido) {
      return NextResponse.json({ error: 'pedido não encontrado.' }, { status: 404 })
    }
    return NextResponse.json(pedido, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar pedido.' }, { status: 500 })
  }
}

// PUT /api/pedidos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const pedidoId = Number(params.id)
    const data = await req.json()

    const pedidoAtualizado = await prisma.pedido.update({
      where: { pedidoId },
      data: {
        ...data
      },
    })

    return NextResponse.json(pedidoAtualizado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido.' }, { status: 500 })
  }
}

// DELETE /api/pedidos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const pedidoId = Number(params.id)

    // Soft-delete
    const pedidoDeletado = await prisma.pedido.update({
      where: { pedidoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json(pedidoDeletado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar pedido.' }, { status: 500 })
  }
}
