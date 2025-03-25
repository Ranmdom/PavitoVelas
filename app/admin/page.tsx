import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import RecentOrdersTable from "@/components/admin/recent-orders-table"
import SalesChart from "@/components/admin/sales-chart"
import TopProductsChart from "@/components/admin/top-products-chart"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">R$ 15.231,89</div>
            <p className="text-xs text-[#631C21]/70">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">+243</div>
            <p className="text-xs text-[#631C21]/70">+12.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Produtos</CardTitle>
            <Package className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">45</div>
            <p className="text-xs text-[#631C21]/70">+5 novos produtos este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#631C21]/70">Clientes</CardTitle>
            <Users className="h-4 w-4 text-[#882335]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#631C21]">+573</div>
            <p className="text-xs text-[#631C21]/70">+18.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

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
                <CardDescription className="text-[#631C21]/70">Vendas dos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>

            <Card className="col-span-3 bg-white/80">
              <CardHeader>
                <CardTitle className="text-[#631C21]">Produtos Mais Vendidos</CardTitle>
                <CardDescription className="text-[#631C21]/70">Top 5 produtos mais vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-[#631C21]">Análise de Vendas por Categoria</CardTitle>
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

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle className="text-[#631C21]">Pedidos Recentes</CardTitle>
          <CardDescription className="text-[#631C21]/70">Últimos pedidos realizados na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable />
        </CardContent>
      </Card>
    </div>
  )
}

