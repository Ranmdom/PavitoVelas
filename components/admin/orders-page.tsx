"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import RecentOrdersTable from "@/components/admin/recent-orders-table"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F8] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="bg-white/80 border-[#631C21]/10">
          <CardHeader>
            <CardTitle className="text-[#631C21]">Pedidos Recentes</CardTitle>
            <CardDescription className="text-[#631C21]/70">Últimos pedidos realizados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
