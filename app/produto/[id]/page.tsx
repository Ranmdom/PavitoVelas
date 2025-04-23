import type { Metadata } from "next"
import ProductDetails from "@/components/product-details"
import RelatedProducts from "@/components/related-products"

// Simulação de busca de produto pelo ID
const getProductById = (id: string) => {
  // Dados simulados - em um ambiente real, isso viria de um banco de dados ou API
  const products = [
    {
      id: "1",
      name: "Vela Pêssego & Baunilha",
      price: 49.9,
      image: "/templates/vela-1.jpeg?height=600&width=600",
      category: "Frutal",
      weight: "250g",
      color: "#F4847B",
      description:
        "Uma combinação perfeita de pêssego suculento e baunilha cremosa, criando um aroma doce e aconchegante que transforma qualquer ambiente em um espaço acolhedor e relaxante.",
      burnTime: "45 horas",
      ingredients: "Cera de soja, óleos essenciais de pêssego e baunilha, pavio de algodão",
      fragrance: "Pêssego & Baunilha",
      dimensions: "10cm x 8cm",
      stock: 15,
      rating: 4.8,
      reviews: 24,
      isNew: false,
      isBestseller: true,
      images: [
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
      ],
    },
    {
      id: "2",
      name: "Vela Lavanda & Bergamota",
      price: 54.9,
      image: "/templates/vela-1.jpeg?height=600&width=600",
      category: "Floral",
      weight: "250g",
      color: "#CD4E65",
      description:
        "Uma fragrância relaxante que combina a lavanda calmante com notas cítricas de bergamota, criando um aroma equilibrado perfeito para momentos de relaxamento e meditação.",
      burnTime: "50 horas",
      ingredients: "Cera de soja, óleos essenciais de lavanda e bergamota, pavio de algodão",
      fragrance: "Lavanda & Bergamota",
      dimensions: "10cm x 8cm",
      stock: 8,
      rating: 4.9,
      reviews: 32,
      isNew: true,
      isBestseller: false,
      images: [
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
      ],
    },
    {
      id: "3",
      name: "Vela Madeira & Âmbar",
      price: 59.9,
      image: "/templates/vela-1.jpeg?height=600&width=600",
      category: "Amadeirado",
      weight: "300g",
      color: "#882335",
      description:
        "Uma fragrância sofisticada que combina notas quentes de madeira com o aroma rico e profundo do âmbar, criando uma atmosfera elegante e aconchegante em qualquer ambiente.",
      burnTime: "55 horas",
      ingredients: "Cera de soja, óleos essenciais de madeira de cedro e âmbar, pavio de algodão",
      fragrance: "Madeira & Âmbar",
      dimensions: "12cm x 9cm",
      stock: 12,
      rating: 4.7,
      reviews: 18,
      isNew: false,
      isBestseller: true,
      images: [
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
      ],
    },
    {
      id: "4",
      name: "Vela Vanilla & Canela",
      price: 49.9,
      image: "/templates/vela-1.jpeg?height=600&width=600",
      category: "Especiarias",
      weight: "250g",
      color: "#D36A6A",
      description:
        "Uma combinação clássica e reconfortante de baunilha doce e canela picante, perfeita para criar um ambiente acolhedor e convidativo em sua casa.",
      burnTime: "45 horas",
      ingredients: "Cera de soja, óleos essenciais de baunilha e canela, pavio de algodão",
      fragrance: "Vanilla & Canela",
      dimensions: "10cm x 8cm",
      stock: 20,
      rating: 4.6,
      reviews: 15,
      isNew: false,
      isBestseller: false,
      images: [
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
        "/templates/vela-1.jpeg?height=600&width=600",
      ],
    },
  ]

  return products.find((product) => product.id === id)
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = getProductById(params.id)

  if (!product) {
    return {
      title: "Produto não encontrado | Pavito Velas",
      description: "O produto que você está procurando não foi encontrado.",
    }
  }

  return {
    title: `${product.name} | Pavito Velas`,
    description: product.description,
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#631C21]">Produto não encontrado</h1>
        <p className="mt-4 text-[#631C21]/70">O produto que você está procurando não está disponível.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBE1D0]/30">
      <div className="container mx-auto px-4 py-8">
        <ProductDetails product={product} />

        <div className="mt-20">
          <h2 className="mb-6 text-2xl font-bold text-[#631C21]">Produtos relacionados</h2>
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </div>
    </div>
  )
}

