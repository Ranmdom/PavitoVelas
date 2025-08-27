// lib/melhorEnvio/insertInCart.ts
import { prisma } from "@/lib/prisma";

type Item = { id: string | number; quantity: number };
type ToAddress = {
  cep: string; logradouro: string; numero: string;
  bairro: string; cidade: string; estado: string; // pode vir "PE" ou "Pernambuco"
};
type MEOptions = Partial<{
  receipt: boolean; own_hand: boolean; reverse: boolean; non_commercial: boolean;
  platform: string; tags: Array<{ tag: number | string; url?: string }>;
  invoice: { key: string };
}>;

function meHeaders(token: string) {
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "PavitoVelas (suporte@pavito.com)",
  };
  if (process.env.MELHOR_ENVIO_API_KEY) {
    h["x-api-key"] = process.env.MELHOR_ENVIO_API_KEY.trim();
  }
  return h;
}

// --- UF helpers ---
const UF_MAP: Record<string, string> = {
  "ACRE":"AC","ALAGOAS":"AL","AMAPÁ":"AP","AMAPA":"AP","AMAZONAS":"AM","BAHIA":"BA","CEARÁ":"CE","CEARA":"CE",
  "DISTRITO FEDERAL":"DF","ESPÍRITO SANTO":"ES","ESPIRITO SANTO":"ES","GOIÁS":"GO","GOIAS":"GO","MARANHÃO":"MA","MARANHAO":"MA",
  "MATO GROSSO":"MT","MATO GROSSO DO SUL":"MS","MINAS GERAIS":"MG","PARÁ":"PA","PARA":"PA","PARAÍBA":"PB","PARAIBA":"PB",
  "PARANÁ":"PR","PARANA":"PR","PERNAMBUCO":"PE","PIAUÍ":"PI","PIAUI":"PI","RIO DE JANEIRO":"RJ","RIO GRANDE DO NORTE":"RN",
  "RIO GRANDE DO SUL":"RS","RONDÔNIA":"RO","RONDONIA":"RO","RORAIMA":"RR","SANTA CATARINA":"SC","SÃO PAULO":"SP","SAO PAULO":"SP",
  "SERGIPE":"SE","TOCANTINS":"TO"
};
function toUF(v?: string|null): string {
  const s = (v || "").toString().trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(s)) return s;
  const uf = UF_MAP[s];
  if (uf) return uf;
  // tenta pegar primeiras duas letras válidas (último recurso)
  const m = s.match(/[A-Z]/g);
  if (m && m.length >= 2) return (m[0] + m[1]).toUpperCase();
  return s.slice(0,2);
}
function assertUF(uf: string, label: string) {
  if (!/^[A-Z]{2}$/.test(uf)) {
    throw new Error(`${label}: UF inválida ("${uf}"). Envie UF com 2 letras (ex.: PE).`);
  }
}

// Sanitizadores simples
const onlyDigits = (x?: string|null) => (x || "").replace(/\D/g, "");
const money2 = (n: number) => Number((n || 0).toFixed(2));

/**
 * Insere frete no carrinho do Melhor Envio e persiste:
 * - Pedido.cart_item_id (ID da ordem ME)
 * - Shipments (upsert por melhor_envio_order_id)
 */
