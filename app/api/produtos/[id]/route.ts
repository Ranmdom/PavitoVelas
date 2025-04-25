import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jsonResponse } from "@/utils/jsonResponse"
import { Prisma } from "@prisma/client"
import { supabase } from "@/lib/supabase"          // 👈  client já configurado

interface IParams {
  params: { id: string }
}

type ProdutoComCategoria = Prisma.ProdutoGetPayload<{
  include: { categoria: true }
}>

/**
 * Converte o caminho salvo no banco em URL pública do bucket 'produtos'.
 * Se o caminho já for URL completa, apenas devolve.
 */
function toPublicUrl(path?: string | null) {
  if (!path) return null
  if (path.startsWith("http")) return path
  return (
    supabase.storage.from("produtos").getPublicUrl(path).data.publicUrl ??
    null
  )
}

export async function GET(req: NextRequest, context: IParams) {
  try {
    const { params } = context
    const produtoId = Number(params.id)

    const produtos = (await prisma.produto.findUnique({
      where: { produtoId, deletedAt: null },
      include: { categoria: true },
    })) as ProdutoComCategoria | null

    if (!produtos) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      )
    }

    // Converte todas as imagens em URLs públicas
    const imagens = (produtos.imagens ?? []).map((p: string) => toPublicUrl(p)).filter(Boolean)
    const resultado = {
      produtoId: String(produtos.produtoId),
      nome: produtos.nome,
      categoria: produtos.categoria?.nome ?? "Sem categoria",
      preco: Number(produtos.preco),
      fragrancia: produtos.fragrancia,
      peso: produtos.peso,
      createdAt: produtos.createdAt,
      image: imagens[0] ?? null,      
      imagens,                        // (opcional) array completo se quiser
    }

    return jsonResponse(resultado)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produto." },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, context: IParams) {
  try {
    const { params } = context
    const produtoId = Number(params.id)
    const data = await req.json()

    // Se mandar imagens novas, salve apenas os paths
    // (upload para o bucket deve ser feito antes, no back-end)
    const { imagens, ...resto } = data

    const produtoAtualizado = await prisma.produto.update({
      where: { produtoId },
      data: {
        ...resto,
        imagens, // paths como string[]
      },
    })

    return jsonResponse(produtoAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao atualizar produto." },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, context: IParams) {
  try {
    const { params } = context
    const produtoId = Number(params.id)

    // Soft-delete
    const produtoDeletado = await prisma.produto.update({
      where: { produtoId },
      data: { deletedAt: new Date() },
    })

    return jsonResponse(produtoDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao deletar produto." },
      { status: 500 },
    )
  }
}
