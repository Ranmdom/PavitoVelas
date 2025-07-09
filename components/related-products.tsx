"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"

interface RelatedProductsProps {
  currentProductId: string
}

interface RelatedProduct {
  id: string
  nome: string
  preco: number
  imagens: string[]
  categoriaNome: string
  peso?: number
  categoria?: string
}

const colorMap: Record<string, string> = {
  Frutal:   "#F4847B",
  Floral:   "#CD4E65",
  Amadeirado:"#882335",
  Especiarias:"#D36A6A",
}


export default function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentProductId) return

    async function fetchRelated() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/produtos/relacionados?id=${encodeURIComponent(currentProductId)}`
        )
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const json = await res.json()
        setRelatedProducts(json.data)
      } catch (err: any) {
        console.error("Erro ao buscar produtos relacionados:", err)
        setError("Não foi possível carregar produtos relacionados.")
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [currentProductId])

  if (loading) {
    return <p>Carregando produtos relacionados...</p>
  }
  if (error || relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {relatedProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.nome}
          price={product.preco}
          image={product.imagens[0]}
          category={product.categoriaNome}
          weight={product.peso ? `${product.peso}g` : ""}
          color={colorMap[product.categoria ?? "Frutal"] ?? "#F4847B"}  

        />
      ))}
    </div>
  )
}
