export async function getOrder(orderId: string) {
  const res = await fetch(`${process.env.BASEURL_MELHOR_ENVIO}/me/orders/${orderId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN_SANDBOX!}`,
      "User-Agent": "PavitoVelas (suporte@pavito.com)",
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("ME getOrder erro:", res.status, text);
    throw new Error("ME order fetch error");
  }
  const json = JSON.parse(text);
  console.log("RAW /me/orders/:id:", json); // log de depuração
  return json;
}



export async function verifyMESignature(raw: ArrayBuffer, headerSig?: string | null) {
  const crypto = await import("crypto");
  const h = crypto.createHmac("sha256", process.env.ME_APP_SECRET!).update(Buffer.from(raw)).digest("base64");
  const a = Buffer.from(h);
  const b = Buffer.from(headerSig || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// /lib/melhorEnvio.ts
export async function fetchTrackingForOrders(orderIds: string[] | string) {
  const orders = Array.isArray(orderIds) ? orderIds : [orderIds];

  const res = await fetch(`${process.env.BASEURL_MELHOR_ENVIO}/me/shipment/tracking`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN_SANDBOX!}`,
      "User-Agent": "PavitoVelas (suporte@pavito.com)",
    },
    body: JSON.stringify({ orders }),
    cache: "no-store",
  });

  const text = await res.text();
  console.log("RAW /shipment/tracking:", res.status, text);
  if (!res.ok) throw new Error(`tracking fetch error (${res.status})`);

  let json: any; try { json = JSON.parse(text); } catch { json = text; }

  // ✅ normalização robusta (array OU objeto-mapa por id)
  let arr: any[] = [];
  if (Array.isArray(json)) {
    arr = json;
  } else if (json && typeof json === "object") {
    const candidate = json.data ?? json.orders ?? json;
    if (Array.isArray(candidate)) {
      arr = candidate;
    } else if (candidate && typeof candidate === "object") {
      arr = Object.values(candidate); // <-- trata o shape do seu log
    }
  }
  return arr;
}

// mantenha seu extractTracking como está
export function extractTracking(obj: any) {
  if (!obj || typeof obj !== "object") return { code: undefined, url: undefined, carrier: undefined };
  const code =
    obj.tracking_code ??
    obj.tracking ??
    obj?.tracking?.code ??
    obj?.events?.tracking_code ??
    undefined;
  const url =
    obj.tracking_url ??
    obj?.tracking?.url ??
    obj?.url_tracking ??
    undefined;
  const carrier =
    obj?.service?.company?.name ??
    obj?.company?.name ??
    obj?.carrier?.name ??
    undefined;
  return { code, url, carrier };
}


