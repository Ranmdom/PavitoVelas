// ProductFilters.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  className?: string
  onFiltersChange: (filters: {
    categories: string[]
    fragrances: string[]
    sizes: string[]
    priceRange: string[]
  }) => void
  filters: {
    categories: string[]
    fragrances: string[]
    sizes: string[]
    priceRange: string[]
  }
}

type Produto = {
  categoriaNome: string
  fragrancia: string
  peso: number | null
}

export default function ProductFilters({ className, onFiltersChange, filters }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [fragrances, setFragrances] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [options, setOptions] = useState<Produto[]>([])

  // Atualiza o estado interno caso o filtro vindo da URL (prop) mude
  useEffect(() => {
    setCategories(filters.categories || [])
    setFragrances(filters.fragrances || [])
    setSizes(filters.sizes || [])
    setPriceRange(filters.priceRange || [])
  }, [
    filters.categories.join(","),
    filters.fragrances.join(","),
    filters.sizes.join(","),
    filters.priceRange.join(","),
  ])

  // Busca opções únicas
  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setOptions(data))
      .catch(console.error)
  }, [])

  // Dispara para o pai ao mudar filtros internos
  useEffect(() => {
    onFiltersChange({
      categories,
      fragrances,
      sizes,
      priceRange,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, fragrances, sizes, priceRange])

  const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)))
  const categoriasUnicas = unique(options.map((p) => p.categoriaNome))
  const fragranciasUnicas = unique(options.map((p) => p.fragrancia))
  const tamanhosUnicos = unique(options.map((p) => (p.peso ? `${p.peso}g` : "Sem peso")))

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const clear = () => {
    setPriceRange([])
    setCategories([])
    setFragrances([])
    setSizes([])
  }

  return (
    <div className={cn("sticky top-20 p-4 bg-white rounded-md shadow", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-[#631C21]">Filtros</h2>
        {(priceRange.length || categories.length || fragrances.length || sizes.length) > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Limpar
          </Button>
        )}
      </div>
      <Separator className="my-4 bg-[#F4847B]/20" />

      {/* Price */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex justify-between py-2 font-medium text-[#631C21]">
          Preço<ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {["0-50", "50-100", "100-150", "150+"].map((r) => (
            <div key={r} className="flex items-center space-x-2">
              <Checkbox
                checked={priceRange.includes(r)}
                onCheckedChange={() => toggle(priceRange, setPriceRange, r)}
              />
              <Label>
                {r === "0-50" ? "Até R$50" : r === "150+" ? "Acima de R$150" : `R$${r.replace("-", " - R$")}`}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categoria */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex justify-between py-2 font-medium text-[#631C21]">
          Categoria<ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {categoriasUnicas.map((c) => (
            <div key={c} className="flex items-center space-x-2">
              <Checkbox
                checked={categories.includes(c)}
                onCheckedChange={() => toggle(categories, setCategories, c)}
              />
              <Label>{c}</Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Fragrância */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex justify-between py-2 font-medium text-[#631C21]">
          Fragrância<ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {fragranciasUnicas.map((f) => (
            <div key={f} className="flex items-center space-x-2">
              <Checkbox
                checked={fragrances.includes(f)}
                onCheckedChange={() => toggle(fragrances, setFragrances, f)}
              />
              <Label>{f}</Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Tamanho */}
      <Collapsible defaultOpen className="mb-4">
        <CollapsibleTrigger className="flex justify-between py-2 font-medium text-[#631C21]">
          Tamanho<ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {tamanhosUnicos.map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <Checkbox checked={sizes.includes(s)} onCheckedChange={() => toggle(sizes, setSizes, s)} />
              <Label>{s}</Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
