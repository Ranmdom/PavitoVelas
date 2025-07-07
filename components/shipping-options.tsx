"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Truck, Clock, CheckCircle } from "lucide-react"
import type { ShippingOption } from "@/types/shipping"

interface ShippingOptionsProps {
  options: ShippingOption[]
  selectedOption?: ShippingOption | null
  onSelect: (option: ShippingOption) => void
}

export default function ShippingOptions({ options, selectedOption, onSelect }: ShippingOptionsProps) {
  const formatDeliveryTime = (option: ShippingOption) => {
    const time = option.custom_delivery_time || option.delivery_time
    return `${time} dia${time > 1 ? "s" : ""} útil${time > 1 ? "eis" : ""}`
  }

  const formatPrice = (option: ShippingOption) => {
    const price = Number.parseFloat(option.custom_price || option.price)
    return price.toFixed(2).replace(".", ",")
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-6 text-[#631C21]/70">
        <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhuma opção de frete disponível para este CEP.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#631C21] font-medium">
        <Truck className="h-4 w-4" />
        <span>Opções de entrega</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {options.map((option) => {
          const isSelected = selectedOption?.id === option.id && selectedOption?.company_id === option.company_id

          return (
            <Card
              key={`${option.company_id}-${option.id}`}
              className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                isSelected
                  ? "border-[#882335] bg-[#882335]/5 shadow-sm"
                  : "border-[#F4847B]/20 hover:border-[#F4847B]/40"
              }`}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#631C21] truncate">{option.company.name}</span>
                      {isSelected && <CheckCircle className="h-4 w-4 text-[#882335] flex-shrink-0" />}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs bg-[#F4847B]/10 border-[#F4847B]/30">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDeliveryTime(option)}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#631C21]/70 truncate">{option.name}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-semibold text-[#631C21]">R$ {formatPrice(option)}</div>
                  {option.discount && Number.parseFloat(option.discount) > 0 && (
                    <div className="text-xs text-green-600">
                      Desconto: R$ {Number.parseFloat(option.discount).toFixed(2).replace(".", ",")}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
