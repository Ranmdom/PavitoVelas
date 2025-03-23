// app/api/produtos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/produtos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const produtoId = Number(params.id)
    const produto = await prisma.produto.findUnique({ where: { produtoId } })
    if (!produto) {
      return NextResponse.json({ error: 'produto não encontrado.' }, { status: 404 })
    }
    return jsonResponse(produto)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 })
  }
}

// PUT /api/produtos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const produtoId = Number(params.id)
    const data = await req.json()

    const produtoAtualizado = await prisma.produto.update({
      where: { produtoId },
      data: {
        ...data
      },
    })

    return jsonResponse(produtoAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 })
  }
}

// DELETE /api/produtos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const produtoId = Number(params.id)

    // Soft-delete
    const produtoDeletado = await prisma.produto.update({
      where: { produtoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(produtoDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar produto.' }, { status: 500 })
  }
}
