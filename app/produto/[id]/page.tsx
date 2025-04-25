import type { Metadata } from "next"
import ProductDetails from "@/components/product-details"
import RelatedProducts from "@/components/related-products"
// Simulação de busca de produto pelo ID

interface Product {
  produtoId: string
  nome: string
  preco: number
  fragrancia?: string
  tempoQueima?: number
  descricao?: string
  peso?: number
  altura?: number
  largura?: number
  estoque?: number
  categoriaNome?: string
  imagens: string[]
}

// 🟢 Função para buscar o produto na API
async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/produtos/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) {
      return null
    }
    return await res.json()
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
}


// 🟠 Metadata puxando da API
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id)

  if (!product) {
    return {
      title: "Produto não encontrado | Pavito Velas",
      description: "O produto que você está procurando não foi encontrado.",
    }
  }

  return {
    title: `${product.nome} | Pavito Velas`,
    description: product.descricao || "Produto artesanal da Pavito Velas.",
  }
}

// 🟣 Página do produto
export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id)

    if (!product) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-[#631C21]">Produto não encontrado</h1>
          <p className="mt-4 text-[#631C21]/70">O produto que você está procurando não está disponível.</p>
        </div>
      )
    }

  const dimensions =
    product.altura && product.largura ? `${product.altura}cm x ${product.largura}cm` : "Dimensões não informadas"

  return (
    <div className="min-h-screen bg-[#FBE1D0]/30">
      <div className="container mx-auto px-4 py-8">
      <ProductDetails
          product={{
            id: String(product.produtoId),
            name: product.nome,
            price: Number(product.preco),
            image: product.imagens[0] || "/placeholder.svg",
            images: product.imagens,
            category: product.categoriaNome || "Categoria não cadastrada",
            weight: product.peso ? `${product.peso}g` : "Sem peso",
            description: product.descricao || "Sem descrição",
            burnTime: product.tempoQueima ? `${product.tempoQueima} horas` : "Não informado",
            ingredients: "Não informado", // ← não tem esse campo no banco, pode adicionar se quiser
            fragrance: product.fragrancia || "Não informado",
            dimensions: dimensions,
            stock: product.estoque ?? 0,
            rating: 5, // placeholder, se quiser posso te ajudar a implementar
            reviews: 0, // idem
            isNew: false, // pode adicionar no banco depois se quiser controlar isso
            isBestseller: false, // idem
            color: "#F4847B", // cor fixa ou lógica que você quiser
          }}
        />

        <div className="mt-20">
          <h2 className="mb-6 text-2xl font-bold text-[#631C21]">Produtos relacionados</h2>
          <RelatedProducts currentProductId={product.produtoId} category={product.categoriaNome || "Categoria não cadastrada"} />
        </div>
      </div>
    </div>
  )
}

