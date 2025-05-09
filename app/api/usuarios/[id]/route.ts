// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonResponse } from '@/utils/jsonResponse'


interface IParams {
  params: {
    id: string
  }
}

// GET /api/usuarios/:id
export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const usuarioId = Number(params.id)
    const usuario = await prisma.usuario.findUnique({ where: { usuarioId } })
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }
    return jsonResponse(usuario)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar usuário.' }, { status: 500 })
  }
}

// PUT /api/usuarios/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const usuarioId = Number(params.id)
    const data = await req.json()

    const usuarioAtualizado = await prisma.usuario.update({
      where: { usuarioId },
      data: {
        ...data
      },
    })

    return jsonResponse(usuarioAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 })
  }
}

// DELETE /api/usuarios/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const usuarioId = Number(params.id)

    // Soft-delete
    const usuarioDeletado = await prisma.usuario.update({
      where: { usuarioId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(usuarioDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar usuário.' }, { status: 500 })
  }
}
