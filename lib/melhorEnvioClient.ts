import { NextApiRequest, NextApiResponse } from 'next'

interface TokenStore {
  access_token: string
  refresh_token: string
  expiresAt: number
}

let tokens: TokenStore | null = null

async function renewToken(code: string): Promise<TokenStore> {
  const res = await fetch('https://sandbox.melhorenvio.com.br/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ME_CLIENT_ID,
      client_secret: process.env.ME_CLIENT_SECRET,
      redirect_uri: process.env.ME_REDIRECT_URI,
      code
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Falha ao renovar token')
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  }
}

export async function getAccessToken(code?: string): Promise<string> {
  if (tokens && tokens.expiresAt > Date.now()) {
    return tokens.access_token
  }
  if (!tokens && !code) {
    throw new Error('Código OAuth não fornecido para gerar token')
  }
  tokens = await renewToken(code!)
  return tokens.access_token
}

export async function meFetch(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string,string> } = {}
): Promise<Response> {
  const token = await getAccessToken()
  const url = `${process.env.ME_API_BASE}${path}`
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'MinhaLoja (seu-email@contato.com)',
      ...(options.headers || {})
    }
  })
}
