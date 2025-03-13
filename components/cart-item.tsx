"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type CartItem as CartItemType, useCart } from "@/context/cart-context"

interface CartItemProps {
  item: CartItemType
  compact?: boolean
}

export default function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const increaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-[#FBE1D0]/50">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain p-2" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/produto/${item.id}`}
            className="text-sm font-medium text-[#631C21] hover:text-[#F4847B] line-clamp-1"
          >
            {item.name}
          </Link>
          <div className="mt-1 flex items-center text-xs text-[#631C21]/70">
            <span>{item.quantity} × </span>
            <span className="ml-1 font-medium" style={{ color: item.color }}>
              R$ {item.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#631C21]/70 hover:text-[#631C21]"
          onClick={() => removeItem(item.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remover</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-[#FBE1D0]/50">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain p-2" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <Link href={`/produto/${item.id}`} className="text-base font-medium text-[#631C21] hover:text-[#F4847B]">
            {item.name}
          </Link>
          <span className="font-medium" style={{ color: item.color }}>
            R$ {item.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="mt-1 text-sm text-[#631C21]/70">{item.weight}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-[#631C21]/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none text-[#631C21]"
              onClick={decreaseQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex w-8 items-center justify-center">
              <span className="text-sm">{item.quantity}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none text-[#631C21]"
              onClick={increaseQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[#631C21]/70 hover:text-[#631C21]"
            onClick={() => removeItem(item.id)}
          >
            <X className="mr-1 h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>
    </div>
  )
}

