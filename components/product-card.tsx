"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category: string
  weight: string
  color: string
}

export default function ProductCard({ id, name, price, image, category, weight, color }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id,
      name,
      price,
      image,
      weight,
      color,
    })
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md backdrop-blur-md bg-white/40 border border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/produto/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#FBE1D0]/70">
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              background: `radial-gradient(circle, ${color}40 0%, ${color}10 70%)`,
            }}
          ></div>
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className={`object-contain p-4 transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          />
          <div
            className="absolute bottom-2 left-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-1 text-xs font-medium"
            style={{ color }}
          >
            {category}
          </div>
          <div
            className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-1 text-xs font-medium"
            style={{ color }}
          >
            {weight}
          </div>
        </div>
        <CardContent className="p-4 bg-white/60 backdrop-blur-sm">
          <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
          <p className="mt-2 text-xl font-bold" style={{ color }}>
            R$ {price.toFixed(2).replace(".", ",")}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 p-4 pt-0 bg-white/60 backdrop-blur-sm">
          <Button
            variant="outline"
            className="w-full border-[#631C21] text-[#631C21] hover:bg-[#631C21] hover:text-white"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
          <Button variant="ghost" className="flex-shrink-0 text-[#631C21] hover:bg-[#631C21]/10 hover:text-[#631C21]">
            Ver
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}

