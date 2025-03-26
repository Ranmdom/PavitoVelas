// app/api/produtos/route.ts
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
    const produtos = await prisma.produto.findMany({
      include:{
        categoria:true
      }
    })
    return jsonResponse(produtos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // data deve conter os campos do modelo, ex:
    // {
    //   produtoId?: number,
    //   nome: string,
    //   sobrenome: string,
    //   email: string,
    //   senhaHash: string,
    //   ...
    // }

    // Exemplo de upsert
    const produtoUpsert = await prisma.produto.upsert({
      where: { produtoId: data.produtoId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return jsonResponse(produtoUpsert)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar produto.' }, { status: 500 })
  }
}
