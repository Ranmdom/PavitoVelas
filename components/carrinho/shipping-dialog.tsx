"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"
import { formatCEP, validateCEP } from "@/utils/cep"
import type { ShippingOption } from "@/types/shipping"

interface ShippingDialogProps {
  /** Função para retornar a opção escolhida */
  onShippingSelect: (option: ShippingOption | null, postalCode: string) => void
  selectedShipping?: ShippingOption | null
  subtotal: number
  /** CEP vindo do AddressSelector */
  addressPostalCode?: string
}

export default function ShippingDialog({
  onShippingSelect,
  selectedShipping,
  subtotal,
  addressPostalCode,
}: ShippingDialogProps) {
  const [open, setOpen] = useState(false)
  const [cep, setCep] = useState("")
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { items } = useCart()

  // Ao receber novo endereço, formata CEP e abre diálogo
  useEffect(() => {
    if (addressPostalCode) {
      const formatted = formatCEP(addressPostalCode)
      setCep(formatted)
      setOpen(true)
    }
  }, [addressPostalCode])

  // Quando diálogo abre, calcula frete se necessário
  useEffect(() => {
    if (open) calculateShipping()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const calculateShipping = async () => {
    if (subtotal > 150) return // grátis
    if (!validateCEP(cep)) {
      toast({ title: "CEP inválido", description: "Verifique o CEP do endereço.", variant: "destructive" })
      return
    }
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione produtos ao carrinho.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    setShippingOptions([])
    try {
      const resp = await fetch("/api/melhorEnvio/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode: cep.replace(/\D/g, ""),
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        toast({ title: "Erro no cálculo", description: data.error || "Falha ao calcular frete.", variant: "destructive" })
        return
      }
      const valid = data.filter((o: any) => !o.error)
      setShippingOptions(valid)
      if (valid.length === 0) toast({ title: "Sem opções", description: "Nenhuma opção disponível.", variant: "destructive" })
    } catch (err) {
      toast({ title: "Erro no cálculo", description: "Tente novamente mais tarde.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (opt: ShippingOption) => {
    onShippingSelect(opt, cep)
    setOpen(false)
    toast({
      title: "Frete selecionado",
      description: `${opt.company.name} • R$ ${Number.parseFloat(opt.custom_price || opt.price)
        .toFixed(2)
        .replace('.', ',')}`,
    })
  }

  const fmtTime = (o: ShippingOption) =>
    `${o.custom_delivery_time || o.delivery_time} dia${(o.custom_delivery_time || o.delivery_time) > 1 ? 's' : ''}`
  const fmtPrice = (o: ShippingOption) =>
    Number.parseFloat(o.custom_price || o.price).toFixed(2).replace('.', ',')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Opções de entrega</DialogTitle>
          <DialogDescription>CEP: {cep}</DialogDescription>
        </DialogHeader>

        {subtotal > 150 ? (
          <div className="text-green-600 font-medium py-4 text-center">Frete grátis!</div>
        ) : isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin"/></div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {shippingOptions.map(o => (
              <Card
                key={`${o.company_id}-${o.id}`}
                onClick={() => handleSelect(o)}
                className="p-3 cursor-pointer hover:shadow-sm border-[#F4847B]/20 hover:border-[#F4847B]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#631C21] text-sm truncate">{o.company.name}</span>
                      <Badge variant="outline" className="text-xs bg-[#F4847B]/10 border-[#F4847B]/30">{fmtTime(o)}</Badge>
                    </div>
                    <p className="text-xs text-[#631C21]/70 truncate">{o.name}</p>
                  </div>
                  <div className="flex-shrink-0 ml-3 text-right">R$ {fmtPrice(o)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
