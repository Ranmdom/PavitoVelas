// app/api/enderecos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'

interface IParams {
  params: {
    id: string
  }
}

// GET /api/enderecos/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const enderecoId = Number(params.id)
    const endereco = await prisma.endereco.findUnique({ where: { enderecoId } })
    if (!endereco) {
      return NextResponse.json({ error: 'endereço não encontrado.' }, { status: 404 })
    }
    return jsonResponse(endereco)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar endereço.' }, { status: 500 })
  }
}

// PUT /api/enderecos/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const enderecoId = Number(params.id)
    const data = await req.json()

    const enderecoAtualizado = await prisma.endereco.update({
      where: { enderecoId },
      data: {
        ...data
      },
    })

    return jsonResponse(enderecoAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar endereço.' }, { status: 500 })
  }
}

// DELETE /api/enderecos/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const enderecoId = Number(params.id)

    // Soft-delete
    const enderecoDeletado = await prisma.endereco.update({
      where: { enderecoId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(enderecoDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar endereço.' }, { status: 500 })
  }
}