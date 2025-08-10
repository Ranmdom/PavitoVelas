// app/api/auth/register/admin/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { jsonResponse } from '@/utils/jsonResponse'

// Código de administrador (em produção, isso deveria estar em variáveis de ambiente)
const ADMIN_CODE = "pavito-admin-2023"

export async function POST(req: NextRequest) {
  try {
    const { nome, sobrenome, email, senha, codigoAdmin } = await req.json()

    if (!nome || !sobrenome || !email || !senha || !codigoAdmin) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 })
    }

    // Verifica o código de administrador
    if (codigoAdmin !== ADMIN_CODE) {
      return NextResponse.json({ error: "Código de administrador inválido." }, { status: 403 })
    }

    // Verifica se o email já existe
    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 })
    }

    // Gera hash da senha
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash(senha, salt)

    const novoAdmin = await prisma.usuario.create({
      data: {
        nome,
        sobrenome,
        email,
        senhaHash,
        tipo: "admin",
      },
    })

    // Remove a senha hash da resposta
    const { senhaHash: _, ...adminSemSenha } = novoAdmin

    return jsonResponse(adminSemSenha, 201 )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno ao criar administrador." }, { status: 500 })
  }
}

