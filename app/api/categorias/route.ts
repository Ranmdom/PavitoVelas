// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
// import bcrypt from 'bcrypt' // caso queira hash de senha aqui também
import { jsonResponse } from '@/utils/jsonResponse'

export async function GET(req: NextRequest) {
  // Exemplo de verificação de token:
  // const token = getTokenFromHeader(req)
  // const decoded = token && verifyToken(token)
  // if (!decoded) {
  //   return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 })
  // }

  try {
    const usuarios = await prisma.categoria.findMany()
    return jsonResponse(usuarios)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar a categoria.' }, { status: 500 })
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
    const categoriaUpsert = await prisma.categoria.upsert({
      where: { categoriaId: data.categoriaId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return jsonResponse(categoriaUpsert)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar a categoria.' }, { status: 500 })
  }
}
