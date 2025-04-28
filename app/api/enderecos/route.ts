import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

// GET /api/enderecos - Buscar todos os endereços do usuário
export async function GET() {
  try {
    // const session = await getServerSession(authOptions)
    const session = await getServerSession()

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
      // complemento: endereco.complemento,
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

// POST /api/enderecos - Adicionar um novo endereço
export async function POST(request: Request) {
  try {

    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const userId = session.user.id

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
      // complemento: novoEndereco.complemento,
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


// PUT /api/enderecos/[id] - Atualizar um endereço existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()


    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const enderecoId = BigInt(params.id)
    const body = await request.json()

    // Validar dados
    const { logradouro, numero, bairro, cidade, estado, cep } = body

    if (!logradouro || !numero || !bairro || !cidade || !estado || !cep) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o endereço pertence ao usuário
    const endereco = await prisma.endereco.findFirst({
      where: {
        enderecoId,
        usuarioId: BigInt(userId),
        deletedAt: null,
      },
    })

    if (!endereco) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 })
    }

    const enderecoAtualizado = await prisma.endereco.update({
      where: {
        enderecoId,
      },
      data: {
        logradouro,
        numero,
        // complemento: body.complemento || null,
        bairro,
        cidade,
        estado,
        cep,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      enderecoId: Number(enderecoAtualizado.enderecoId),
      logradouro: enderecoAtualizado.logradouro,
      numero: enderecoAtualizado.numero,
      // complemento: enderecoAtualizado.complemento,
      bairro: enderecoAtualizado.bairro,
      cidade: enderecoAtualizado.cidade,
      estado: enderecoAtualizado.estado,
      cep: enderecoAtualizado.cep,
    })
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error)
    return NextResponse.json({ error: "Erro ao atualizar endereço" }, { status: 500 })
  }
}

// DELETE /api/enderecos/[id] - Excluir um endereço
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    console.log("endereco")

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const enderecoId = BigInt(params.id)

    // Verificar se o endereço pertence ao usuário
    const endereco = await prisma.endereco.findFirst({
      where: {
        enderecoId,
        usuarioId: BigInt(userId),
        deletedAt: null,
      },
    })
    console.log("endereco", endereco)
    if (!endereco) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 })
    }

    // Exclusão lógica (soft delete)
    await prisma.endereco.update({
      where: {
        enderecoId,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir endereço:", error)
    return NextResponse.json({ error: "Erro ao excluir endereço" }, { status: 500 })
  }
}