"use client"

import { Filter } from "lucide-react"
import { useEffect, useState } from "react"
import ProductGrid from "@/components/product-grid"
import ProductFilters from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type ProdutoAPI = {
  id: string
  nome: string
  preco: number
  categoriaNome: string
  fragrancia: string
  peso: number | null
  image: string[]
}

export default function ProdutosPage() {
  const [filters, setFilters] = useState<{
    categories: string[]
    fragrances: string[]
    sizes: string[]
    priceRange: string[]
  }>({
    categories: [],
    fragrances: [],
    sizes: [],
    priceRange: [],
  })
  const [products, setProducts] = useState<ProdutoAPI[]>([])
  const [loading, setLoading] = useState(false)

  // Recarrega produtos ao mudar filtros
  useEffect(() => {
    const params = new URLSearchParams()
    filters.categories.forEach((c) => params.append("categoria", c))
    filters.fragrances.forEach((f) => params.append("fragrancia", f))
    filters.sizes.forEach((s) => params.append("peso", s.replace("g", "")))
    filters.priceRange.forEach((r) => params.append("priceRange", r))

    setLoading(true)
    fetch(`/api/produtos?${params.toString()}`)
      .then((res) => res.json())
      .then((data: ProdutoAPI[]) => setProducts(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <section className="w-full bg-gradient-to-r from-[#631C21] to-[#882335] py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Nossos Produtos</h1>
          <p className="mt-4 max-w-[700px] text-white/80 md:text-lg">
            Velas artesanais com ingredientes naturais e fragrâncias exclusivas.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="w-full flex-1 bg-[#FBE1D0]/30 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
            {/* Mobile */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-medium text-[#631C21]">
                Produtos <span className="text-[#882335]/70">({products.length})</span>
              </h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-[#F4847B]/30 text-[#631C21]">
                    <Filter className="mr-2 h-4 w-4" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <ProductFilters onFiltersChange={setFilters} className="mt-8" />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <ProductFilters onFiltersChange={setFilters} />
            </div>

            {/* Grid */}
            <div>
              <ProductGrid products={products} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
