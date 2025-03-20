// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcrypt'


export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 })
    }

    // Busca usuário pelo email
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 401 })
    }

    // Validação da senha com bcrypt (se estiver usando)
    const isMatch = await bcrypt.compare(senha, usuario.senhaHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    // Gera token
    const token = signToken({ userId: usuario.usuarioId })

    return NextResponse.json({ token }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
