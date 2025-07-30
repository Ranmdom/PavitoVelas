// app/api/melhorEnvio/InserirFretes/route.ts
import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { prisma }           from "@/lib/prisma";

const TOKEN   = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!;
const CARTURL = "https://sandbox.melhorenvio.com.br/api/v2/me/cart";

// dados da loja
const STORE_NAME    = process.env.STORE_NAME!;
const STORE_ADDRESS = process.env.STORE_ADDRESS!;
const STORE_CITY    = process.env.STORE_CITY!;
const STORE_STATE   = process.env.STORE_STATE!;
const STORE_DOCUMENT = process.env.STORE_DOCUMENT!;

export async function POST(req: Request) {
  // 1) recebe payload do front
  const { toPostal, items, serviceId, options } = await req.json() as {
    toPostal: string;
    items: Array<{ id: string; quantity: number }>;
    serviceId: number;
    options: { receipt: boolean; own_hand: boolean; reverse: boolean; non_commercial: boolean };
  };

  // 2) autentica e busca usuário + endereço + CPF
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = BigInt(session.user.id);

  // busca endereço do usuário
  const endereco = await prisma.endereco.findFirst({
    where: { usuarioId: userId }
  });
  if (!endereco) {
    return NextResponse.json({ error: "Endereço não encontrado" }, { status: 400 });
  }

  // busca usuário incluindo CPF
  const usuario = await prisma.usuario.findUnique({
    where: { usuarioId: userId },
    select: { nome: true, sobrenome: true, cpf: true }
  });
  if (!usuario || !usuario.cpf) {
    return NextResponse.json({ error: "CPF do usuário não cadastrado" }, { status: 400 });
  }

  const fullName = `${usuario.nome} ${usuario.sobrenome}`;
  const cpf      = usuario.cpf;

  // 3) busca dimensões e monta volumes
  const produtoRecords = await prisma.produto.findMany({
    where: { produtoId: { in: items.map(i => BigInt(i.id)) } },
    select: { produtoId: true, preco: true, altura: true, largura: true, peso: true }
  });
  const volumes = items.map(({ id, quantity }) => {
    const p = produtoRecords.find(x => x.produtoId === BigInt(id))!;
    const height = Math.max(p.altura?.toNumber()  ?? 0.4,  0.4);
    const width  = Math.max(p.largura?.toNumber() ?? 1,    1);
    const length = width;
    const weight = Math.max((p.peso?.toNumber() ?? 100) / 1000, 0.01);
    return {
      height,
      width,
      length,
      weight,
      insurance_value: p.preco.toNumber() * quantity,
      quantity
    };
  });

  // 4) monta from e to (com CPF apenas)
  const from = {
    name:        STORE_NAME,
    address:     STORE_ADDRESS,
    document:    STORE_DOCUMENT,
    city:        STORE_CITY,
    state:       STORE_STATE,
    postal_code: process.env.FROM_POSTAL_CODE!,
    country:     "BR"
  };
  const to = {
    name:        fullName,
    document:    usuario.cpf,                                            // CPF do destinatário
    address:     `${endereco.logradouro}, ${endereco.numero}`,
    city:        endereco.cidade,
    state:       endereco.estado,
    postal_code: toPostal,
    country:     "BR"
  };

  // 5) chama o MelhorEnvio
  const resp = await fetch(CARTURL, {
    method:  "POST",
    headers: {
      Accept:        "application/json",
      "Content-Type":"application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent":  "PavitoVelas (suporte@pavito.com)"
    },
    body: JSON.stringify({ from, to, volumes, service: serviceId, options })
  });

  if (!resp.ok) {
    const err = await resp.json();
    console.error("⛔️ ME /me/cart deu erro:", err);
    return NextResponse.json({ error: err.error || err.message }, { status: 500 });
  }

  const cart = await resp.json();
  return NextResponse.json({ cart });
}
