import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { jsonResponse } from '@/utils/jsonResponse';

/**
 * GET /api/produtos/relacionados?id={produtoId}
 * Retorna produtos relacionados à mesma categoria do produto informado.
 */
export async function GET(req: NextRequest) {
  try {
    // Validação do parâmetro `id`
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (!idParam) {
      return NextResponse.json({ error: 'Parâmetro "id" é obrigatório' }, { status: 400 });
    }
    const produtoId = Number(idParam);
    if (isNaN(produtoId)) {
      return NextResponse.json({ error: 'Parâmetro "id" inválido' }, { status: 400 });
    }

    // Busca o produto para obter categoriaId
    const produto = await prisma.produto.findUnique({
      where: { produtoId: BigInt(produtoId) },
      select: { categoriaId: true }
    });
    if (!produto || !produto.categoriaId) {
      return NextResponse.json({ error: 'Produto não encontrado ou sem categoria' }, { status: 404 });
    }

    // Busca produtos relacionados (mesma categoria, exceto o próprio)
    const relacionados = await prisma.produto.findMany({
      where: {
        categoriaId: produto.categoriaId,
        deletedAt: null,
        produtoId: { not: BigInt(produtoId) }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { categoria: true },
    });

    // Mapeia para estrutura esperada pelo front
    const resultado = relacionados.map((p) => ({
      id: p.produtoId.toString(),
      nome: p.nome,
      categoriaId: p.categoria?.categoriaId ?? null,
      categoriaNome: p.categoria?.nome ?? 'Categoria não cadastrada',
      fragrancia: p.fragrancia ?? 'Fragrância não cadastrada',
      preco: Number(p.preco),
      peso: p.peso ?? null,
      descricao: p.descricao ?? 'Sem descrição',
      tempoQueima: p.tempoQueima ?? 0,
      createdAt: p.createdAt,
      imagens: p.imagens,
    }));

    return jsonResponse({ data: resultado });
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
