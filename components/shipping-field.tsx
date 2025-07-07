"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { formatCEP, validateCEP } from "@/utils/cep"
import type { ShippingOption } from "@/types/shipping"

interface ShippingFieldProps {
  onShippingSelect: (option: ShippingOption | null, postalCode: string) => void
  selectedShipping?: ShippingOption | null
  subtotal: number
}

export default function ShippingField({ onShippingSelect, selectedShipping, subtotal }: ShippingFieldProps) {
  const [cep, setCep] = useState("")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setCep(formatted)

    // Reset shipping when CEP changes
    if (selectedShipping) {
      onShippingSelect(null, "")
      setShippingOptions([])
      setIsOpen(false)
    }
  }

  const calculateShipping = async () => {
    if (!validateCEP(cep)) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 dígitos.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho para calcular o frete.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShippingOptions([])

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode: cep.replace(/\D/g, ""),
          items: items.map((item) => ({
            id: item.id,
            width: 10,
            height: 8,
            length: 10,
            weight: Number.parseFloat(item.weight.replace(/\D/g, "")) / 1000 || 0.25,
            insurance_value: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao calcular frete")
      }

      const validOptions = Array.isArray(data) ? data.filter((option: ShippingOption) => !option.error) : []
      setShippingOptions(validOptions)
      setIsOpen(true)

      if (validOptions.length === 0) {
        toast({
          title: "Nenhuma opção disponível",
          description: "Não encontramos opções de frete para este CEP.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao calcular frete:", error)
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular o frete. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShippingSelect = (option: ShippingOption) => {
    onShippingSelect(option, cep.replace(/\D/g, ""))
    setIsOpen(false)
    toast({
      title: "Frete selecionado",
      description: `${option.company.name} - R$ ${Number.parseFloat(option.custom_price || option.price)
        .toFixed(2)
        .replace(".", ",")}`,
    })
  }

  const formatDeliveryTime = (option: ShippingOption) => {
    const time = option.custom_delivery_time || option.delivery_time
    return `${time} dia${time > 1 ? "s" : ""} útil${time > 1 ? "eis" : ""}`
  }

  const formatPrice = (option: ShippingOption) => {
    const price = Number.parseFloat(option.custom_price || option.price)
    return price.toFixed(2).replace(".", ",")
  }

  // Frete grátis para compras acima de R$ 150
  const isFreeShipping = subtotal > 150

  if (isFreeShipping) {
    return (
      <div className="flex justify-between items-center text-[#631C21]/80">
        <span>Frete</span> 
        <span className="text-green-600 font-medium">Grátis</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Linha principal do frete */}
      <div className="flex justify-between items-center text-[#631C21]/80">
        <span>Frete</span>
        {selectedShipping ? (
          <div className="text-right">
            <div className="font-medium text-[#631C21]">R$ {formatPrice(selectedShipping)}</div>
            <div className="text-xs text-[#631C21]/70">
              {selectedShipping.company.name} - {formatDeliveryTime(selectedShipping)}
            </div>
          </div>
        ) : (
          <span className="text-[#631C21]/70">A calcular</span>
        )}
      </div>

      {/* Campo de CEP */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#631C21]/50" />
          <Input
            type="text"
            placeholder="Digite seu CEP"
            value={cep}
            onChange={handleCepChange}
            maxLength={9}
            className="pl-10 border-[#F4847B]/30 focus:border-[#882335] focus:ring-[#882335]/20 text-sm h-9"
          />
        </div>
        <Button
          onClick={calculateShipping}
          disabled={isLoading || !cep}
          size="sm"
          className="bg-[#882335] text-white hover:bg-[#631C21] h-9 px-3"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
        </Button>
      </div>

      {/* Opções de frete */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-2">
          {shippingOptions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shippingOptions.map((option) => (
                <Card
                  key={`${option.company_id}-${option.id}`}
                  className="p-3 cursor-pointer transition-all duration-200 hover:shadow-sm border-[#F4847B]/20 hover:border-[#F4847B]/40"
                  onClick={() => handleShippingSelect(option)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#631C21] text-sm truncate">{option.company.name}</span>
                          <Badge variant="outline" className="text-xs bg-[#F4847B]/10 border-[#F4847B]/30">
                            {formatDeliveryTime(option)}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#631C21]/70 truncate">{option.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="font-medium text-[#631C21] text-sm">R$ {formatPrice(option)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            shippingOptions.length === 0 &&
            isOpen && (
              <div className="text-center py-4 text-[#631C21]/70 text-sm">
                Nenhuma opção de frete disponível para este CEP.
              </div>
            )
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
