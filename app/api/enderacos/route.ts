// app/api/enderecos/route.ts
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
    const enderecos = await prisma.endereco.findMany()
    return NextResponse.json(enderecos, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar endereços.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // data deve conter os campos do modelo, ex:
    // {
    //   enderecoId?: number,
    //   nome: string,
    //   sobrenome: string,
    //   email: string,
    //   senhaHash: string,
    //   ...
    // }

    // Exemplo de upsert
    const enderecoUpsert = await prisma.endereco.upsert({
      where: { enderecoId: data.enderecoId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return NextResponse.json(enderecoUpsert, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar endereço.' }, { status: 500 })
  }
}
