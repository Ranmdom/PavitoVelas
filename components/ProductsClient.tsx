"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import ProductsTable from "@/components/admin/products-table"
import ProductForm from "@/components/admin/product-form"

type Product = {
  produtoId: string
  nome: string
  categoria: string           // <- já é string, certo!
  preco: number
  estoque?: number
  fragancia: string
  peso: number | undefined
  createdAt: string
  image: string
}

export default function ProductsClient() {
  const [openForm, setOpenForm] = useState(false)
  const [produtos, setProdutos] = useState<Product[]>([])
  const [produtoEditando, setProdutoEditando] = useState<string | undefined>(undefined)

  const abrirEdicaoProduto = (produtoId: string) => {
    setProdutoEditando(produtoId)
    setOpenForm(true)
  }

  const buscarProdutos = async () => {
    try {
      const res = await fetch("/api/produtos")
      const dados = await res.json()
      setProdutos(
        dados.map((produto: any) => ({
          ...produto,
          produtoId: produto.id,
          nome: produto.nome,
          categoria: produto.categoriaNome,
          preco: produto.preco,
          estoque: produto.estoque,
          fragrancia: produto.fragrancia,
          peso: produto.peso,
          createdAt: produto.createdAt,
          image: produto.image,
        }))
      )
      
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

      <ProductsTable data={produtos} onEditar={abrirEdicaoProduto}/>

      <ProductForm
        open={openForm}
        onOpenChange={setOpenForm}
        onProdutoCriado={buscarProdutos}
        produtoId={produtoEditando}
      />
    </div>
  )
}
