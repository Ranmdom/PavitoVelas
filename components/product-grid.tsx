"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Grid3X3, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ProductCard from "@/components/product-card"

interface Product {
  id: string
  nome: string
  preco: number
  image: string[] // porque no seu back é array!
  categoriaNome: string
  peso?: string | number | null
  fragrancia?: string
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [sortOption, setSortOption] = useState("relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/produtos")
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="hidden lg:block">
          <h2 className="text-lg font-medium text-[#631C21]">
            Produtos <span className="text-[#882335]/70">({products.length})</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-l-md rounded-r-none border border-r-0 border-[#F4847B]/30 ${
                viewMode === "grid" ? "bg-[#F4847B]/10 text-[#631C21]" : "text-[#631C21]/60"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-l-none rounded-r-md border border-l-0 border-[#F4847B]/30 ${
                viewMode === "list" ? "bg-[#F4847B]/10 text-[#631C21]" : "text-[#631C21]/60"
              }`}
              onClick={() => setViewMode("list")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#F4847B]/30 text-[#631C21]">
                Ordenar por
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSortOption("relevancia")}
                className={sortOption === "relevancia" ? "bg-[#F4847B]/10" : ""}
              >
                Relevância
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("menor-preco")}
                className={sortOption === "menor-preco" ? "bg-[#F4847B]/10" : ""}
              >
                Menor preço
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("maior-preco")}
                className={sortOption === "maior-preco" ? "bg-[#F4847B]/10" : ""}
              >
                Maior preço
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("mais-vendidos")}
                className={sortOption === "mais-vendidos" ? "bg-[#F4847B]/10" : ""}
              >
                Mais vendidos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOption("lancamentos")}
                className={sortOption === "lancamentos" ? "bg-[#F4847B]/10" : ""}
              >
                Lançamentos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.nome}
            price={product.preco}
            image={
              Array.isArray(product.image) && product.image.length > 0
                ? product.image[0]
                : "/placeholder.svg"
            }
            category={product.categoriaNome}
            weight={product.peso ? String(product.peso) : ""}
            color="#F4847B" // ou qualquer lógica que você queira para definir a cor
          />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="outline" className="border-[#F4847B]/30 text-[#631C21] hover:bg-[#F4847B]/10">
          Carregar mais produtos
        </Button>
      </div>
    </div>
  )
}
