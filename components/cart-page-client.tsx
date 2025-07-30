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
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
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
      toast({ title: "Carrinho vazio", description: "Adicione produtos antes.", variant: "destructive" })
      return
    }
    if (!selectedShipping && subtotal <= 150) {
      toast({ title: "Selecione frete", description: "Escolha uma opção de frete.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      // 1) Cria o pedido e session Stripe
      const res1 = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            id:       i.id,
            name:     i.name,
            price:    i.price,
            quantity: i.quantity,
            image:    i.image
          })),
          shipping: {
            name:  selectedShipping?.company.name || "Frete Grátis",
            price: selectedShipping
                      ? parseFloat(selectedShipping.custom_price || selectedShipping.price)
                      : 0
          },
          postalCode,
          userId:  session?.user?.id || null,
          address: selectedAddress
        })
      })
      const { url, pedidoId } = await res1.json();
      if (!pedidoId) throw new Error("pedidoId não retornado");
      if (!res1.ok) throw new Error("Erro ao criar pedido")

      // 2) Insere o frete / declara produtos no MelhorEnvio
      const res2 = await fetch("/api/melhorEnvio/InserirFretes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPostal:   postalCode.replace(/\D/g, ""),
          items:      items.map(i => ({ id: i.id, quantity: i.quantity })),
          serviceId:  selectedShipping!.id,
          options:    {
            receipt:        selectedShipping!.additional_services.receipt,
            own_hand:       selectedShipping!.additional_services.own_hand,
            reverse:        selectedShipping!.additional_services.collect,
            non_commercial: true
          },
          pedidoId    // usa o pedidoId que acabou de receber do /api/checkout
        })
      })
      const data2 = await res2.json()
      if (!res2.ok) throw new Error(data2.error || "Erro ao registrar frete")

      // 3) Redireciona pro Stripe
      window.location.href = url

    } catch (err) {
      console.error("Erro no checkout:", err)
      toast({
        title:       "Falha no checkout",
        description: (err as Error).message,
        variant:     "destructive"
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

  const handleShippingSelect = (option: any) => {
    setSelectedShipping(option)
  }

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address)
    setPostalCode(address.cep)
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
          <AddressSelector onSelectAdress={handleAddressSelect} initialSelectedId={selectedAddress?.enderecoId ?? null} />
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
        onDialogClose={() => {
          setSelectedAddress(null)
          setPostalCode('')
          setSelectedShipping(null)
        }}
      />
    </div>
  )
}
