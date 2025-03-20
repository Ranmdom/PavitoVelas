// app/api/metodoPagamentos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
// import bcrypt from 'bcrypt' // caso queira hash de senha aqui também

export async function GET(req: NextRequest) {
  // Exemplo de verificação de token:
  // const token = getTokenFromHeader(req)
  // const decoded = token && verifyToken(token)
  // if (!decoded) {
  //   return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 })
  // }

  try {
    const metodoPagamentos = await prisma.metodoPagamento.findMany()
    return NextResponse.json(metodoPagamentos, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar metodoPagamentos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // data deve conter os campos do modelo, ex:
    // {
    //   metodoPagamentoId?: number,
    //   nome: string,
    //   sobrenome: string,
    //   email: string,
    //   senhaHash: string,
    //   ...
    // }

    // Exemplo de upsert
    const metodoPagamentoUpsert = await prisma.metodoPagamento.upsert({
      where: { metodoPagamentoId: data.metodoPagamentoId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return NextResponse.json(metodoPagamentoUpsert, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar metodoPagamento.' }, { status: 500 })
  }
}
