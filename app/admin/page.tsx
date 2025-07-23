// app/admin/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import SalesChart from "@/components/admin/sales-chart"
import TopProductsChart from "@/components/admin/top-products-chart"
import { Loader2 } from "lucide-react"

interface DashboardData {
  totalSales: number
  totalSalesDiff: number
  totalOrders: number
  totalOrdersDiff: number
  totalProducts: number
  newProductsThisMonth: number
  totalClients: number
  newClientsCurrent: number
  totalClientsDiff: number
  salesRecent: { date: string; total: number }[]
  topProducts: { name: string; count: number; percentage: number }[]
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: DashboardData) => setDashboard(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-[#882335]" />
      </div>
    )
  }
  if (error || !dashboard) {
    return (
      <div className="text-center py-12 text-red-600">
        Erro ao carregar dashboard: {error}
      </div>
    )
  }

  const {
    totalSales,
    totalSalesDiff,
    totalOrders,
    totalOrdersDiff,
    totalProducts,
    newProductsThisMonth,
    newClientsCurrent,
    totalClientsDiff,
    salesRecent,
    topProducts,
  } = dashboard

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const formatPercent = (v: number) =>
    `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Dashboard</h1>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-[#631C21]/70">
              {formatPercent(totalSalesDiff)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">
              {totalOrders}
            </div>
            <p className="text-xs text-[#631C21]/70">
              {formatPercent(totalOrdersDiff)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Produtos</CardTitle>
            <Package className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">
              {totalProducts}
            </div>
            <p className="text-xs text-[#631C21]/70">
              +{newProductsThisMonth} novos produtos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Clientes</CardTitle>
            <Users className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">
              +{newClientsCurrent}
            </div>
            <p className="text-xs text-[#631C21]/70">
              {formatPercent(totalClientsDiff)} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#FBE1D0]/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-white/80">
              <CardHeader>
                <CardTitle className="text-[#631C21]">Vendas Recentes</CardTitle>
                <CardDescription className="text-[#631C21]/70">
                  Vendas dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart data={salesRecent} />
              </CardContent>
            </Card>

            <Card className="col-span-3 bg-white/80">
              <CardHeader>
                <CardTitle className="text-[#631C21]">Produtos Mais Vendidos</CardTitle>
                <CardDescription className="text-[#631C21]/70">
                  Top 5 produtos mais vendidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsChart data={topProducts} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-[#631C21]">
                Análise de Vendas por Categoria
              </CardTitle>
              <CardDescription className="text-[#631C21]/70">
                Distribuição de vendas por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-[#631C21]/70">
                Gráfico de análise detalhada (em desenvolvimento)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
