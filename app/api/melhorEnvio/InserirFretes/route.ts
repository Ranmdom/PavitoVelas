import { NextResponse }    from "next/server";
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

export async function POST(req: Request) {
  // 1) recebe todos os campos que o front agora envia
  const { 
    toPostal, 
    cpf,         // <— novo! 
    items, 
    serviceId, 
    options 
  } = await req.json() as {
    toPostal: string;
    cpf?:      string;
    cnpj?:    string;                     // adiciona aqui
    items:    Array<{ id: string; quantity: number }>;
    serviceId: number;
    options:  {
      receipt:       boolean;
      own_hand:      boolean;
      reverse:       boolean;
      non_commercial:boolean;
    };
  };

  // 2) autentica e busca endereço do user
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = BigInt(session.user.id);
  const endereco = await prisma.endereco.findFirst({
    where: { usuarioId: userId }
  });
  if (!endereco)
    return NextResponse.json({ error: "Endereço não encontrado" }, { status: 400 });

  const usuario = await prisma.usuario.findUnique({
  where: { usuarioId: userId },
  select: { nome: true, sobrenome: true, cpf: true }
  });
  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  if (!usuario.cpf) {
    return NextResponse.json({ error: "CPF do usuário não cadastrado" }, { status: 400 });
  }
  const fullName = usuario
    ? `${usuario.nome} ${usuario.sobrenome}`
    : session.user.email;  // fallback
  // 3) busca dimensões/peso no banco
  const ids = items.map(i => BigInt(i.id));
  const produtos = await prisma.produto.findMany({
    where: { produtoId: { in: ids } },
    select: {
      produtoId: true,
      preco:      true,
      altura:     true,
      largura:    true,
      peso:       true
    }
  });

  // 4) monta volumes corretos
  const volumes = items.map(({ id, quantity }) => {
    const p = produtos.find(x => x.produtoId === BigInt(id))!;
    const h  = Math.max(p.altura?.toNumber()  ?? 0.4,  0.4);
    const w  = Math.max(p.largura?.toNumber() ?? 1,    1);
    const l  = Math.max(p.largura?.toNumber() ?? 1,    1);
    const kg = Math.max((p.peso?.toNumber()   ?? 100) / 1000, 0.01);

    return {
      height:          h,
      width:           w,
      length:          l,
      weight:          kg,
      insurance_value: p.preco.toNumber() * quantity,
      quantity
    };
  });

  // 5) monta from/to
  const from = {
    name:        STORE_NAME,
    address:     STORE_ADDRESS,
    city:        STORE_CITY,
    state:       STORE_STATE,
    postal_code: process.env.FROM_POSTAL_CODE!,
    country:     "BR"
  };
  const to = {
    name:        fullName,
    cpf:         usuario.cpf,
    address:     `${endereco.logradouro}, ${endereco.numero}`,
    city:        endereco.cidade,
    state:       endereco.estado,
    postal_code: toPostal,
    country:     "BR"
  };

  // 6) chama o MelhorEnvio
  const resp = await fetch(CARTURL, {
    method:  "POST",
    headers: {
      Accept:        "application/json",
      "Content-Type":"application/json",
      Authorization: `Bearer ${TOKEN}`,
      "User-Agent":  "PavitoVelas (suporte@pavito.com)"
    },
    body: JSON.stringify({
      from,
      to,
      volumes,
      service: serviceId,
      options
    })
  });
  if (!resp.ok) {
    const err = await resp.json();
    console.error("⛔️ ME /me/cart deu erro:", err);
    return NextResponse.json({ error: err.error || err.message }, { status: 500 });
  }

  const cart = await resp.json();
  return NextResponse.json({ cart });
}
