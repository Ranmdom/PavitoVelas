// Arquivo: lib/auth.ts
import jwt from "jsonwebtoken"

// Chave secreta para assinar tokens JWT (em produção, use variáveis de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || "pavito-velas-secret-key-2023"

// Tempo de expiração do token (24 horas)
const EXPIRES_IN = "24h"

// Interface para o payload do token
interface TokenPayload {
  userId: number
  tipo?: string
  [key: string]: any
}

// Função para assinar um novo token JWT
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

// Função para verificar e decodificar um token JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

// Função para extrair o token do cabeçalho de autorização
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.substring(7) // Remove 'Bearer ' do início
}

