import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import FeaturedProduct from "@/components/featured-product"
import Newsletter from "@/components/newsletter"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, Flame } from "lucide-react"
import PopularProducts from "@/components/PopularProducts"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#631C21] to-[#882335] py-12 md:py-24">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/flame-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        <div className="container relative z-10 mx-auto grid items-center gap-6 px-4 md:grid-cols-2 lg:gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-block rounded-full bg-[#F4847B]/10 px-3 py-1 text-sm text-[#F4847B]">
              Velas Artesanais Premium
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
              Pavito Velas
            </h1>
            <p className="max-w-[600px] text-white/80 md:text-xl">
              Velas artesanais feitas com ingredientes naturais, criadas para trazer aroma, bem-estar e harmonia para
              seu ambiente.
            </p>
            <div className="flex flex-wrap gap-4 sm:justify-center md:justify-start">
              <Link
                href="/produtos"
                className={buttonVariants({ variant: "default", className: "bg-[#F4847B] hover:bg-[#F1889C]" })}
              >
                Ver coleção
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative aspect-square w-72 overflow-hidden rounded-full bg-[#F1889C]/20 p-2 sm:w-80 md:w-96">
              <Image
                src="/templates/vela-1.jpeg?height=400&width=400"
                width={400}
                height={400}
                alt="Vela artesanal decorativa"
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Populares */}
            <PopularProducts />

      {/* Produto Limitado */}
      <section className="w-full bg-white py-12 md:py-24">
        <div className="container mx-auto px-4">
          <FeaturedProduct />
        </div>
      </section>

      {/* Como usamos */}
      <section className="w-full bg-[#882335] py-12 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Como criamos nossas velas</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-white/80">
              Cada vela é cuidadosamente produzida em nosso ateliê, utilizando cera de soja 100% natural e óleos
              essenciais selecionados
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-[#631C21] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4847B]">
                <Flame className="h-6 w-6 text-[#631C21]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Ingredientes naturais</h3>
              <p className="text-white/80">
                Utilizamos apenas cera de soja 100% natural, livre de parafina e outros derivados de petróleo.
              </p>
            </div>
            <div className="rounded-lg bg-[#631C21] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4847B]">
                <Flame className="h-6 w-6 text-[#631C21]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Fragrâncias exclusivas</h3>
              <p className="text-white/80">
                Criamos fragrâncias exclusivas com óleos essenciais puros para uma experiência aromática única.
              </p>
            </div>
            <div className="rounded-lg bg-[#631C21] p-6">
              <div className="mapb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4847B]">
                <Flame className="h-6 w-6 text-[#631C21]" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Produção artesanal</h3>
              <p className="text-white/80">
                Cada vela é produzida manualmente em pequenos lotes para garantir qualidade e atenção aos detalhes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="w-full bg-[#F1889C]/10 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <Newsletter />
        </div>
      </section>
    </div>
  )
}

