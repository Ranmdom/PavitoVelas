// app/api/produtos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, context: IParams) {
  try {
    const { params } = await context
    const produtoId = Number(params.id)

    const produto = await prisma.produto.findUnique({
      where: { produtoId, deletedAt: null },
      include: { categoria: true },
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    }

    // Buscar imagem (caso você tenha essa lógica)

    const resultado = {
      id: String(produto.produtoId),
      nome: produto.nome,
      estoque: produto.estoque,
      descricao: produto.descricao,
      categoria: produto.categoria?.nome || "Categoria não cadastrada",
      categoriaId: produto.categoria?.categoriaId || null,
      categoriaNome: produto.categoria?.nome || "Categoria não cadastrada",
      fragrancia: produto.fragrancia || "Fragrância não cadastrada",
      preco: Number(produto.preco),
      peso: produto.peso,
      createdAt: produto.createdAt,
      imagens: produto.imagens ? produto.imagens : [],
    }

    return jsonResponse(resultado)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 })
  }
}



export async function PUT(req: NextRequest, context: IParams) {
  try {
    const { params } = await context
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
export async function DELETE(req: NextRequest, context: IParams) {
  try {
    const { params } = await context
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
