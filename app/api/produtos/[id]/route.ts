// app/api/produtos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    const resultado = await Promise.all(
      produtos.map(async (produto) => {
        const produtoId = produto.produtoId

        // Chama o próprio endpoint de fotos do produto
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/produtos/${produtoId}/fotos`)
        const fotos = await res.json()
        const imagemPrincipal = fotos?.[0]?.url || "/placeholder.svg"

        return {
          id: String(produtoId),
          nome: produto.nome,
          category: produto.categoriaId ?? "Sem categoria",
          price: Number(produto.preco),
          fragrance: produto.fragrancia ?? "",
          weight: produto.peso ? `${produto.peso}g` : "",
          createdAt: produto.createdAt,
          image: imagemPrincipal,
        }
      })
    )

    return jsonResponse(resultado)
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 })
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
