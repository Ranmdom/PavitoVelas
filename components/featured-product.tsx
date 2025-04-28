"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"

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
  const { addItem } = useCart()
  const router = useRouter()

  useEffect(() => {
    async function loadLimited() {
      const res = await fetch("/api/produtos?categoria=Limitada")
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
      setLoading(false)
    }
    loadLimited()
  }, [])

  if (loading) return <div>Carregando…</div>
  if (!product) return <div>Nenhuma vela limitada.</div>

  const imageUrl = product.image?.[0] ?? "/placeholder.svg"

  const increase = () => setQuantity((q) => q + 1)
  const decrease = () => setQuantity((q) => Math.max(1, q - 1))

  const handleAddToCart = () => {
    const item = {
      id:     product.produtoId,
      name:   product.nome,
      price:  product.preco,
      image:  imageUrl,
      weight: `${product.peso}g`,
      color:  "#882335",
    }
    addItem(item, quantity)
  }

  return (
    <div className="relative grid md:grid-cols-2 gap-8 p-8 border rounded-lg">
      <div className="relative aspect-square bg-gradient-to-br from-[#FBE1D0] to-[#F4847B]/20">
        <Image src={imageUrl} alt={product.nome} fill className="object-contain p-6" />
      </div>
      <div className="flex flex-col">
        <span className="mb-2 inline-block rounded-full bg-[#F4847B]/10 px-3 py-1 text-sm font-medium text-[#F4847B]">
          Edição Limitada
        </span>
        <h2 className="text-3xl font-bold text-[#631C21]">{product.nome}</h2>
        <p className="my-2 text-sm text-[#631C21]/70">
          Peso: {product.peso}g &bull; Tempo de queima: ~{product.tempoQueima}h
        </p>
        <div className="my-4 text-3xl font-bold text-[#882335]">
          {new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(product.preco)}
        </div>
        <p className="mb-6 text-[#631C21]/80">{product.descricao}</p>
        <div className="flex items-center gap-4 mb-6">
          <Card className="flex items-center justify-between w-32 border">
            <Button variant="ghost" size="icon" onClick={decrease}><Minus className="h-4 w-4"/></Button>
            <CardContent className="p-0"><span className="text-lg">{quantity}</span></CardContent>
            <Button variant="ghost" size="icon" onClick={increase}><Plus className="h-4 w-4"/></Button>
          </Card>
          <Button className="flex-1 bg-[#882335] text-white" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4"/> Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  )
}
