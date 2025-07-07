"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, Loader2, MapPin, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import ShippingOptions from "./shipping-options"
import { formatCEP, validateCEP } from "@/utils/cep"
import type { ShippingOption, ShippingCalculatorProps } from "@/types/shipping"

export default function ShippingCalculator({ onShippingSelect, selectedShipping }: ShippingCalculatorProps) {
  const [cep, setCep] = useState("")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)
  const { items } = useCart()

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setCep(formatted)

    // Reset shipping when CEP changes
    if (selectedShipping) {
      onShippingSelect(null, "")
      setShippingOptions([])
      setHasCalculated(false)
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
      setHasCalculated(true)

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
    toast({
      title: "Frete selecionado",
      description: `${option.company.name} - R$ ${Number.parseFloat(option.custom_price || option.price)
        .toFixed(2)
        .replace(".", ",")}`,
    })
  }

  return (
    <Card className="bg-white/90 border-[#F4847B]/20 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-[#631C21] text-lg">
          <Truck className="h-5 w-5 text-[#882335]" />
          Calcular Frete
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cep" className="text-[#631C21] font-medium">
            CEP de entrega
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#631C21]/50" />
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                maxLength={9}
                className="pl-10 border-[#F4847B]/30 focus:border-[#882335] focus:ring-[#882335]/20"
              />
            </div>
            <Button
              onClick={calculateShipping}
              disabled={isLoading || !cep}
              className="bg-[#882335] hover:bg-[#631C21] text-white px-4"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {hasCalculated && (
          <ShippingOptions
            options={shippingOptions}
            selectedOption={selectedShipping}
            onSelect={handleShippingSelect}
          />
        )}
      </CardContent>
    </Card>
  )
}
