// app/api/metodoPagamentos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/metodoPagamentos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const metodoPagamentoId = Number(params.id)
    const metodoPagamento = await prisma.metodoPagamento.findUnique({ where: { metodoPagamentoId } })
    if (!metodoPagamento) {
      return NextResponse.json({ error: 'metodoPagamento não encontrado.' }, { status: 404 })
    }
    return NextResponse.json(metodoPagamento, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar metodoPagamento.' }, { status: 500 })
  }
}

// PUT /api/metodoPagamentos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const metodoPagamentoId = Number(params.id)
    const data = await req.json()

    const metodoPagamentoAtualizado = await prisma.metodoPagamento.update({
      where: { metodoPagamentoId },
      data: {
        ...data
      },
    })

    return NextResponse.json(metodoPagamentoAtualizado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar metodoPagamento.' }, { status: 500 })
  }
}

// DELETE /api/metodoPagamentos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const metodoPagamentoId = Number(params.id)

    // Soft-delete
    const metodoPagamentoDeletado = await prisma.metodoPagamento.update({
      where: { metodoPagamentoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json(metodoPagamentoDeletado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar metodoPagamento.' }, { status: 500 })
  }
}
