"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import CartItem from "@/components/cart-item"

export default function CartPageClient() {
  const { items, itemCount, subtotal } = useCart()
  const [mounted, setMounted] = useState(false)

  // Evitar erro de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (itemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 rounded-full bg-[#FBE1D0] p-4">
          <ShoppingBag className="h-12 w-12 text-[#631C21]" />
        </div>
        <h2 className="mb-2 text-xl font-medium text-[#631C21]">Seu carrinho está vazio</h2>
        <p className="mb-6 max-w-md text-[#631C21]/70">
          Parece que você ainda não adicionou nenhum produto ao seu carrinho.
        </p>
        <Button asChild className="bg-[#882335] text-white hover:bg-[#631C21]">
          <Link href="/produtos">Explorar produtos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#631C21]">Itens do Carrinho ({itemCount})</h2>
          </div>
          <Separator className="bg-[#F4847B]/10" />
          <div className="divide-y divide-[#F4847B]/10 px-6">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="h-fit rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm p-6">
        <h2 className="mb-4 text-lg font-medium text-[#631C21]">Resumo do Pedido</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-[#631C21]/80">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-[#631C21]/80">
            <span>Frete</span>
            <span>{subtotal > 150 ? "Grátis" : "Calculado no checkout"}</span>
          </div>

          <Separator className="my-4 bg-[#F4847B]/10" />

          <div className="flex justify-between font-medium text-[#631C21]">
            <span>Total</span>
            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-[#882335] text-white hover:bg-[#631C21]" asChild>
              <Link href="/checkout">Finalizar Compra</Link>
            </Button>
            <p className="mt-4 text-center text-xs text-[#631C21]/70">Frete grátis para compras acima de R$ 150,00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

