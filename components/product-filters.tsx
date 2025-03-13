"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  className?: string
}

export default function ProductFilters({ className }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [fragrances, setFragrances] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  const handlePriceChange = (value: string) => {
    setPriceRange(priceRange.includes(value) ? priceRange.filter((item) => item !== value) : [...priceRange, value])
  }

  const handleCategoryChange = (value: string) => {
    setCategories(categories.includes(value) ? categories.filter((item) => item !== value) : [...categories, value])
  }

  const handleFragranceChange = (value: string) => {
    setFragrances(fragrances.includes(value) ? fragrances.filter((item) => item !== value) : [...fragrances, value])
  }

  const handleSizeChange = (value: string) => {
    setSizes(sizes.includes(value) ? sizes.filter((item) => item !== value) : [...sizes, value])
  }

  const clearFilters = () => {
    setPriceRange([])
    setCategories([])
    setFragrances([])
    setSizes([])
  }

  return (
    <div className={cn("sticky top-20", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#631C21]">Filtros</h2>
        {(priceRange.length > 0 || categories.length > 0 || fragrances.length > 0 || sizes.length > 0) && (
          <Button variant="ghost" className="h-auto p-0 text-xs text-[#882335]" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      <Separator className="my-4 bg-[#F4847B]/20" />

      {/* Filtro de Preço */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left font-medium text-[#631C21]">
          Preço
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-1"
                checked={priceRange.includes("0-50")}
                onCheckedChange={() => handlePriceChange("0-50")}
              />
              <Label htmlFor="price-1" className="text-sm">
                Até R$ 50,00
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-2"
                checked={priceRange.includes("50-100")}
                onCheckedChange={() => handlePriceChange("50-100")}
              />
              <Label htmlFor="price-2" className="text-sm">
                R$ 50,00 - R$ 100,00
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-3"
                checked={priceRange.includes("100-150")}
                onCheckedChange={() => handlePriceChange("100-150")}
              />
              <Label htmlFor="price-3" className="text-sm">
                R$ 100,00 - R$ 150,00
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-4"
                checked={priceRange.includes("150+")}
                onCheckedChange={() => handlePriceChange("150+")}
              />
              <Label htmlFor="price-4" className="text-sm">
                Acima de R$ 150,00
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtro de Categoria */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left font-medium text-[#631C21]">
          Categoria
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-1"
                checked={categories.includes("frutal")}
                onCheckedChange={() => handleCategoryChange("frutal")}
              />
              <Label htmlFor="category-1" className="text-sm">
                Frutal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-2"
                checked={categories.includes("floral")}
                onCheckedChange={() => handleCategoryChange("floral")}
              />
              <Label htmlFor="category-2" className="text-sm">
                Floral
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-3"
                checked={categories.includes("amadeirado")}
                onCheckedChange={() => handleCategoryChange("amadeirado")}
              />
              <Label htmlFor="category-3" className="text-sm">
                Amadeirado
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-4"
                checked={categories.includes("especiarias")}
                onCheckedChange={() => handleCategoryChange("especiarias")}
              />
              <Label htmlFor="category-4" className="text-sm">
                Especiarias
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-5"
                checked={categories.includes("citrico")}
                onCheckedChange={() => handleCategoryChange("citrico")}
              />
              <Label htmlFor="category-5" className="text-sm">
                Cítrico
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtro de Fragrância */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left font-medium text-[#631C21]">
          Fragrância
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragrance-1"
                checked={fragrances.includes("pessego")}
                onCheckedChange={() => handleFragranceChange("pessego")}
              />
              <Label htmlFor="fragrance-1" className="text-sm">
                Pêssego
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragrance-2"
                checked={fragrances.includes("lavanda")}
                onCheckedChange={() => handleFragranceChange("lavanda")}
              />
              <Label htmlFor="fragrance-2" className="text-sm">
                Lavanda
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragrance-3"
                checked={fragrances.includes("baunilha")}
                onCheckedChange={() => handleFragranceChange("baunilha")}
              />
              <Label htmlFor="fragrance-3" className="text-sm">
                Baunilha
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragrance-4"
                checked={fragrances.includes("canela")}
                onCheckedChange={() => handleFragranceChange("canela")}
              />
              <Label htmlFor="fragrance-4" className="text-sm">
                Canela
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fragrance-5"
                checked={fragrances.includes("madeira")}
                onCheckedChange={() => handleFragranceChange("madeira")}
              />
              <Label htmlFor="fragrance-5" className="text-sm">
                Madeira
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtro de Tamanho */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left font-medium text-[#631C21]">
          Tamanho
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="size-1"
                checked={sizes.includes("pequeno")}
                onCheckedChange={() => handleSizeChange("pequeno")}
              />
              <Label htmlFor="size-1" className="text-sm">
                Pequeno (150g)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="size-2"
                checked={sizes.includes("medio")}
                onCheckedChange={() => handleSizeChange("medio")}
              />
              <Label htmlFor="size-2" className="text-sm">
                Médio (250g)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="size-3"
                checked={sizes.includes("grande")}
                onCheckedChange={() => handleSizeChange("grande")}
              />
              <Label htmlFor="size-3" className="text-sm">
                Grande (350g)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="size-4" checked={sizes.includes("kit")} onCheckedChange={() => handleSizeChange("kit")} />
              <Label htmlFor="size-4" className="text-sm">
                Kit (3 unidades)
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-8 rounded-lg bg-[#F4847B]/10 p-4">
        <h3 className="mb-2 font-medium text-[#631C21]">Precisa de ajuda?</h3>
        <p className="text-sm text-[#631C21]/80">
          Entre em contato conosco para obter ajuda na escolha da vela perfeita para você.
        </p>
        <Button className="mt-3 w-full bg-[#F4847B] text-white hover:bg-[#F1889C]">Fale conosco</Button>
      </div>
    </div>
  )
}

