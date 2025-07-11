"use client"

import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import CandleLoading from "./loading/candle-loading"

type ProdutoAPI = {
  id: string
  nome: string
  preco: number
  categoriaNome: string
  fragrancia: string
  peso: number | null
  image: string[]
}

export default function ProductGrid({
  products,
  loading,
}: {
  products: ProdutoAPI[]
  loading: boolean
}) {
  if (loading) return <CandleLoading/>
  if (!products.length && !loading) return <p>Nenhum produto encontrado.</p>

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.nome}
            price={p.preco}
            image={p.image[0] || "/placeholder.svg"}
            category={p.categoriaNome}
            weight={p.peso ? `${p.peso}g` : "N/A"}
            color="#F4847B"
          />
        ))}
      </div>
      {/* Se quiser paginação, pode incluir aqui */}
    </>
  )
}
