"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import ProductGrid from "@/components/product-grid"
import ProductFilters from "@/components/product-filters"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

type ProdutoAPI = {
  id: string
  nome: string
  preco: number
  categoriaNome: string
  fragrancia: string
  peso: number | null
  image: string[]
}

type Filtros = {
  categories: string[]
  fragrances: string[]
  sizes: string[]
  priceRange: string[]
}

export default function ProdutosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  function getFiltersFromURL(): Filtros {
    return {
      categories: searchParams.getAll("categoria"),
      fragrances: searchParams.getAll("fragrancia"),
      sizes: searchParams.getAll("peso").map((s) => `${s}g`),
      priceRange: searchParams.getAll("priceRange"),
    }
  }

  const [filters, setFilters] = useState<Filtros>(getFiltersFromURL())
  const [products, setProducts] = useState<ProdutoAPI[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFilters(getFiltersFromURL())
  }, [
    searchParams.getAll("categoria").join(","),
    searchParams.getAll("fragrancia").join(","),
    searchParams.getAll("peso").join(","),
    searchParams.getAll("priceRange").join(","),
  ])

  useEffect(() => {
    const params = new URLSearchParams()
    filters.categories.forEach((c) => params.append("categoria", c))
    filters.fragrances.forEach((f) => params.append("fragrancia", f))
    filters.sizes.forEach((s) => params.append("peso", s.replace("g", "")))
    filters.priceRange.forEach((r) => params.append("priceRange", r))

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    setLoading(true)
    fetch(`/api/produtos?${params.toString()}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters, pathname, router])

  const handleFiltersChange = (newFilters: Filtros) => {
    setFilters(newFilters)
  }

  return (
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
                <ProductFilters
                  onFiltersChange={handleFiltersChange}
                  filters={filters}
                  className="mt-8"
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              filters={filters}
            />
          </div>

          {/* Grid */}
          <div>
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  )
}
