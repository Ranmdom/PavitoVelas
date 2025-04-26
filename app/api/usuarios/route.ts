// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'
// import bcrypt from 'bcrypt' // caso queira hash de senha aqui também

export async function GET(req: NextRequest) {
  const url      = req.nextUrl
  const page     = parseInt(url.searchParams.get("page")     || "1", 10)
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10)
  const skip     = (page - 1) * pageSize
  const take     = pageSize

  // filtrar só não-admin
  const baseWhere = { tipo: { not: "admin" } }

  try {
    // 1) total de usuários não-admin
    const totalItems = await prisma.usuario.count({
      where: baseWhere,
    })

    // 2) busca paginada, ordenando por contagem de pedidos (desc)
    // dentro do seu GET…
    const usuarios = await prisma.usuario.findMany({
      where: { tipo: { not: "admin" } },  // só não-admin
      skip,
      take,
      orderBy: {
        pedidos: {
          _count: "desc",                  // <— aqui
        },
      },
      select: {
        usuarioId: true,
        nome:       true,
        email:      true,
        tipo:       true,
        createdAt:  true,
        _count: {
          select: { pedidos: true },      // mantém o select do count
        },
      },
    });


    // 3) converter BigInt (se necessário) e enviar JSON
    return NextResponse.json({
      data: usuarios.map(u => ({
        usuarioId: u.usuarioId.toString(),
        nome:      u.nome,
        email:     u.email,
        tipo:      u.tipo,
        createdAt: u.createdAt, 
        pedidos: u._count.pedidos,  // já número
      })),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários.' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // data deve conter os campos do modelo, ex:
    // {
    //   usuarioId?: number,
    //   nome: string,
    //   sobrenome: string,
    //   email: string,
    //   senhaHash: string,
    //   ...
    // }

    // Exemplo de upsert
    const usuarioUpsert = await prisma.usuario.upsert({
      where: { usuarioId: data.usuarioId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return jsonResponse(usuarioUpsert)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar usuário.' }, { status: 500 })
  }
}
