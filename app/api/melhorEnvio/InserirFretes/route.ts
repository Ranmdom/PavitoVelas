// app/api/melhorEnvio/InserirFretes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";



const TOKEN = process.env.MELHOR_ENVIO_TOKEN_SANDBOX!;
const BASEURL = `${process.env.BASEURL_MELHOR_ENVIO}`;

// dados da loja
const STORE_NAME = process.env.STORE_NAME!;
const STORE_ADDRESS = process.env.STORE_ADDRESS!;
const STORE_CITY = process.env.STORE_CITY!;
const STORE_STATE = process.env.STORE_STATE!;
const STORE_DOCUMENT = process.env.STORE_DOCUMENT!;
const STORE_PHONE = process.env.STORE_PHONE!;

export async function POST(req: Request) {
  try {
    // 1) recebe payload do front
    const { toPostal, items, serviceId, options, pedidoId } = await req.json() as {
      toPostal: string;
      items: Array<{ id: string; quantity: number }>;
      serviceId: number;
      options: { receipt: boolean; own_hand: boolean; reverse: boolean; non_commercial: boolean };
      pedidoId?: string | number;
    };

    
    // 2) autentica o usuário
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = BigInt(session.user.id);

    // 3) busca endereço do usuário
    const endereco = await prisma.endereco.findFirst({ where: { usuarioId: userId } });
    if (!endereco) {
      return NextResponse.json({ error: "Endereço não encontrado" }, { status: 400 });
    }

    // 4) busca usuário (nome + CPF + celular)
    const usuario = await prisma.usuario.findUnique({
      where: { usuarioId: userId },
      select: { nome: true, sobrenome: true, cpf: true, celular: true }
    });
    if (!usuario?.cpf) {
      return NextResponse.json({ error: "CPF do usuário não cadastrado" }, { status: 400 });
    }
    if(!usuario?.celular){
      return NextResponse.json({ error: "Celular do usuário não cadastrado"}, {status: 400})
    }
    const fullName = `${usuario.nome} ${usuario.sobrenome}`;
    const cpf = usuario.cpf.replace(/\D/g, "");
    const phone = usuario.celular
      .replace(/\D/g, '')                   // remove tudo que não é dígito
      .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');

    // 5) busca dimensões e monta volumes
    const produtoRecords = await prisma.produto.findMany({
      where: { produtoId: { in: items.map(i => BigInt(i.id)) } },
      select: { produtoId: true, nome: true, preco: true, altura: true, largura: true, peso: true }
    });
    const volumes = items.map(({ id, quantity }) => {
      const p = produtoRecords.find(x => x.produtoId === BigInt(id))!;
      const height = Math.max(p.altura?.toNumber() ?? 0.4, 0.4);
      const width = Math.max(p.largura?.toNumber() ?? 1, 1);
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

    // 6) monta payload de remetente e destinatário
    const from = {
      name: STORE_NAME,
      document: STORE_DOCUMENT,
      address: STORE_ADDRESS,
      city: STORE_CITY,
      state: STORE_STATE,
      postal_code: process.env.FROM_POSTAL_CODE!,
      phone: STORE_PHONE,
      country: "BR"
    };
    const to = {
      name: fullName,
      document: cpf,
      address: `${endereco.logradouro}, ${endereco.numero}`,
      city: endereco.cidade,
      state: endereco.estado,
      postal_code: toPostal,
      phone: phone,
      country: "BR"
    };

    // 7) insere o frete no carrinho
    const cartResp = await fetch(`${BASEURL}/me/cart`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "PavitoVelas (suporte@pavito.com)"
      },
      body: JSON.stringify({ from, to, volumes, service: serviceId, options })
    });
    const cartData = await cartResp.json();
    const cartItemId = cartData.id 
    if (!cartResp.ok) {
      console.error("Erro /me/cart:", cartData);
      return NextResponse.json({ error: cartData.error || cartData.message }, { status: 500 });
    }

    // 8) extrai orderId (ID do carrinho) para declarar produtos
    const orderId = cartData.id || cartData.cart?.id || cartData.orders?.[0]?.id;
    if (!orderId) {
      console.error("orderId não encontrado em /me/cart:", cartData);
      return NextResponse.json({ error: "orderId não encontrado" }, { status: 500 });
    }

    // 9) declara os produtos na ordem
    const productsPayload = {
      products: items.map(({ id, quantity }) => {
        const p = produtoRecords.find(x => x.produtoId === BigInt(id))!;
        return {
          name: p.nome,
          quantity: quantity.toString(),
          unitary_value: p.preco.toNumber().toFixed(2)
        };
      })
    };
    const prodResp = await fetch(
      `${BASEURL}/me/orders/${orderId}/products`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
          "User-Agent": "PavitoVelas (suporte@pavito.com)"
        },
        body: JSON.stringify(productsPayload)
      }
    );
    const prodData = await prodResp.json();
    if (!prodResp.ok) {
      console.error("Erro /me/orders/{orderId}/products:", prodData);
      return NextResponse.json({ error: prodData.error || prodData.message }, { status: 500 });
    }

    // 10) salva o orderId no banco para uso posterior
    if (pedidoId) {
  // primeiro atualiza o Pedido com o cartItemId
    await prisma.pedido.update({
      where: { pedidoId: BigInt(pedidoId) },
      data: { cartItemId: orderId },
    });

  // depois cria o Shipment (como você já faz)
  await prisma.shipment.create({
    data: {
      pedidoId:           BigInt(pedidoId),
      melhorEnvioOrderId: orderId,
      etiquetaUrl:        "",
      status:             "prepared",
    },
  });
}

    // 11) retorna dados ao front
    return NextResponse.json({ cart: cartData, products: prodData, orderId });

  } catch (err) {
    console.error("Erro em InserirFretes:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
