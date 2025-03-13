import { Filter } from "lucide-react"
import ProductGrid from "@/components/product-grid"
import ProductFilters from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header da página */}
      <section className="w-full bg-gradient-to-r from-[#631C21] to-[#882335] py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">Nossos Produtos</h1>
          <p className="mt-4 max-w-[700px] text-white/80 md:text-lg">
            Descubra nossa coleção de velas artesanais, criadas com ingredientes naturais e fragrâncias exclusivas para
            transformar seu ambiente.
          </p>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="w-full flex-1 bg-[#FBE1D0]/30 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
            {/* Filtros para mobile */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-medium text-[#631C21]">
                Produtos <span className="text-[#882335]/70">(24)</span>
              </h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-[#F4847B]/30 text-[#631C21]">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <ProductFilters className="mt-8" />
                </SheetContent>
              </Sheet>
            </div>

            {/* Filtros para desktop */}
            <div className="hidden lg:block">
              <ProductFilters />
            </div>

            {/* Grid de produtos */}
            <div>
              <ProductGrid />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

