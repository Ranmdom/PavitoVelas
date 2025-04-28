import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient()
// POST /api/enderecos - Adicionar um novo endereço
export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions)
  
      if (!session || !session.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
  
      const userId = session.user.id
      const body = await request.json()
  
      // Validar dados
      const { logradouro, numero, bairro, cidade, estado, cep } = body
  
      if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
        return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
      }
  
      const novoEndereco = await prisma.endereco.create({
        data: {
          usuarioId: BigInt(userId),
          logradouro,
          numero,
          // complemento: body.complemento || null,
          bairro,
          cidade,
          estado,
          cep,
        },
      })
  
      return NextResponse.json({
        enderecoId: Number(novoEndereco.enderecoId),
        logradouro: novoEndereco.logradouro,
        numero: novoEndereco.numero,
      //   complemento: novoEndereco.complemento,
        bairro: novoEndereco.bairro,
        cidade: novoEndereco.cidade,
        estado: novoEndereco.estado,
        cep: novoEndereco.cep,
      })
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error)
      return NextResponse.json({ error: "Erro ao adicionar endereço" }, { status: 500 })
    }
  }

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    const enderecos = await prisma.endereco.findMany({
      where: {
        usuarioId: BigInt(userId),
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transformar os dados para o formato esperado pelo cliente
    const formattedEnderecos = enderecos.map((endereco) => ({
      enderecoId: Number(endereco.enderecoId),
      logradouro: endereco.logradouro,
      numero: endereco.numero,
    //   complemento: endereco.complemento,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
    }))

    return NextResponse.json(formattedEnderecos)
  } catch (error) {
    console.error("Erro ao buscar endereços:", error)
    return NextResponse.json({ error: "Erro ao buscar endereços" }, { status: 500 })
  }
}