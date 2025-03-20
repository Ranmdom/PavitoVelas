// lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'teste'

export function signToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Exemplo de função para extrair token do cabeçalho "Authorization: Bearer <token>"
 */
export function getTokenFromHeader(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const [bearer, token] = authHeader.split(' ')
  if (bearer !== 'Bearer' || !token) return null

  return token
}
