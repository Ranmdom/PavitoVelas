// app/api/pagamentos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/pagamentos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const pagamentoId = Number(params.id)
    const pagamento = await prisma.pagamento.findUnique({ where: { pagamentoId } })
    if (!pagamento) {
      return NextResponse.json({ error: 'pagamento não encontrado.' }, { status: 404 })
    }
    return jsonResponse(pagamento)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar pagamento.' }, { status: 500 })
  }
}

// PUT /api/pagamentos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const pagamentoId = Number(params.id)
    const data = await req.json()

    const pagamentoAtualizado = await prisma.pagamento.update({
      where: { pagamentoId },
      data: {
        ...data
      },
    })

    return jsonResponse(pagamentoAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar pagamento.' }, { status: 500 })
  }
}

// DELETE /api/pagamentos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const pagamentoId = Number(params.id)

    // Soft-delete
    const pagamentoDeletado = await prisma.pagamento.update({
      where: { pagamentoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(pagamentoDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar pagamento.' }, { status: 500 })
  }
}
