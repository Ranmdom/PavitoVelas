"use client"

import { useState } from "react"
import { ChevronDown, Grid3X3, LayoutGrid } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ProductCard from "@/components/product-card"

export default function ProductGrid() {
  const [sortOption, setSortOption] = useState("relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Dados simulados de produtos
  const products = [
    {
      id: "1",
      name: "Vela Pêssego & Baunilha",
      price: 49.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Frutal",
      weight: "250g",
      color: "#F4847B",
    },
    {
      id: "2",
      name: "Vela Lavanda & Bergamota",
      price: 54.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Floral",
      weight: "250g",
      color: "#CD4E65",
    },
    {
      id: "3",
      name: "Vela Madeira & Âmbar",
      price: 59.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Amadeirado",
      weight: "300g",
      color: "#882335",
    },
    {
      id: "4",
      name: "Vela Vanilla & Canela",
      price: 49.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Especiarias",
      weight: "250g",
      color: "#D36A6A",
    },
    {
      id: "5",
      name: "Vela Limão & Manjericão",
      price: 45.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Cítrico",
      weight: "200g",
      color: "#F4847B",
    },
    {
      id: "6",
      name: "Vela Rosa & Jasmim",
      price: 59.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Floral",
      weight: "250g",
      color: "#CD4E65",
    },
    {
      id: "7",
      name: "Vela Sândalo & Cedro",
      price: 69.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Amadeirado",
      weight: "350g",
      color: "#882335",
    },
    {
      id: "8",
      name: "Vela Maçã & Canela",
      price: 49.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Especiarias",
      weight: "250g",
      color: "#D36A6A",
    },
    {
      id: "9",
      name: "Vela Laranja & Cravo",
      price: 45.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Cítrico",
      weight: "200g",
      color: "#F4847B",
    },
    {
      id: "10",
      name: "Vela Gardênia & Lírio",
      price: 59.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Floral",
      weight: "250g",
      color: "#CD4E65",
    },
    {
      id: "11",
      name: "Vela Patchouli & Vetiver",
      price: 69.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Amadeirado",
      weight: "350g",
      color: "#882335",
    },
    {
      id: "12",
      name: "Vela Cardamomo & Gengibre",
      price: 54.9,
      image: "/templates/vela-1.jpeg?height=300&width=300",
      category: "Especiarias",
      weight: "250g",
      color: "#D36A6A",
    },
  ]

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
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            weight={product.weight}
            color={product.color}
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

