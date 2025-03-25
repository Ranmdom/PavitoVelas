// app/(admin)/produtos/page.tsx
import ProductsClient from "@/components/ProductsClient"

export const metadata = {
  title: "Gerenciar Produtos | Pavito Velas",
  description: "Gerencie os produtos da loja Pavito Velas",
}

export default function ProductsPage() {
  return <ProductsClient />
}
