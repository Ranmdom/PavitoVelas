"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function FeaturedProduct() {
  const [quantity, setQuantity] = useState(1)

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  return (
    <div className="relative">
      <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-[#F4847B]/10 md:-left-12 md:-top-12 md:h-64 md:w-64"></div>
      <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[#882335]/10 md:-bottom-16 md:-right-16 md:h-72 md:w-72"></div>

      <div className="relative grid gap-8 overflow-hidden rounded-xl border border-[#F4847B]/20 bg-white p-6 shadow-lg md:grid-cols-2 md:p-8">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-[#FBE1D0] to-[#F4847B]/20">
          <Image
            src="/placeholder.svg?height=500&width=500"
            alt="Vela Edição Especial"
            fill
            className="object-contain p-6"
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-2 inline-block w-fit rounded-full bg-[#F4847B]/10 px-3 py-1 text-sm font-medium text-[#F4847B]">
            Edição Limitada
          </div>
          <h2 className="mb-3 text-3xl font-bold text-[#631C21]">Vela Pêssego & Mel</h2>
          <p className="text-sm text-[#631C21]/70">Peso: 350g • Tempo de queima: ~50 horas</p>

          <div className="my-6 text-3xl font-bold text-[#882335]">R$ 89,90</div>

          <p className="mb-6 text-[#631C21]/80">
            Nossa edição especial combina a doçura do pêssego com notas de mel para criar um ambiente acolhedor e
            relaxante. Feita com cera de soja 100% natural e fragrâncias exclusivas.
          </p>

          <div className="mb-4 grid gap-4">
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full bg-[#F4847B]"></div>
              <span>100% Natural</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full bg-[#F4847B]"></div>
              <span>Fragrância duradoura</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full bg-[#F4847B]"></div>
              <span>Embalagem sustentável</span>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4 sm:flex-row">
            <Card className="flex w-32 items-center justify-between border-[#631C21]/20">
              <Button variant="ghost" size="icon" className="text-[#631C21]" onClick={decreaseQuantity}>
                <Minus className="h-4 w-4" />
              </Button>
              <CardContent className="flex h-full items-center p-0">
                <span className="text-lg font-medium">{quantity}</span>
              </CardContent>
              <Button variant="ghost" size="icon" className="text-[#631C21]" onClick={increaseQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </Card>

            <Button className="flex-1 bg-[#882335] text-white hover:bg-[#631C21]">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

