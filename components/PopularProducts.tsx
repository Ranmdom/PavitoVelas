"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import CandleLoading from "./loading/candle-loading"


type Popular = {
  id: string
  nome: string
  preco: number
  categoria: string
  peso: string
  image: string
}

export default function PopularProducts() {
  const [list, setList] = useState<Popular[]>([])
  const [loading, setLoading] = useState(true)

  // mapeamento de cores por categoria
  const colorMap: Record<string, string> = {
    Frutal:   "#F4847B",
    Floral:   "#CD4E65",
    Amadeirado:"#882335",
    Especiarias:"#D36A6A",
  }

  useEffect(() => {
    fetch("/api/produtos/populares")
      .then((res) => res.json())
      .then((data: Popular[]) => setList(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="w-full bg-[#ffe4e1] py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter text-[#631C21] sm:text-4xl">
              Nossos produtos mais vendidos
            </h2>
            <p className="mt-2 text-[#882335]/80">
              Descubra as velas que estão encantando nossos clientes
            </p>
          </div>
          <Link
            href="/produtos"
            className={buttonVariants({ variant: "link", className: "text-[#882335]" })}
          >
            Ver todos os produtos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="mt-8 flex items-center justify-center">
            <CandleLoading/>
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg text-[#631C21]">Nenhum produto popular encontrado.</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p,i) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.nome}
              price={p.preco}
              image={p.image}
              category={p.categoria}
              weight={p.peso}
              color={colorMap[p.categoria] ?? "#F4847B"}  
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
