"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import CartItem from "@/components/cart-item"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import type { ShippingOption } from "@/types/shipping"
import AddressSelector from "./carrinho/adress-selector"
import ShippingDialog from "./carrinho/shipping-dialog"

export default function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [postalCode, setPostalCode] = useState("")

  // Formata preço e tempo de entrega
  const formatPrice = (opt: ShippingOption) =>
    Number.parseFloat(opt.custom_price || opt.price).toFixed(2).replace('.', ',')
  const formatDeliveryTime = (opt: ShippingOption) =>
    `${opt.custom_delivery_time || opt.delivery_time} dia${(opt.custom_delivery_time || opt.delivery_time) > 1 ? 's' : ''}`

  // Calcula custo total
  const shippingCost = selectedShipping
    ? Number.parseFloat(selectedShipping.custom_price || selectedShipping.price)
    : 0
  const total = subtotal + (subtotal > 150 ? 0 : shippingCost)

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
      const lineItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineItems,
          shipping: {
            name: selectedShipping?.company.name || "Gratuito Promocional",
            price: shippingCost || 0,
          },
          postalCode,
          userId: session?.user?.id || null,
        }),
      })

      if (!response.ok) throw new Error("Erro ao criar sessão de checkout")
      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      console.error("Erro no checkout:", err)
      toast({
        title: "Erro no checkout",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrinho")
    }
  }, [items, router])

  // Se carrinho vazio, nada a renderizar
  if (items.length === 0) return null

  const handleShippingSelect = (option: ShippingOption | null, cep: string) => {
    setSelectedShipping(option)
    setPostalCode(cep)
    if (option && cep) {
      localStorage.setItem("pavito-shipping", JSON.stringify(option))
      localStorage.setItem("pavito-postal-code", cep)
    } else {
      localStorage.removeItem("pavito-shipping")
      localStorage.removeItem("pavito-postal-code")
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Resumo + Endereços */}
      <div className="space-y-8 lg:col-span-8">
        <div className="rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#631C21]">Resumo do Pedido</h2>
          </div>
          <Separator className="bg-[#F4847B]/10" />
          <div className="divide-y divide-[#F4847B]/10 px-6">
            {items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-[#631C21]">Endereços</h2>
          </div>
          <Separator className="bg-[#F4847B]/10" />
          <AddressSelector onSelect={addr => handleShippingSelect(null, addr.cep)} />
        </div>
      </div>

      {/* Pagamento */}
      <div className="h-fit rounded-lg border border-[#F4847B]/10 bg-white/60 backdrop-blur-sm p-6 lg:col-span-4">
        <h2 className="mb-4 text-lg font-medium text-[#631C21]">Pagamento</h2>
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-[#631C21]/80">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>

          {/* Frete */}
          {!postalCode ? (
            <div className="text-right">
              <div className="font-medium text-[#631C21]">
                Escolha ou cadastre um endereço
              </div>
            </div>

          ) : subtotal > 150 ? (
            <div className="text-right">
              <div className="font-medium text-green-600">R$ 0,00</div>
              <div className="text-xs text-[#631C21]/70">Frete grátis</div>
            </div>

          ) : selectedShipping ? (
            <div className="text-right">
              <div className="font-medium text-[#631C21]">
                R$ {formatPrice(selectedShipping)}
              </div>
              <div className="text-xs text-[#631C21]/70">
                {selectedShipping.company.name} – {formatDeliveryTime(selectedShipping)}
              </div>
            </div>

          ) : (
            <span className="text-[#631C21]/70">A calcular</span>
          )}

          <Separator className="my-4 bg-[#F4847B]/10" />

          {/* Total */}
          <div className="flex justify-between font-medium text-[#631C21]">
            <span>Total</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          {/* Botão Pago */}
          <div className="pt-4">
            <Button
              className="w-full bg-[#882335] text-white hover:bg-[#631C21]"
              onClick={handleCheckout}
              disabled={isLoading || (!selectedShipping && subtotal <= 150)}
            >
              {isLoading ? (
                <>              
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...
                </>
              ) : (
                "Pagar com Stripe"
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-[#631C21]/70">
              Pagamento seguro processado pelo Stripe
            </p>
            <p className="mt-2 text-center text-xs text-[#631C21]/70">
              Frete grátis para compras acima de R$ 150,00
            </p>
          </div>
        </div>
      </div>

      {/* Modal de frete */}
      <ShippingDialog
        addressPostalCode={postalCode}
        selectedShipping={selectedShipping}
        subtotal={subtotal}
        onShippingSelect={handleShippingSelect}
      />
    </div>
  )
}
