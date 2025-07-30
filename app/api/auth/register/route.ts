// app/api/auth/register/route.ts
import 'dotenv/config'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { jsonResponse } from '@/utils/jsonResponse'

export async function POST(req: NextRequest) {
  try {
    // 1) Puxa o CPF junto com os outros campos
    const { nome, sobrenome, email, senha, cpf } = await req.json()

    // 2) Valida
    if (!nome || !sobrenome || !email || !senha || !cpf) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }
    // (Opcional) validar formato de CPF aqui, ex: /^\d{11}$/

    // 3) Verifica email existente
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 400 })
    }

    // 4) Hash da senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    // 5) Cria usuário incluindo o CPF
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        sobrenome,
        email,
        senhaHash,
        cpf: cpf.replace(/\D/g, '')   // armazena só dígitos
      },
    })

    return jsonResponse(novoUsuario, 201)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno ao criar usuário.' }, { status: 500 })
  }
}



