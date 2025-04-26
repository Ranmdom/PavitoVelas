import type { Metadata } from "next"
import CustomersTable from "@/components/admin/customers-table"

export const metadata: Metadata = {
  title: "Clientes",
  description: "Visualização dosclientes na plataforma",
}

export default function Page() {
  return <CustomersTable />
}
