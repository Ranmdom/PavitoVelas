import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Package, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerAccountInfo from "@/components/minha-conta/customer-account-info"
import CustomerAddresses from "@/components/minha-conta/customer-addresses"
import CustomerOrders from "@/components/minha-conta/customer-orders"

export const metadata: Metadata = {
  title: "Minha Conta | Pavito Velas",
  description: "Gerencie sua conta e pedidos na Pavito Velas",
}

export default function CustomerAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#631C21] md:text-3xl">Minha Conta</h1>
        <Button variant="ghost" size="sm" asChild className="text-[#631C21]">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a loja
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-[#FBE1D0]/50">
          <TabsTrigger value="info" className="data-[state=active]:bg-white">
            <User className="mr-2 h-4 w-4" />
            Informações da Conta
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Meus Pedidos
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-white">
            <Package className="mr-2 h-4 w-4" />
            Endereços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-[#631C21]">Informações da Conta</CardTitle>
              <CardDescription className="text-[#631C21]/70">
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerAccountInfo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-[#631C21]">Meus Pedidos</CardTitle>
              <CardDescription className="text-[#631C21]/70">
                Acompanhe o status dos seus pedidos e histórico de compras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerOrders />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="text-[#631C21]">Meus Endereços</CardTitle>
              <CardDescription className="text-[#631C21]/70">Gerencie seus endereços de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerAddresses/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

