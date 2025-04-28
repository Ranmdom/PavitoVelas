// app/api/produtos/[id]/limitada/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IParams { params: { id: string } }

export async function POST(req: NextRequest, { params }: IParams) {
  const produtoId = Number(params.id);

  // Garante que a categoria “Limitada” exista
  let categoria = await prisma.categoria.findFirst({ where: { nome: "Limitada" } });
  if (!categoria) {
    categoria = await prisma.categoria.create({ data: { nome: "Limitada" } });
  }

  // Atualiza o produto para a nova categoria
  await prisma.produto.update({
    where: { produtoId },
    data: { categoriaId: categoria.categoriaId },
  });

  // Retorna um JSON simples (sem BigInt)
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: IParams) {
  const produtoId = Number(params.id);

  // Garante que a categoria “Limitada” não exista
  const categoria = await prisma.categoria.findFirst({ where: { nome: "Limitada" } });
  if (categoria) {
    await prisma.categoria.delete({ where: { categoriaId: categoria.categoriaId } });
  }

  // Atualiza o produto para remover a categoria
  await prisma.produto.update({
    where: { produtoId },
    data: { categoriaId: null },
  });

  // Retorna um JSON simples (sem BigInt)
  return NextResponse.json({ success: true });
}
