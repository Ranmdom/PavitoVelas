import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/auth"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) {
      return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 })
    }

    // Busca usuário pelo email
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 401 })
    }
    console.log(senha)
    // Validação da senha com bcrypt
    const isMatch = await bcrypt.compare(senha, usuario.senhaHash)

    if (!isMatch) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }

    // Gera token com informações adicionais
    const token = signToken({
      userId: Number(usuario.usuarioId),
      tipo: usuario.tipo,
    })

    return NextResponse.json(
      {
        token,
        usuario: {
          id: String(usuario.usuarioId),
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}

