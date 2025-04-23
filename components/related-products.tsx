"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export default function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    // Simulação de busca de produtos relacionados
    // Em um ambiente real, isso seria uma chamada de API
    const products = [
      {
        id: "1",
        name: "Vela Pêssego & Baunilha",
        price: 49.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Frutal",
        weight: "250g",
        color: "#F4847B",
      },
      {
        id: "2",
        name: "Vela Lavanda & Bergamota",
        price: 54.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Floral",
        weight: "250g",
        color: "#CD4E65",
      },
      {
        id: "3",
        name: "Vela Madeira & Âmbar",
        price: 59.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Amadeirado",
        weight: "300g",
        color: "#882335",
      },
      {
        id: "4",
        name: "Vela Vanilla & Canela",
        price: 49.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Especiarias",
        weight: "250g",
        color: "#D36A6A",
      },
      {
        id: "5",
        name: "Vela Limão & Manjericão",
        price: 45.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Cítrico",
        weight: "200g",
        color: "#F4847B",
      },
      {
        id: "6",
        name: "Vela Rosa & Jasmim",
        price: 59.9,
        image: "/templates/vela-1.jpeg?height=300&width=300",
        category: "Floral",
        weight: "250g",
        color: "#CD4E65",
      },
    ]

    // Filtra produtos da mesma categoria, excluindo o produto atual
    const filtered = products
      .filter((product) => product.id !== currentProductId && product.category === category)
      .slice(0, 4)

    // Se não houver produtos suficientes da mesma categoria, adiciona outros produtos
    if (filtered.length < 4) {
      const otherProducts = products
        .filter((product) => product.id !== currentProductId && product.category !== category)
        .slice(0, 4 - filtered.length)

      setRelatedProducts([...filtered, ...otherProducts])
    } else {
      setRelatedProducts(filtered)
    }
  }, [currentProductId, category])

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {relatedProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          category={product.category}
          weight={product.weight}
          color={product.color}
        />
      ))}
    </div>
  )
}

