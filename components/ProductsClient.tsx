"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import ProductsTable from "@/components/admin/products-table"
import ProductForm from "@/components/admin/product-form"

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  fragrance: string
  weight: string
  createdAt: string
  image: string
}

export default function ProductsClient() {
  const [openForm, setOpenForm] = useState(false)
  const [produtos, setProdutos] = useState<Product[]>([])

  const buscarProdutos = async () => {
    try {
      const res = await fetch("/api/produtos")
      const dados = await res.json()
      setProdutos(dados)
    } catch (err) {
      console.error("Erro ao buscar produtos:", err)
    }
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Produtos</h1>
        <Button
          className="bg-[#882335] text-white hover:bg-[#631C21]"
          onClick={() => setOpenForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <ProductsTable data={produtos} />

      <ProductForm
        open={openForm}
        onOpenChange={setOpenForm}
        onProdutoCriado={buscarProdutos} // Atualiza a tabela após novo cadastro
      />
    </div>
  )
}