export async function insertFreteNoCarrinho(params: {
  pedidoId: bigint;
  userId: bigint;
  serviceId: number;
  items: Item[];
  toAddress?: ToAddress;      // se não vier, busca endereço do usuário no DB
  options?: MEOptions;        // opções do ME (receipt, own_hand, etc.)
  agencyId?: number | null;   // se a transportadora exigir agência
}) {
  const BASE = (process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "").trim();
  const TOKEN = (process.env.MELHOR_ENVIO_TOKEN_SANDBOX || process.env.MELHOR_ENVIO_TOKEN || "").trim();
  if (!BASE || !TOKEN) throw new Error("ENV do Melhor Envio ausente");

  const { pedidoId, userId, serviceId, items, agencyId } = params;

  // 1) Endereço destinatário
  let toAddr = params.toAddress;
  if (!toAddr) {
    const end = await prisma.endereco.findFirst({ where: { usuarioId: userId } });
    if (!end) throw new Error("Endereço do usuário não encontrado");
    toAddr = {
      cep: end.cep || "",
      logradouro: end.logradouro,
      numero: end.numero,
      bairro: end.bairro || "",
      cidade: end.cidade,
      estado: end.estado,
    };
  }

  // 2) Dados do usuário (cpf/telefone/nome)
  const usuario = await prisma.usuario.findUnique({
    where: { usuarioId: userId },
    select: { nome: true, sobrenome: true, cpf: true, celular: true },
  });

  // 3) Produtos → totais (consolidar em 1 volume)
  const produtos = await prisma.produto.findMany({
    where: { produtoId: { in: items.map(i => BigInt(i.id as any)) } },
    select: { produtoId: true, nome: true, preco: true, altura: true, largura: true, peso: true },
  });
  const byId = new Map(produtos.map(p => [p.produtoId.toString(), p]));

  const detalhes = items.map(({ id, quantity }) => {
    const p = byId.get(String(id));
    if (!p) throw new Error(`Produto ${id} não encontrado para frete`);
    const altura = Number(p.altura ?? 4);
    const largura = Number(p.largura ?? 10);
    const pesoKg  = Math.max(Number(p.peso ?? 100) / 1000, 0.05); // kg
    const preco   = Number(p.preco) || 0;
    return { quantity, altura, largura, pesoKg, preco };
  });

  const totalPeso = detalhes.reduce((acc, it) => acc + it.pesoKg * it.quantity, 0);
  const totalValorSeguro = Math.max(
    money2(detalhes.reduce((acc, it) => acc + it.preco * it.quantity, 0)),
    1 // ≥ R$ 1,00
  );

  // Dimensões do volume único (ajuste à sua regra)
  const height = Math.max(10, ...detalhes.map(i => i.altura));
  const width  = Math.max(15, ...detalhes.map(i => i.largura));
  const length = Math.max(15, ...detalhes.map(i => i.largura)); // use comprimento real se tiver

  const volumes = [{
    height, width, length,
    weight: Math.max(totalPeso, 0.05),
    insurance_value: totalValorSeguro,
  }];

  // 4) Remetente/Destinatário
  const fromUF = toUF(process.env.STORE_STATE);
  const toUFv  = toUF(toAddr.estado);

  assertUF(fromUF, "Remetente (from.state_abbr)");
  assertUF(toUFv, "Destinatário (to.state_abbr)");

  const from = {
    name:        (process.env.STORE_NAME || "").trim(),
    document:    onlyDigits(process.env.STORE_DOCUMENT),
    address:     (process.env.STORE_ADDRESS || "").trim(),
    number:      (process.env.STORE_NUMBER || "").trim(),
    district:    (process.env.STORE_DISTRICT || "").trim(),
    city:        (process.env.STORE_CITY || "").trim(),
    state_abbr:  fromUF,
    postal_code: onlyDigits(process.env.FROM_POSTAL_CODE),
    phone:       onlyDigits(process.env.STORE_PHONE),
    country:     "BR",
  };

  const to = {
    name:        `${(usuario?.nome || "").trim()} ${(usuario?.sobrenome || "").trim()}`.trim() || "Cliente",
    document:    onlyDigits(usuario?.cpf),
    address:     toAddr.logradouro.trim(),
    number:      toAddr.numero.trim(),
    district:    (toAddr.bairro || "").trim(),
    city:        toAddr.cidade.trim(),
    state_abbr:  toUFv,
    postal_code: onlyDigits(toAddr.cep),
    phone:       onlyDigits(usuario?.celular),
    country:     "BR",
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const defaultOptions: MEOptions = {
    receipt: false,
    own_hand: false,
    reverse: false,
    non_commercial: true, // se usar NF, troque para options.invoice.key e garanta insurance_value == total NF
    platform: "Pavito",
    tags: [{ tag: Number(pedidoId), url: `${baseUrl}/pedido/${pedidoId}` }],
  };
  const options: MEOptions = { ...defaultOptions, ...(params.options || {}) };

  // 5) POST /me/cart
  const bodyCart: any = { service: serviceId, from, to, volumes, options };
  if (params.agencyId) bodyCart.agency = params.agencyId;

  const cartRes = await fetch(`${BASE}/me/cart`, {
    method: "POST",
    headers: meHeaders(TOKEN),
    body: JSON.stringify(bodyCart),
  });

  const cartTxt = await cartRes.text();
  if (!cartRes.ok) {
    throw new Error(`/me/cart ${cartRes.status}: ${cartTxt.slice(0, 400)}`);
  }

  let cartJson: any; try { cartJson = JSON.parse(cartTxt); } catch { cartJson = {}; }
  const orderId: string = cartJson?.id || cartJson?.cart?.id || cartJson?.orders?.[0]?.id;
  if (!orderId) throw new Error("ME /me/cart sem id retornado");

  console.log(`[ME] Cart criado: orderId=${orderId} uf_from=${fromUF} uf_to=${toUFv} seguro=${totalValorSeguro} peso=${totalPeso.toFixed(3)}kg`);

  // 6) POST /me/orders/{id}/products (numérico)
  const productsPayload = {
    products: items.map(({ id, quantity }) => {
      const p = byId.get(String(id))!;
      return { name: p.nome, quantity: Number(quantity), unitary_value: Number(p.preco) || 0 };
    }),
  };
  console.log("\n\n\n", productsPayload)
  const prodRes = await fetch(`${BASE}/me/orders/${orderId}/products`, {
    method: "POST",
    headers: meHeaders(TOKEN),
    body: JSON.stringify(productsPayload),
  });

  if (!prodRes.ok) {
    const t = await prodRes.text();
    console.warn("[ME] /orders/{id}/products WARN:", prodRes.status, t.slice(0, 500));
  }

  // 7) Persistência
  await prisma.pedido.update({ where: { pedidoId }, data: { cartItemId: orderId } });

  await prisma.shipment.upsert({
    where: { melhorEnvioOrderId: orderId },
    update: { status: "created", updatedAt: new Date() },
    create: { pedidoId, melhorEnvioOrderId: orderId, status: "created", etiquetaUrl: "" },
  });

  return { orderId };
}
