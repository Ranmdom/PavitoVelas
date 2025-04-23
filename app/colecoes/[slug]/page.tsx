import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/product-card"
import AddCollectionToCart from "@/components/add-collection-to-cart"

// Dados mockados para as coleções
const collectionsData = {
  serenidade: {
    slug: "serenidade",
    name: "Coleção Serenidade",
    description:
      "Projetada para criar um ambiente de paz e tranquilidade, ideal para momentos de relaxamento e meditação.",
    longDescription:
      "Nossa coleção Serenidade combina aromas suaves de lavanda, camomila e sândalo que acalmam a mente e reduzem o estresse. Cada vela foi cuidadosamente formulada para promover sensações de calma e bem-estar, ajudando a criar um ambiente perfeito para relaxamento, meditação ou simplesmente para desfrutar de momentos tranquilos em casa. Os tons suaves de azul e lilás das velas complementam a sensação de serenidade que os aromas proporcionam.",
    price: 249.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#7B9CD5",
    category: "Relaxamento",
    benefits: [
      "Promove relaxamento profundo e redução do estresse",
      "Ajuda a melhorar a qualidade do sono",
      "Cria um ambiente propício para meditação e mindfulness",
      "Aromas que persistem por toda a queima da vela",
    ],
    items: [
      {
        id: "lavanda-noturna",
        name: "Lavanda Noturna",
        description: "Aroma relaxante de lavanda que promove um sono tranquilo e reparador.",
        price: 89.9,
        weight: "250g",
        color: "#7B9CD5",
        image: "/placeholder.svg?height=300&width=300",
        category: "Relaxamento",
      },
      {
        id: "camomila-mel",
        name: "Camomila & Mel",
        description: "Combinação reconfortante que acalma os sentidos e reduz a ansiedade.",
        price: 89.9,
        weight: "250g",
        color: "#F3E5AB",
        image: "/placeholder.svg?height=300&width=300",
        category: "Relaxamento",
      },
      {
        id: "sandalo-cedro",
        name: "Sândalo & Cedro",
        description: "Aroma amadeirado e terroso que traz sensação de estabilidade e equilíbrio.",
        price: 99.9,
        weight: "300g",
        color: "#C19A6B",
        image: "/placeholder.svg?height=300&width=300",
        category: "Relaxamento",
      },
    ],
  },
  energia: {
    slug: "energia",
    name: "Coleção Energia",
    description: "Desenvolvida para revitalizar seu espaço e despertar os sentidos, trazendo vitalidade ao seu dia.",
    longDescription:
      "A coleção Energia combina aromas cítricos e especiarias que estimulam a mente e elevam o humor. Perfeita para momentos que exigem foco, criatividade e disposição, estas velas trazem uma explosão de vitalidade para qualquer ambiente. Os tons vibrantes de laranja, amarelo e verde das velas refletem a energia que seus aromas proporcionam, criando uma experiência sensorial completa.",
    price: 269.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#FF9F5B",
    category: "Energizante",
    benefits: [
      "Estimula a concentração e foco mental",
      "Eleva o humor e combate a fadiga",
      "Ideal para ambientes de trabalho e estudo",
      "Aromas revigorantes que energizam o ambiente",
    ],
    items: [
      {
        id: "laranja-canela",
        name: "Laranja & Canela",
        description: "Aroma estimulante que combina a vivacidade cítrica com o calor da canela.",
        price: 99.9,
        weight: "300g",
        color: "#FF9F5B",
        image: "/placeholder.svg?height=300&width=300",
        category: "Energizante",
      },
      {
        id: "limao-gengibre",
        name: "Limão & Gengibre",
        description: "Combinação refrescante que energiza o ambiente e estimula a concentração.",
        price: 89.9,
        weight: "250g",
        color: "#C5E17A",
        image: "/placeholder.svg?height=300&width=300",
        category: "Energizante",
      },
      {
        id: "menta-eucalipto",
        name: "Menta & Eucalipto",
        description: "Aroma revigorante que clareia a mente e melhora a respiração.",
        price: 99.9,
        weight: "300g",
        color: "#98D8C8",
        image: "/placeholder.svg?height=300&width=300",
        category: "Energizante",
      },
    ],
  },
  elegancia: {
    slug: "elegancia",
    name: "Coleção Elegância",
    description: "Criada para ocasiões especiais e ambientes sofisticados, trazendo um toque de luxo ao seu espaço.",
    longDescription:
      "Nossa coleção Elegância apresenta aromas sofisticados como âmbar, baunilha e madeiras nobres que criam uma atmosfera de requinte e exclusividade. As velas desta coleção são perfeitas para jantares especiais, eventos importantes ou simplesmente para adicionar um toque de luxo ao seu dia a dia. Os tons dourados, marrons e profundos das velas complementam a sofisticação dos aromas, criando uma experiência verdadeiramente premium.",
    price: 289.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#D4AF37",
    category: "Premium",
    benefits: [
      "Cria uma atmosfera sofisticada e luxuosa",
      "Aromas complexos e multidimensionais",
      "Perfeita para ocasiões especiais e celebrações",
      "Apresentação premium ideal para presentes",
    ],
    items: [
      {
        id: "ambar-baunilha",
        name: "Âmbar & Baunilha",
        description: "Aroma sofisticado que combina a profundidade do âmbar com a doçura da baunilha.",
        price: 109.9,
        weight: "300g",
        color: "#D4AF37",
        image: "/placeholder.svg?height=300&width=300",
        category: "Premium",
      },
      {
        id: "cedro-bergamota",
        name: "Cedro & Bergamota",
        description: "Combinação refinada de madeiras nobres com toques cítricos sutis.",
        price: 99.9,
        weight: "250g",
        color: "#8B4513",
        image: "/placeholder.svg?height=300&width=300",
        category: "Premium",
      },
    ],
  },
  natureza: {
    slug: "natureza",
    name: "Coleção Natureza",
    description: "Inspirada nos aromas puros da natureza, trazendo a essência do ar livre para dentro de casa.",
    longDescription:
      "A coleção Natureza captura a essência dos ambientes naturais, desde florestas densas até praias ensolaradas. Cada vela foi desenvolvida para transportar você para um cenário natural diferente, permitindo que você experimente a sensação de estar ao ar livre mesmo dentro de casa. Os aromas frescos e autênticos desta coleção são perfeitos para quem busca uma conexão mais profunda com a natureza.",
    price: 229.9,
    image: "/placeholder.svg?height=600&width=600",
    color: "#228B22",
    category: "Natural",
    benefits: [
      "Traz a sensação de ambientes naturais para dentro de casa",
      "Aromas frescos e revigorantes",
      "Ajuda a reduzir o estresse e aumentar o bem-estar",
      "Perfeita para quem ama a natureza",
    ],
    items: [
      {
        id: "floresta-tropical",
        name: "Floresta Tropical",
        description: "Aroma fresco e úmido que evoca a sensação de estar em uma floresta após a chuva.",
        price: 89.9,
        weight: "250g",
        color: "#228B22",
        image: "/placeholder.svg?height=300&width=300",
        category: "Natural",
      },
      {
        id: "brisa-do-mar",
        name: "Brisa do Mar",
        description: "Combinação de aromas marinhos que trazem a sensação de estar à beira-mar.",
        price: 89.9,
        weight: "250g",
        color: "#4682B4",
        image: "/placeholder.svg?height=300&width=300",
        category: "Natural",
      },
      {
        id: "madeira-de-cedro",
        name: "Madeira de Cedro",
        description: "Aroma amadeirado profundo que evoca a sensação de estar em uma cabana na floresta.",
        price: 89.9,
        weight: "250g",
        color: "#8B4513",
        image: "/placeholder.svg?height=300&width=300",
        category: "Natural",
      },
      {
        id: "flores-silvestres",
        name: "Flores Silvestres",
        description: "Mistura de aromas florais que trazem a sensação de um campo de flores na primavera.",
        price: 89.9,
        weight: "250g",
        color: "#FF69B4",
        image: "/placeholder.svg?height=300&width=300",
        category: "Natural",
      },
    ],
  },
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = collectionsData[params.slug as keyof typeof collectionsData]

  if (!collection) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold text-[#631C21] mb-4">Coleção não encontrada</h1>
        <p className="mb-8">A coleção que você está procurando não existe ou foi removida.</p>
        <Button asChild>
          <Link href="/colecoes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Coleções
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Navegação */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
          <Link href="/colecoes" className="text-[#631C21] flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Coleções
          </Link>
        </Button>
      </div>

      {/* Detalhes da Coleção */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="relative rounded-xl overflow-hidden aspect-square bg-[#FBE1D0]/70">
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              background: `radial-gradient(circle, ${collection.color}40 0%, ${collection.color}10 70%)`,
            }}
          ></div>
          <Image
            src={collection.image || "/placeholder.svg"}
            alt={collection.name}
            width={600}
            height={600}
            className="w-full h-full object-contain p-8"
          />
          <div
            className="absolute bottom-4 left-4 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 text-sm font-medium"
            style={{ color: collection.color }}
          >
            {collection.category}
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#631C21] mb-2">{collection.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{collection.description}</p>
          <p className="mb-6">{collection.longDescription}</p>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Benefícios:</h3>
            <ul className="space-y-2">
              {collection.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-5 w-5 text-[#631C21] mr-2 shrink-0 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Preço da coleção completa</p>
              <p className="text-3xl font-bold" style={{ color: collection.color }}>
                R$ {collection.price.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-muted-foreground">
                Economize R${" "}
                {(collection.items.reduce((acc, item) => acc + item.price, 0) - collection.price)
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                comprando a coleção
              </p>
            </div>
            <AddCollectionToCart collection={collection} />
          </div>
        </div>
      </div>

      {/* Velas da Coleção */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-[#631C21] mb-8 text-center">
          Velas desta Coleção ({collection.items.length})
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
              category={item.category}
              weight={item.weight}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* Recomendações de Uso */}
      <div className="bg-[#F4847B]/10 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-[#631C21] mb-6 text-center">Como aproveitar ao máximo suas velas</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Primeira Queima</h3>
            <p>
              Na primeira vez que acender sua vela, deixe-a queimar por pelo menos 2 horas para que a cera derreta
              uniformemente até as bordas.
            </p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Aparando o Pavio</h3>
            <p>Antes de cada uso, apare o pavio para 5-7mm para garantir uma queima limpa e evitar fumaça excessiva.</p>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20">
            <h3 className="font-bold text-[#631C21] mb-2">Tempo de Queima</h3>
            <p>
              Não deixe a vela acesa por mais de 4 horas consecutivas para preservar a fragrância e garantir segurança.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#631C21] mb-4">
          Transforme seu ambiente com a {collection.name}
        </h2>
        <p className="text-lg mb-8">
          Experimente a combinação perfeita de aromas que irá transformar seu espaço e elevar seu bem-estar. Nossas
          velas artesanais são criadas com ingredientes naturais de alta qualidade para proporcionar uma experiência
          sensorial única.
        </p>
        <AddCollectionToCart collection={collection} isLarge />
      </div>
    </div>
  )
}
