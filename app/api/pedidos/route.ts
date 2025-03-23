// app/api/pedidos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { jsonResponse } from '@/utils/jsonResponse'
// import bcrypt from 'bcrypt' // caso queira hash de senha aqui também

export async function GET(req: NextRequest) {
  // Exemplo de verificação de token:
  // const token = getTokenFromHeader(req)
  // const decoded = token && verifyToken(token)
  // if (!decoded) {
  //   return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 })
  // }

  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itensPedido: {
          include: {
            produto: true, // inclui os dados do produto relacionado a cada item do pedido
          }
        },
        // Se desejar, pode incluir outros relacionamentos, como usuário e pagamentos:
        usuario: true,
        pagamentos: true
      }
    })
    return jsonResponse(pedidos)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar pedidos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // data deve conter os campos do modelo, ex:
    // {
    //   pedidoId?: number,
    //   nome: string,
    //   sobrenome: string,
    //   email: string,
    //   senhaHash: string,
    //   ...
    // }

    // Exemplo de upsert
    const pedidoUpsert = await prisma.pedido.upsert({
      where: { pedidoId: data.pedidoId || 0 },
      create: {
        ...data
      },
      update: {
        ...data
      },
    })

    return jsonResponse(pedidoUpsert)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar pedido.' }, { status: 500 })
  }
}
