// lib/melhorEnvioEnv.ts
const BASE_RAW  = process.env.BASEURL_MELHOR_ENVIO_SANDBOX || process.env.BASEURL_MELHOR_ENVIO || "";
const TOKEN_RAW = process.env.MELHOR_ENVIO_TOKEN_SANDBOX   || process.env.MELHOR_ENVIO_TOKEN   || "";

export const ME_BASE  = BASE_RAW.trim();
export const ME_TOKEN = TOKEN_RAW.replace(/\r|\n|^"+|"+$|^'+|'+$/g, "").trim();

export const ME_DEBUG = {
  baseHost: (() => { try { return new URL(ME_BASE).host; } catch { return ME_BASE; } })(),
  token_fp: ME_TOKEN ? `${ME_TOKEN.slice(0,6)}…${ME_TOKEN.slice(-6)}` : "(vazio)",
  token_len: ME_TOKEN.length,
};

export const hAuth = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${ME_TOKEN}`,
  "User-Agent": "PavitoVelas (suporte@pavito.com)",
} as const);

export const hJson = () => ({
  ...hAuth(),
  "Content-Type": "application/json",
} as const);
