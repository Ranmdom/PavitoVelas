// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

console.log('🔎 DATABASE_URL usada no Prisma:', process.env.DATABASE_URL)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

