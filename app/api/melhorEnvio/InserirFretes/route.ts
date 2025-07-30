// app/api/melhorEnvio/InserirFretes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/app/api/auth/[...nextauth]/route";
import { prisma }           from "@/lib/prisma";

const TOKEN      = process.env.MELHOR_ENVIO_TOKEN!;

// variáveis da sua loja (adicione no .env.local)
const STORE_NAME    = process.env.STORE_NAME!;
const STORE_ADDRESS = process.env.STORE_ADDRESS!;
const STORE_CITY    = process.env.STORE_CITY!;
const STORE_STATE   = process.env.STORE_STATE!;

export async function POST(req: Request) {
  // 1) Extrai payload do front
  const { toPostal, serviceId, volumes, options } = await req.json() as {
    toPostal: string;
    serviceId: number;
    volumes: Array<{
      height: number;
      width: number;
      length: number;
      weight: number;
      insurance_value?: number;
      quantity?: number;
    }>;
    options: {
      receipt: boolean;
      own_hand: boolean;
      reverse: boolean;
      non_commercial: boolean;
    };
  };

  // 2) Autentica usuário e busca endereço salvo
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = BigInt(session.user.id);
  const endereco = await prisma.endereco.findFirst({
    where: { usuarioId: userId }
  });
  if (!endereco) {
    return NextResponse.json({ error: "Endereço não encontrado" }, { status: 400 });
  }

  // 3) Monta os objetos from e to
  const from = {
    name:        STORE_NAME,
    address:     STORE_ADDRESS,
    city:        STORE_CITY,
    state:       STORE_STATE,
    postal_code: process.env.FROM_POSTAL_CODE!,
    country:     "BR"
  };
  const to = {
    name:        `${session.user.name}`,                        // ou outro campo nome
    address:     `${endereco.logradouro}, ${endereco.numero}`,
    city:        endereco.cidade,
    state:       endereco.estado,
    postal_code: toPostal,
    country:     "BR"
  };

  // 4) Chama o /me/cart do MelhorEnvio
  const resp = await fetch(`"https://sandbox.melhorenvio.com.br/api/v2"/me/cart`, {
    method: "POST",
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
    return NextResponse.json({ error: err.error || "Falha ao inserir frete" }, { status: 500 });
  }

  const cart = await resp.json();
  return NextResponse.json({ cart });
}
