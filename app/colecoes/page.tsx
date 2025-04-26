import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import CollectionCard from "@/components/collection-card"
import EmptyCollections from "@/components/empty-collections"

// Dados mockados para as coleções
const collections = [
  {
    slug: "serenidade",
    name: "Coleção Serenidade",
    description:
      "Projetada para criar um ambiente de paz e tranquilidade, ideal para momentos de relaxamento e meditação.",
    price: 249.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#7B9CD5",
    category: "Relaxamento",
    items: [
      {
        id: "lavanda-noturna",
        name: "Lavanda Noturna",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#7B9CD5",
        category: "Relaxamento",
      },
      {
        id: "camomila-mel",
        name: "Camomila & Mel",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#F3E5AB",
        category: "Relaxamento",
      },
      {
        id: "sandalo-cedro",
        name: "Sândalo & Cedro",
        price: 99.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "300g",
        color: "#C19A6B",
        category: "Relaxamento",
      },
    ],
  },
  {
    slug: "energia",
    name: "Coleção Energia",
    description: "Desenvolvida para revitalizar seu espaço e despertar os sentidos, trazendo vitalidade ao seu dia.",
    price: 269.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#FF9F5B",
    category: "Energizante",
    items: [
      {
        id: "laranja-canela",
        name: "Laranja & Canela",
        price: 99.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "300g",
        color: "#FF9F5B",
        category: "Energizante",
      },
      {
        id: "limao-gengibre",
        name: "Limão & Gengibre",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#C5E17A",
        category: "Energizante",
      },
      {
        id: "menta-eucalipto",
        name: "Menta & Eucalipto",
        price: 99.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "300g",
        color: "#98D8C8",
        category: "Energizante",
      },
    ],
  },
  {
    slug: "elegancia",
    name: "Coleção Elegância",
    description: "Criada para ocasiões especiais e ambientes sofisticados, trazendo um toque de luxo ao seu espaço.",
    price: 289.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#D4AF37",
    category: "Premium",
    items: [
      {
        id: "ambar-baunilha",
        name: "Âmbar & Baunilha",
        price: 109.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "300g",
        color: "#D4AF37",
        category: "Premium",
      },
      {
        id: "cedro-bergamota",
        name: "Cedro & Bergamota",
        price: 99.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#8B4513",
        category: "Premium",
      },
    ],
  },
  {
    slug: "natureza",
    name: "Coleção Natureza",
    description: "Inspirada nos aromas puros da natureza, trazendo a essência do ar livre para dentro de casa.",
    price: 229.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#228B22",
    category: "Natural",
    items: [
      {
        id: "floresta-tropical",
        name: "Floresta Tropical",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#228B22",
        category: "Natural",
      },
      {
        id: "brisa-do-mar",
        name: "Brisa do Mar",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#4682B4",
        category: "Natural",
      },
      {
        id: "madeira-de-cedro",
        name: "Madeira de Cedro",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#8B4513",
        category: "Natural",
      },
      {
        id: "flores-silvestres",
        name: "Flores Silvestres",
        price: 89.9,
        image: "/placeholder.svg?height=300&width=300",
        weight: "250g",
        color: "#FF69B4",
        category: "Natural",
      },
    ],
  },
]

export default function CollectionsPage() {
  return







    if (collections.length === 0) {
        return (
            <EmptyCollections/>
        )
    }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero da página de coleções */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#631C21] to-[#882335] py-12 md:py-24">
      <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/flame-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        <div className="flex flex-col justify-center items-center text-center p-12 md:p-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Nossas Coleções</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Descubra mundos sensoriais únicos através das nossas coleções cuidadosamente elaboradas para transformar seu
            ambiente.
          </p>
        </div>
      </div>

      {/* Introdução às coleções */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#631C21] mt-2 mb-4">Experiências Sensoriais Exclusivas</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Cada coleção Pavito foi criada para despertar emoções específicas e transformar momentos comuns em
          experiências memoráveis. Nossas velas artesanais são produzidas com ingredientes naturais selecionados,
          garantindo aromas autênticos e duradouros.
        </p>
      </div>

      {/* Listagem de coleções */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.slug}
            slug={collection.slug}
            name={collection.name}
            description={collection.description}
            price={collection.price}
            image={collection.image}
            color={collection.color}
            category={collection.category}
            items={collection.items}
          />
        ))}
      </div>

      {/* Benefícios e Diferenciais */}
      <div className="bg-[#F4847B]/10 rounded-xl p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#631C21] mb-4">Por que escolher as velas Pavito?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Nossas velas são mais do que simples objetos decorativos - são experiências sensoriais completas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">100% Naturais</h3>
            <p>Ingredientes naturais selecionados, livres de substâncias tóxicas e parafina.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Longa Duração</h3>
            <p>Formulação especial que garante queima lenta e uniforme por mais tempo.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Aromas Autênticos</h3>
            <p>Fragrâncias desenvolvidas para manter a intensidade do início ao fim.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Produção Artesanal</h3>
            <p>Cada vela é produzida à mão com cuidado e atenção aos detalhes.</p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#631C21] mb-4">
          Transforme seu ambiente com as coleções Pavito
        </h2>
        <p className="text-lg mb-8">
          Escolha a coleção que melhor se adapta ao seu estilo de vida e descubra como pequenos detalhes podem
          transformar completamente seu espaço.
        </p>
        <Button size="lg" className="bg-[#631C21] hover:bg-[#631C21]/90 text-white">
          Explorar Todas as Coleções <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
