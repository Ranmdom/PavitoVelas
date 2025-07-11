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
    console.log("\n\n\nFetching promotional images")
    const produtos = await prisma.produto.findMany({
      where: { deletedAt: null },
      orderBy: { produtoId: 'asc' },
      take: 5,
    })

    const imagens = produtos
      .map((p) => p.imagens?.[0])
      .map((img) => toPublicUrl(img))
      .filter(Boolean)

    if (!produtos) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      )
    }

    return jsonResponse(imagens)
  } catch (error) {
    console.log("Erro:", error)
    return NextResponse.json(
      { error: error },
      { status: 500 },
    )
  }
}
