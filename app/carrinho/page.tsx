import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import CartPageClient from "@/components/cart-page-client"

export const metadata = {
  title: "Carrinho de Compras | Pavito Velas",
  description: "Revise os itens em seu carrinho e prossiga para o checkout.",
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#631C21] md:text-3xl">Carrinho de Compras</h1>
        <Button variant="ghost" size="sm" asChild className="text-[#631C21]">
          <Link href="/produtos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuar comprando
          </Link>
        </Button>
      </div>

      <Separator className="mb-6 bg-[#F4847B]/10" />

      <CartPageClient />
    </div>
  )
}

