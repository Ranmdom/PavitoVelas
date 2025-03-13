"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/context/cart-context"
import CartItem from "@/components/cart-item"

export default function CartDropdown() {
  const { items, itemCount, subtotal, clearCart } = useCart()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[#631C21]">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F4847B] text-xs font-medium text-white">
              {itemCount}
            </span>
          )}
          <span className="sr-only">Carrinho</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-medium text-[#631C21]">Meu Carrinho</h3>
          {itemCount === 0 ? (
            <p className="mt-2 text-sm text-[#631C21]/70">Seu carrinho está vazio.</p>
          ) : (
            <p className="mt-1 text-sm text-[#631C21]/70">
              {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
            </p>
          )}
        </div>

        <DropdownMenuSeparator />

        {items.length > 0 ? (
          <>
            <div className="max-h-[300px] overflow-y-auto px-4">
              <DropdownMenuGroup>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} compact />
                ))}
              </DropdownMenuGroup>
            </div>

            <DropdownMenuSeparator />

            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-medium text-[#631C21]">Subtotal</span>
                <span className="font-medium text-[#631C21]">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-[#882335] text-white hover:bg-[#631C21]">
                  <Link href="/checkout">Finalizar Compra</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-[#631C21]/20 text-[#631C21]">
                  <Link href="/carrinho">Ver Carrinho</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-[#631C21]/70 hover:text-[#631C21]"
                  onClick={clearCart}
                >
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </>
        ) : (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/produtos" className="flex h-10 w-full items-center justify-center">
              Explorar produtos
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

