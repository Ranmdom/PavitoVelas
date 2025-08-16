// lib/melhorEnvio/insertInCart.ts
import { prisma } from "@/lib/prisma";

type Item = { id: string | number; quantity: number };
type ToAddress = {
  cep: string; logradouro: string; numero: string;
  bairro: string; cidade: string; estado: string;
};
type MEOptions = Partial<{
  receipt: boolean; own_hand: boolean; reverse: boolean; non_commercial: boolean;
  platform: string; tags: Array<{ tag: number | string; url?: string }>;
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

/**
 * Insere frete no carrinho do Melhor Envio e persiste:
 * - Pedido.cart_item_id
 * - Shipments (upsert por melhor_envio_order_id)
 */
export async function insertFreteNoCarrinho(params: {
  pedidoId: bigint;
  userId: bigint;
  serviceId: number;
  items: Item[];
  toAddress?: ToAddress;      // se não vier, busca endereço do usuário no DB
  options?: MEOptions;        // opções do ME (receipt, own_hand, etc.)
}) {
  const BASE = (process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "").trim();
  const TOKEN = (process.env.MELHOR_ENVIO_TOKEN_SANDBOX || process.env.MELHOR_ENVIO_TOKEN || "").trim();
  if (!BASE || !TOKEN) throw new Error("ENV do Melhor Envio ausente");

  const { pedidoId, userId, serviceId, items } = params;

  // 1) endereço do destinatário
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

  // 2) dados do usuário (cpf/telefone/nome)
  const usuario = await prisma.usuario.findUnique({
    where: { usuarioId: userId },
    select: { nome: true, sobrenome: true, cpf: true, celular: true },
  });

  // 3) produtos -> volumes
  const produtos = await prisma.produto.findMany({
    where: { produtoId: { in: items.map(i => BigInt(i.id as any)) } },
    select: { produtoId: true, nome: true, preco: true, altura: true, largura: true, peso: true },
  });
  const byId = new Map(produtos.map(p => [p.produtoId.toString(), p]));

  const volumes = items.map(({ id, quantity }) => {
    const p = byId.get(String(id))!;
    const altura = Number(p.altura ?? 4);
    const largura = Number(p.largura ?? 10);
    const pesoG   = Number(p.peso   ?? 100);
    return {
      height: Math.max(altura, 4),
      width:  Math.max(largura, 10),
      length: Math.max(largura, 10),
      weight: Math.max(pesoG / 1000, 0.05), // kg
      insurance_value: +(Number(p.preco) * quantity).toFixed(2),
      quantity,
    };
  });

  // 4) remetente/destinatário
  const from = {
    name:        process.env.STORE_NAME!,
    document:    process.env.STORE_DOCUMENT!,               // CPF/CNPJ
    address:     process.env.STORE_ADDRESS!,
    city:        process.env.STORE_CITY!,
    state:       process.env.STORE_STATE!,
    postal_code: (process.env.FROM_POSTAL_CODE || "").replace(/\D/g, ""),
    phone:       (process.env.STORE_PHONE || "").replace(/\D/g, ""),
    country:     "BR",
  };
  const to = {
    name:        `${usuario?.nome ?? ""} ${usuario?.sobrenome ?? ""}`.trim() || "Cliente",
    document:    (usuario?.cpf || "").replace(/\D/g, ""),
    address:     toAddr.logradouro.trim(),
    number:      toAddr.numero.trim(),
    district:    (toAddr.bairro || "").trim(),
    city:        toAddr.cidade.trim(),
    state_abbr:  toAddr.estado.toUpperCase(),
    postal_code: toAddr.cep.replace(/\D/g, ""),
    phone:       (usuario?.celular || "").replace(/\D/g, ""),
    country:     "BR",
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const defaultOptions: MEOptions = {
    receipt: false, own_hand: false, reverse: false, non_commercial: true,
    platform: "Pavito",
    tags: [{ tag: Number(pedidoId), url: `${baseUrl}/pedido/${pedidoId}` }],
  };
  const options = { ...defaultOptions, ...(params.options || {}) };

  // 5) POST /me/cart
  const cartRes = await fetch(`${BASE}/me/cart`, {
    method: "POST",
    headers: meHeaders(TOKEN),
    body: JSON.stringify({ service: serviceId, from, to, volumes, options }),
  });
  const cartTxt = await cartRes.text();
  if (!cartRes.ok) throw new Error(`/me/cart ${cartRes.status}: ${cartTxt.slice(0, 300)}`);
  let cartJson: any; try { cartJson = JSON.parse(cartTxt); } catch { cartJson = {}; }
  const orderId: string = cartJson?.id || cartJson?.cart?.id || cartJson?.orders?.[0]?.id;
  if (!orderId) throw new Error("ME /me/cart sem id");

  // 6) POST /me/orders/{id}/products
  const productsPayload = {
    products: items.map(({ id, quantity }) => {
      const p = byId.get(String(id))!;
      return { name: p.nome, quantity: String(quantity), unitary_value: +Number(p.preco).toFixed(2) };
    }),
  };
  const prodRes = await fetch(`${BASE}/me/orders/${orderId}/products`, {
    method: "POST",
    headers: meHeaders(TOKEN),
    body: JSON.stringify(productsPayload),
  });
  if (!prodRes.ok) {
    const t = await prodRes.text();
    console.warn("ME products WARN:", prodRes.status, t.slice(0, 200));
  }

  // 7) persistir no DB
  await prisma.pedido.update({ where: { pedidoId }, data: { cartItemId: orderId } });
  await prisma.shipment.upsert({
    where: { melhorEnvioOrderId: orderId },
    update: { status: "created", updatedAt: new Date() },
    create: { pedidoId, melhorEnvioOrderId: orderId, status: "created", etiquetaUrl: "" },
  });

  return { orderId };
}
