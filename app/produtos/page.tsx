"use client"

import { Filter } from "lucide-react"
import { useEffect, useState } from "react"
import ProductGrid from "@/components/product-grid"
import ProductFilters from "@/components/product-filters"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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

type Filtros = {
  categories: string[]
  fragrances: string[]
  sizes: string[]
  priceRange: string[]
}

export default function ProdutosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Extrai filtros da URL (garante a fonte da verdade)
  function getFiltersFromURL(): Filtros {
    return {
      categories: searchParams.getAll("categoria"),
      fragrances: searchParams.getAll("fragrancia"),
      sizes: searchParams.getAll("peso").map((s) => `${s}g`),
      priceRange: searchParams.getAll("priceRange"),
    }
  }

  // Estado local sincronizado com a URL
  const [filters, setFilters] = useState<Filtros>(getFiltersFromURL())
  const [products, setProducts] = useState<ProdutoAPI[]>([])
  const [loading, setLoading] = useState(false)

  // Atualiza filtros ao mudar URL (garante reatividade ao botão voltar/avançar do navegador)
  useEffect(() => {
    setFilters(getFiltersFromURL())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.getAll("categoria").join(","),
    searchParams.getAll("fragrancia").join(","),
    searchParams.getAll("peso").join(","),
    searchParams.getAll("priceRange").join(","),
  ])

  // Sempre que filtros mudam, atualiza a URL e busca os produtos
  useEffect(() => {
    const params = new URLSearchParams()
    filters.categories.forEach((c) => params.append("categoria", c))
    filters.fragrances.forEach((f) => params.append("fragrancia", f))
    filters.sizes.forEach((s) => params.append("peso", s.replace("g", "")))
    filters.priceRange.forEach((r) => params.append("priceRange", r))

    // Atualiza a URL sem recarregar a página
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    // Busca produtos
    setLoading(true)
    fetch(`/api/produtos?${params.toString()}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pathname, router])

  // Quando usuário interage com os filtros, atualiza o estado (pai) → dispara atualização de URL
  const handleFiltersChange = (newFilters: Filtros) => {
    setFilters(newFilters)
  }

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
    </div>
  )
}
