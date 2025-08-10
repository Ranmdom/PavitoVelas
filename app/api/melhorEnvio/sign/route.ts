// app/api/melhorEnvio/sign/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

export const runtime = "nodejs";
const ME_TOKEN   = process.env.MELHOR_ENVIO_TOKEN!;               // produção/sandbox conforme seu env
const FROM_POST  = process.env.FROM_POSTAL_CODE!;
const SECRET     = process.env.SHIPPING_TOKEN_SECRET!;
const THRESHOLD_FREE_CENTS = 15000; // R$150,00

const BodySchema = z.object({
  postalCode: z.string().min(8),
  items: z.array(z.object({
    id: z.string().regex(/^\d+$/),
    quantity: z.number().int().min(1).max(50),
  })).min(1).max(100),
  serviceId: z.number().int().optional(), // ausente => frete grátis (se elegível)
});

// helper: digest dos itens para amarrar token ao carrinho
function itemsDigest(items: {id:string;quantity:number}[]) {
  const norm = [...items].sort((a,b)=>a.id.localeCompare(b.id)).map(i=>`${i.id}x${i.quantity}`).join("|");
  return crypto.createHash("sha256").update(norm).digest("hex");
}

// assina payload: base64url(payload) + "." + hmac
function sign(payload: object) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", SECRET).update(b64).digest("hex");
  return `${b64}.${mac}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const uid = session.user.id;

    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    const { postalCode, items, serviceId } = parsed.data;

    // Carrega produtos para calcular peso/dimensões + subtotal server-side
    const ids = Array.from(new Set(items.map(i => BigInt(i.id))));
    const produtos = await prisma.produto.findMany({
      where: { produtoId: { in: ids }, deletedAt: null },
      select: { produtoId: true, preco: true, altura: true, largura: true, peso: true, nome: true },
    });
    const byId = new Map(produtos.map(p => [p.produtoId.toString(), p]));

    // Subtotal e volumes para ME
    let subtotalCents = 0;
    const volumes = items.map(({ id, quantity }) => {
      const p = byId.get(id);
      if (!p) throw new Error(`Produto ${id} não encontrado`);

      const grams = p.peso?.toNumber() ?? 100;
      const weightKg = Math.max(grams / 1000, 0.01);
      const width  = Math.max(p.largura?.toNumber() ?? 1, 1);
      const height = Math.max(p.altura?.toNumber()   ?? 0.4, 0.4);
      const length = width; // se não tiver comprimento, usa largura

      subtotalCents += Math.round(Number(p.preco) * 100) * quantity;

      return {
        height, width, length, weight: weightKg,
        insurance_value: Number(p.preco) * quantity,
        quantity,
      };
    });

    // Frete grátis? servidor decide
    if (!serviceId) {
      if (subtotalCents < THRESHOLD_FREE_CENTS) {
        return NextResponse.json({ error: "Carrinho não elegível a frete grátis" }, { status: 400 });
      }
      const payload = {
        uid,
        svc: null as number | null,
        name: "Frete Grátis",
        priceCents: 0,
        itemsDigest: itemsDigest(items),
        pc: postalCode.replace(/\D/g, ""),
        exp: Date.now() + 10 * 60 * 1000, // 10min
        v: 1,
      };
      return NextResponse.json({ shippingToken: sign(payload), name: payload.name, priceCents: payload.priceCents });
    }

    // Recalcula frete para o serviceId escolhido (fonte da verdade = servidor)
    const resp = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${ME_TOKEN}`,
        "User-Agent": "PavitoVelas (suporte@pavito.com)",
      },
      body: JSON.stringify({
        from: { postal_code: FROM_POST },
        to:   { postal_code: postalCode },
        products: volumes,
        options: { receipt: false, own_hand: false },
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("ME calculate error:", data);
      return NextResponse.json({ error: "Falha ao calcular frete" }, { status: 502 });
    }

    // encontra a opção selecionada
    const opt = Array.isArray(data) ? data.find((o: any) => Number(o.service?.id ?? o.id) === serviceId) : null;
    if (!opt) return NextResponse.json({ error: "Serviço de frete não encontrado" }, { status: 400 });

    const priceCents = Math.round(parseFloat(opt.price) * 100);
    const name = `${opt.company?.name ?? "Frete"} (${opt.name ?? opt.service?.name ?? serviceId})`;

    const payload = {
      uid,
      svc: serviceId,
      name,
      priceCents,
      itemsDigest: itemsDigest(items),
      pc: postalCode.replace(/\D/g, ""),
      exp: Date.now() + 10 * 60 * 1000, // 10min
      v: 1,
    };

    return NextResponse.json({ shippingToken: sign(payload), name, priceCents });
  } catch (err: any) {
    console.error("shipping/sign:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
