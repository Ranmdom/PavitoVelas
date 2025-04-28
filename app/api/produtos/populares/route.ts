// app/api/produtos/populares/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/utils/jsonResponse";
import { supabase } from "@/lib/supabase";

function toPublicUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return supabase.storage.from("produtos").getPublicUrl(path).data.publicUrl!;
}

async function formatProduto(produtoId: number) {
  const p = await prisma.produto.findUnique({
    where: { produtoId },
    include: { categoria: true },
  });
  if (!p) return null;

  const urls = (p.imagens ?? [])
    .map((path) => toPublicUrl(path))
    .filter((u): u is string => Boolean(u));

  return {
    id: String(p.produtoId),
    nome: p.nome,
    preco: Number(p.preco),
    categoria: p.categoria?.nome ?? "Sem categoria",
    peso: p.peso ? `${p.peso}g` : "",
    image: urls[0] ?? "/placeholder.svg",
  };
}

export async function GET(_req: NextRequest) {
  try {
    /** ─── 1. 4 mais vendidos ──────────────────────────────────── */
    const top = await prisma.itemPedido.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: { deletedAt: null },
      orderBy: { _sum: { quantidade: "desc" } },
      take: 4,
    });

    let produtos;

    /** ─── 2a. se houver mais vendidos, usa-os ─────────────────── */
    if (top.length > 0) {
      produtos = await Promise.all(
        top.map(({ produtoId }) => formatProduto(Number(produtoId)))
      );
    } else {
      /** ─── 2b. senão, pega 4 produtos aleatórios ─────────────── */
      const todos = await prisma.produto.findMany({
        where: { deletedAt: null },
        include: { categoria: true },
      });

      // embaralhar em memória
      const randomFour = todos
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map((p) => ({
          id: String(p.produtoId),
          nome: p.nome,
          preco: Number(p.preco),
          categoria: p.categoria?.nome ?? "Sem categoria",
          peso: p.peso ? `${p.peso}g` : "",
          image:
            (p.imagens ?? [])
              .map((path) => toPublicUrl(path))
              .filter((u): u is string => Boolean(u))[0] ?? "/placeholder.svg",
        }));

      produtos = randomFour;
    }

    const resultado = produtos.filter(
      (x): x is Exclude<typeof x, null> => Boolean(x)
    );

    console.log("produtos populares", resultado);

    return jsonResponse(resultado);
  } catch (err) {
    console.error("Erro ao buscar produtos populares:", err);
    return NextResponse.json(
      { error: "Erro ao buscar produtos populares" },
      { status: 500 }
    );
  }
}
