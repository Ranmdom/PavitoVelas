import type { Metadata } from "next"
import OrdersPage from "@/components/admin/orders-page"

export const metadata: Metadata = {
  title: "Pedidos Recentes",
  description: "Visualização dos pedidos recentes na plataforma",
}

export default function Page() {
  return <OrdersPage />
}
