// app/api/produtos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { Prisma } from '@prisma/client' 
// import bcrypt from 'bcrypt' // caso queira hash de senha aqui também
import { jsonResponse } from '@/utils/jsonResponse'
import { NOMEM } from 'dns'



export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)


    // 🛠️ filtros já existentes
    const categories = searchParams.getAll('categoria')
    const fragrances = searchParams.getAll('fragrancia')
    const pesos = searchParams.getAll('peso')
    const priceRanges = searchParams.getAll('priceRange')
    
    console.log({ categories, fragrances, pesos, priceRanges })


    const where: any = { deletedAt: null }

    if (categories.length) {
      where.categoria = { nome: { in: categories } }
    }

    if (fragrances.length) {
      where.fragrancia = { in: fragrances }
    }

    if (pesos.length) {
      where.peso = { in: pesos.map((p) => parseFloat(p)) }
    }

    if (priceRanges.length) {
      where.OR = priceRanges.map((r) => {
        if (r === '0-50') return { preco: { lte: 50 } }
        if (r === '50-100') return { preco: { gte: 50, lte: 100 } }
        if (r === '100-150') return { preco: { gte: 100, lte: 150 } }
        if (r === '150+') return { preco: { gte: 150 } }
        return {}
      })
    }

    // busca no banco
    const produtos = await prisma.produto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { categoria: true },
    })

    // 📦 mapeia o que o front precisa, incluindo descrição e tempoQueima
    const resultado = produtos.map((produto) => ({
      id: String(produto.produtoId),
      nome: produto.nome,
      categoriaId: produto.categoria?.categoriaId || null,
      categoriaNome: produto.categoria?.nome || 'Categoria não cadastrada',
      fragrancia: produto.fragrancia || 'Fragrância não cadastrada',
      preco: Number(produto.preco),
      peso: produto.peso,
      // ────────────── AQUI ──────────────
      descricao: produto.descricao ?? 'Sem descrição',
      tempoQueima: produto.tempoQueima ?? 0,
      // ───────────────────────────────────
      createdAt: produto.createdAt,
      image: produto.imagens, // seu array de URLs
    }))

    return jsonResponse(resultado)
  } catch (error) {
    console.error('Erro ao buscar produtos filtrados:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 })
  }
}




export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data.nome || !data.preco) {
      return NextResponse.json({ error: 'Nome e preço são obrigatórios.' }, { status: 400 })
    }

    let produto
    if (data.produtoId) {
      produto = await prisma.produto.update({
        where: { produtoId: data.produtoId },
        data: {
          ...data,
          estoque: data.estoque ? Number(data.estoque) : undefined,
          nome: data.nome,
          descricao: data.descricao,
          preco: new Prisma.Decimal(data.preco),
          fragrancia: data.fragrancia,
          peso: data.peso ? new Prisma.Decimal(data.peso) : undefined,
          tempoQueima: data.tempoQueima ? Number(data.tempoQueima) : undefined,
          deletedAt: null,
        },
      })
    } else {
      if(!data.categoriaId) {
        return NextResponse.json({ error: 'Categoria é obrigatória.' }, { status: 400 })
      }
      produto = await prisma.produto.create({
        data: {
          nome: data.nome,
          estoque: data.estoque ? Number(data.estoque) : undefined,
          descricao: data.descricao,
          preco: new Prisma.Decimal(data.preco),
          fragrancia: data.fragrancia,
          peso: data.peso ? new Prisma.Decimal(data.peso) : undefined,
          tempoQueima: data.tempoQueima ? Number(data.tempoQueima) : undefined,
          deletedAt: null,
          categoria: { connect: { categoriaId: data.categoriaId } },
          imagens: data.imagens || [], // Adiciona o campo de imagens
        },
      })
    }

    return jsonResponse(produto)
  } catch (error: any) {
    console.error('Erro ao criar/atualizar produto:', error.message, error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar produto.' }, { status: 500 })
  }
}

