"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProductsTable from "@/components/admin/products-table"
import ProductForm from "@/components/admin/product-form" // <-- importa aqui

export const metadata = {
  title: "Gerenciar Produtos | Pavito Velas",
  description: "Gerencie os produtos da loja Pavito Velas",
}

export default function ProductsPage() {
  const [openForm, setOpenForm] = useState(false) // <-- controla o Dialog

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Produtos</h1>
        <Button
          className="bg-[#882335] text-white hover:bg-[#631C21]"
          onClick={() => setOpenForm(true)} // <-- abre o modal
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <ProductsTable />

      <ProductForm open={openForm} onOpenChange={setOpenForm} /> {/* <-- chama o form */}
    </div>
  )
}
