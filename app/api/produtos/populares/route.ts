// app/api/produtos/populares/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jsonResponse } from "@/utils/jsonResponse"
import { supabase } from "@/lib/supabase"

function toPublicUrl(path?: string | null) {
  if (!path) return null
  if (path.startsWith("http")) return path
  return supabase
    .storage
    .from("produtos")
    .getPublicUrl(path)
    .data
    .publicUrl!
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ pega os 4 produtos com mais quantidade vendida
    const top = await prisma.itemPedido.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: { deletedAt: null },
      orderBy: { _sum: { quantidade: "desc" } },
      take: 4,
    })

    // 2️⃣ busca dados completos (imagem está em scalar p.imagens)
    const populares = await Promise.all(
      top.map(async ({ produtoId }) => {
        const p = await prisma.produto.findUnique({
          where: { produtoId: Number(produtoId) },
          include: { categoria: true },  // apenas categoria
        })
        if (!p) return null

        // p.imagens já existe como string[]
        const urls = (p.imagens ?? [])
          .map((path) => toPublicUrl(path))
          .filter((u): u is string => Boolean(u))

        return {
          id: String(p.produtoId),
          nome: p.nome,
          preco: Number(p.preco),
          categoria: p.categoria?.nome ?? "Sem categoria",
          peso: p.peso ? `${p.peso}g` : "",
          image: urls[0] ?? "/placeholder.svg",
        }
      })
    )

    const resultado = populares.filter((x): x is Exclude<typeof x, null> => Boolean(x))
    return jsonResponse(resultado)
  } catch (err) {
    console.error("Erro ao buscar produtos populares:", err)
    return NextResponse.json(
      { error: "Erro ao buscar produtos populares" },
      { status: 500 }
    )
  }
}
