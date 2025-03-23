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
    const categoriaId = Number(params.id)
    const usuario = await prisma.categoria.findUnique({ where: { categoriaId } })
    if (!usuario) {
      return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
    }
    return jsonResponse(usuario)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar a categoria.' }, { status: 500 })
  }
}

// PUT /api/usuarios/:id
export async function PUT(req: NextRequest, { params }: IParams) {
  try {
    const categoriaId = Number(params.id)
    const data = await req.json()

    const usuarioAtualizado = await prisma.categoria.update({
      where: { categoriaId },
      data: {
        ...data
      },
    })

    return jsonResponse(usuarioAtualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar a categoria.' }, { status: 500 })
  }
}

// DELETE /api/usuarios/:id
export async function DELETE(req: NextRequest, { params }: IParams) {
  try {
    const categoriaId = Number(params.id)

    // Soft-delete
    const usuarioDeletado = await prisma.categoria.update({
      where: { categoriaId },
      data: {
        deletedAt: new Date(),
      },
    })

    return jsonResponse(usuarioDeletado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar a categoria.' }, { status: 500 })
  }
}
