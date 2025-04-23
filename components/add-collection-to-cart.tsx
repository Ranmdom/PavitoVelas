"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

interface CollectionItem {
  id: string
  name: string
  price: number
  image: string
  weight: string
  color: string
  category: string
}

interface Collection {
  slug: string
  name: string
  description: string
  price: number
  image: string
  color: string
  category: string
  items: CollectionItem[]
}

interface AddCollectionToCartProps {
  collection: Collection
  isLarge?: boolean
}

export default function AddCollectionToCart({ collection, isLarge = false }: AddCollectionToCartProps) {
  const { addItem } = useCart()

  const handleAddCollectionToCart = () => {
    // Adicionar cada item da coleção ao carrinho
    collection.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        weight: item.weight,
        color: item.color,
      })
    })
  }

  return (
    <Button
      size={isLarge ? "lg" : "default"}
      className="bg-[#631C21] hover:bg-[#631C21]/90 text-white"
      onClick={handleAddCollectionToCart}
    >
      <ShoppingCart className="mr-2 h-5 w-5" /> Comprar Coleção
    </Button>
  )
}
