"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import CartItem from "@/components/cart-item"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Preparar os itens para o Stripe
      const lineItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      // Chamar a API para criar a sessão do Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: lineItems,
          userId: session?.user?.id || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar sessão de checkout")
      }

      const { url } = await response.json()

      // Redirecionar para a página de checkout do Stripe
      window.location.href = url
    } catch (error) {
      console.error("Erro ao processar checkout:", error)
      toast({
        title: "Erro no checkout",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/carrinho")
    return null
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#631C21]">Resumo do Pedido</h2>
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
        <h2 className="mb-4 text-lg font-medium text-[#631C21]">Pagamento</h2>

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
            <Button
              className="w-full bg-[#882335] text-white hover:bg-[#631C21]"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Pagar com Stripe"
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-[#631C21]/70">Pagamento seguro processado pelo Stripe</p>
            <p className="mt-2 text-center text-xs text-[#631C21]/70">Frete grátis para compras acima de R$ 150,00</p>
          </div>
        </div>
      </div>
    </div>
  )
}
