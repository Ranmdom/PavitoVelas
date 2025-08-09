export async function getOrder(orderId: string) {
  const res = await fetch(`https://melhorenvio.com.br/api/v2/me/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${process.env.ME_TOKEN!}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("ME order fetch error");
  return res.json();
}

export async function verifyMESignature(raw: ArrayBuffer, headerSig?: string | null) {
  const crypto = await import("crypto");
  const h = crypto.createHmac("sha256", process.env.ME_APP_SECRET!).update(Buffer.from(raw)).digest("base64");
  const a = Buffer.from(h);
  const b = Buffer.from(headerSig || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
