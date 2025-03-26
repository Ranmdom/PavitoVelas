// app/api/auth/register/route.ts
import 'dotenv/config'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { jsonResponse } from '@/utils/jsonResponse'

export async function POST(req: NextRequest) {
  try {
    const { nome, sobrenome, email, senha } = await req.json()

    if (!nome || !sobrenome || !email || !senha) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    // Verifica se o email já existe
    console.log('🔎 DATABASE_URL EM USO:', process.env.DATABASE_URL)
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 400 })
    }

    // Gera hash da senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        sobrenome,
        email,
        senhaHash,
      },
    })

    return jsonResponse(novoUsuario, 201)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno ao criar usuário.' }, { status: 500 })
  }
}

