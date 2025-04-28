"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Featured = {
  produtoId: string
  nome: string
  categoria: string
  preco: number
  fragrancia: string
  peso: number
  tempoQueima: number
  descricao: string
  image: string[]
}

export default function FeaturedProduct() {
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Featured | null>(null)
  const [loading, setLoading] = useState(true)

  // controle do "mostrar mais"
  const [showFullDesc, setShowFullDesc] = useState(false)
  const MAX_DESC_LENGTH = 600

  useEffect(() => {
    async function loadLimited() {
      try {
        const res = await fetch("/api/produtos?categoria=Limitada")
        if (!res.ok) throw new Error("Falha ao buscar vela limitada")

        const list = (await res.json()) as any[]
        if (list.length) {
          const raw = list[0]
          setProduct({
            produtoId: raw.id,
            nome: raw.nome,
            categoria: raw.categoria,
            preco: raw.preco,
            fragrancia: raw.fragrancia,
            peso: raw.peso,
            tempoQueima: raw.tempoQueima,
            descricao: raw.descricao,
            image: raw.image,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadLimited()
  }, [])

  if (loading) {
    return <div>Carregando vela limitada…</div>
  }
  if (!product) {
    return <div>Nenhuma vela limitada encontrada.</div>
  }

  const imageUrl =
    Array.isArray(product.image) && product.image.length > 0
      ? product.image[0]
      : "/placeholder.svg"

  const increaseQuantity = () => setQuantity((q) => q + 1)
  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  // prepara texto da descrição (corta ou full)
  const desc = product.descricao ?? ""    // ← fallback para string vazia
  const isLong = desc.length > MAX_DESC_LENGTH
  const displayedDesc = !isLong || showFullDesc
    ? desc
    : desc.slice(0, MAX_DESC_LENGTH) + "..."


  return (
    <div className="relative">
      {/* bolinhas de fundo omitidas para brevidade */}

      <div className="relative grid gap-8 rounded-xl border border-[#F4847B]/20 bg-white p-6 shadow-lg md:grid-cols-2 md:p-8">
        <div className="relative aspect-square rounded-lg bg-gradient-to-br from-[#FBE1D0] to-[#F4847B]/20">
          <Image
            src={imageUrl}
            alt={product.nome}
            fill
            className="object-contain p-6"
          />
        </div>

        <div className="flex flex-col">
          <span className="mb-2 inline-block w-fit rounded-full bg-[#F4847B]/10 px-3 py-1 text-sm font-medium text-[#F4847B]">
            Edição Limitada
          </span>

          <h2 className="mb-3 text-3xl font-bold text-[#631C21]">
            {product.nome}
          </h2>

          {/* Exibe peso e tempo de queima */}
          <p className="text-sm text-[#631C21]/70">
            Peso: {product.peso}g &bull; Tempo de queima: ~{product.tempoQueima}h
          </p>

          {/* Preço */}
          <div className="my-6 text-3xl font-bold text-[#882335]">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.preco)}
          </div>

          {/* Descrição com "mostrar mais" */}
          <p className="mb-4 text-[#631C21]/80">
            {displayedDesc}
            {isLong && (
              <button
                onClick={() => setShowFullDesc((v) => !v)}
                className="ml-1 text-sm font-medium text-[#882335] underline"
              >
                {showFullDesc ? "Leia Menos" : "Leia Mais"}
              </button>
            )}
          </p>

          {/* Características extras */}
          <div className="mb-4 grid gap-4">
            {/* ... */}
          </div>

          {/* Quantidade e carrinho */}
          <div className="mt-auto flex flex-col gap-4 sm:flex-row">
            <Card className="flex w-32 items-center justify-between border-[#631C21]/20">
              <Button variant="ghost" size="icon" onClick={decreaseQuantity}>
                <Minus className="h-4 w-4" />
              </Button>
              <CardContent className="flex h-full items-center p-0">
                <span className="text-lg font-medium">{quantity}</span>
              </CardContent>
              <Button variant="ghost" size="icon" onClick={increaseQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </Card>
            <Button className="flex-1 bg-[#882335] text-white hover:bg-[#631C21]">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
