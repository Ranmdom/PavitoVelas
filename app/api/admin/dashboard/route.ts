// File: app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  startOfDay,
  endOfDay,
} from 'date-fns'

export async function GET() {
  const now = new Date()

  // 1) Intervalos de data para mês atual e anterior
  const startCurrentMonth = startOfMonth(now)
  const endCurrentMonth = endOfMonth(now)
  const startPrevMonth    = startOfMonth(subMonths(now, 1))
  const endPrevMonth      = endOfMonth(subMonths(now, 1))

  // 2) Vendas totais: soma do valorTotal (excluindo cancelados)
  const [sumCurrent, sumPrev] = await prisma.$transaction([
    prisma.pedido.aggregate({
      _sum: { valorTotal: true },
      where: {
        dataPedido: { gte: startCurrentMonth, lte: endCurrentMonth },
        statusPedido: { not: 'cancelado' },
      },
    }),
    prisma.pedido.aggregate({
      _sum: { valorTotal: true },
      where: {
        dataPedido: { gte: startPrevMonth, lte: endPrevMonth },
        statusPedido: { not: 'cancelado' },
      },
    }),
  ])
  const totalSales     = Number(sumCurrent._sum.valorTotal ?? 0)
  const prevSales      = Number(sumPrev._sum.valorTotal ?? 0)
  const totalSalesDiff = prevSales
    ? Math.round(((totalSales - prevSales) / prevSales) * 1000) / 10
    : 0

  // 3) Pedidos: contagem no mês atual vs anterior
  const [countCurrent, countPrev] = await prisma.$transaction([
    prisma.pedido.count({
      where: {
        dataPedido: { gte: startCurrentMonth, lte: endCurrentMonth },
        statusPedido: { not: 'cancelado' },
      },
    }),
    prisma.pedido.count({
      where: {
        dataPedido: { gte: startPrevMonth, lte: endPrevMonth },
        statusPedido: { not: 'cancelado' },
      },
    }),
  ])
  const totalOrders     = countCurrent
  const totalOrdersDiff = countPrev
    ? Math.round(((countCurrent - countPrev) / countPrev) * 1000) / 10
    : 0

  // 4) Produtos totais e novos produtos no mês
  const totalProducts         = await prisma.produto.count()
  const newProductsThisMonth  = await prisma.produto.count({
    where: { createdAt: { gte: startCurrentMonth, lte: endCurrentMonth } },
  })

  // 5) Clientes totais e crescimento de cadastros no mês
  const totalClients = await prisma.usuario.count({
    where: { deletedAt: null },
  })
  const [newClientsCurrent, newClientsPrev] = await prisma.$transaction([
    prisma.usuario.count({
      where: { createdAt: { gte: startCurrentMonth, lte: endCurrentMonth } },
    }),
    prisma.usuario.count({
      where: { createdAt: { gte: startPrevMonth, lte: endPrevMonth } },
    }),
  ])
  const totalClientsDiff = newClientsPrev
    ? Math.round(((newClientsCurrent - newClientsPrev) / newClientsPrev) * 1000) / 10
    : 0

  // 6) Vendas recentes (últimos 30 dias), agrupadas por dia
  const start30 = startOfDay(subDays(now, 29))
  const end30   = endOfDay(now)
  // usamos raw SQL para agrupar por data (Postgres)
  const salesRecentRaw: Array<{ date: string; total: number }> =
    await prisma.$queryRaw`
    SELECT to_char("dataPedido"::date, 'YYYY-MM-DD') AS date,
           SUM("valorTotal")::float AS total
    FROM "Pedido"
    WHERE "dataPedido" BETWEEN ${start30} AND ${end30}
      AND "statusPedido" != 'cancelado'
    GROUP BY date
    ORDER BY date
  `
  // garanta ter todos os 30 dias (mesmo os sem vendas)
  const dayMap = Object.fromEntries(
    salesRecentRaw.map((r) => [r.date, r.total])
  )
  const salesRecent = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start30)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    return { date: key, total: dayMap[key] ?? 0 }
  })

  // 7) Top 5 produtos mais vendidos (quantidade)
  const topItems = await prisma.itemPedido.groupBy({
    by: ['produtoId'],
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: 'desc' } },
    take: 5,
  })
  // buscar nomes e calcular porcentagens
  const totalSold = topItems.reduce((acc, x) => acc + (x._sum.quantidade ?? 0), 0)
  const topProducts = await Promise.all(
    topItems.map(async (x) => {
      const p = await prisma.produto.findUnique({
        where: { produtoId: x.produtoId },
        select: { nome: true },
      })
      const cnt = Number(x._sum.quantidade ?? 0)
      return {
        name: p?.nome ?? '—',
        count: cnt,
        percentage: totalSold
          ? Math.round((cnt / totalSold) * 100)
          : 0,
      }
    })
  )

  return NextResponse.json({
    totalSales,
    totalSalesDiff,    // em %
    totalOrders,
    totalOrdersDiff,   // em %
    totalProducts,
    newProductsThisMonth,
    totalClients,
    newClientsCurrent,
    totalClientsDiff,  // em %
    salesRecent,       // [{date, total}, …]
    topProducts,       // [{name, count, percentage}, …]
  })
}
