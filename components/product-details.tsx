"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useCart } from "@/context/cart-context"

interface ProductDetailsProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    category: string
    weight: string
    color: string
    description: string
    burnTime: string
    ingredients: string
    fragrance: string
    dimensions: string
    stock: number
    rating: number
    reviews: number
    isNew: boolean
    isBestseller: boolean
    images: string[]
  }
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    } else {
      toast({
        title: "Quantidade máxima atingida",
        description: `Apenas ${product.stock} unidades disponíveis.`,
      })
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const addToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        weight: product.weight,
        color: product.color,
      },
      quantity,
    )
  }

  // const addToWishlist = () => {
  //   toast({
  //     title: "Produto adicionado à lista de desejos",
  //     description: `${product.name} foi adicionado à sua lista de desejos.`,
  //   })
  // }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      {/* Imagens do produto */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
          <Image
            src={product.images[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
          {product.isNew && <Badge className="absolute left-4 top-4 bg-[#F4847B] hover:bg-[#F4847B]">Novo</Badge>}
          {product.isBestseller && (
            <Badge className="absolute left-4 top-4 bg-[#882335] hover:bg-[#882335]">Mais Vendido</Badge>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              className={`relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                selectedImage === index ? `border-[${product.color}]` : "border-transparent"
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} - Imagem ${index + 1}`}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Detalhes do produto */}
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium text-[#631C21]/70">{product.category}</span>
            <span className="text-[#631C21]/50">•</span>
            { /*<div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                 <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "fill-[#F4847B] text-[#F4847B]" : "fill-none text-[#F4847B]/30"
                  }`}
                /> 
              ))}
              <span className="ml-2 text-sm text-[#631C21]/70">({product.reviews} avaliações)</span> 
            </div> */}
          </div>
          <h1 className="text-3xl font-bold text-[#631C21] md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-[#631C21]/80">{product.description}</p>
        </div>

        <div className="rounded-lg bg-white/60 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-3xl font-bold" style={{ color: product.color }}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-sm text-[#631C21]/70">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace(".", ",")} sem juros
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#631C21]/70">
            <Truck className="h-4 w-4" />
            <span>Frete grátis para compras acima de R$ 150,00</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm">
              <span className="text-sm text-[#631C21]/70">Peso</span>
              <p className="font-medium text-[#631C21]">{product.weight}</p>
            </div>
            <div className="rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm">
              <span className="text-sm text-[#631C21]/70">Duração</span>
              <p className="font-medium text-[#631C21]">{product.burnTime}</p>
            </div>
            <div className="rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm">
              <span className="text-sm text-[#631C21]/70">Fragrância</span>
              <p className="font-medium text-[#631C21]">{product.fragrance}</p>
            </div>
            <div className="rounded-lg bg-white/60 p-3 text-center backdrop-blur-sm">
              <span className="text-sm text-[#631C21]/70">Dimensões</span>
              <p className="font-medium text-[#631C21]">{product.dimensions}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center rounded-md border border-[#631C21]/20">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none text-[#631C21]"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex w-12 items-center justify-center">
                <span className="text-lg font-medium">{quantity}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none text-[#631C21]"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-1 gap-2">
              <Button className="flex-1 bg-[#882335] text-white hover:bg-[#631C21]" onClick={addToCart}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Adicionar ao carrinho
              </Button>
              {/* <Button
                variant="outline"
                size="icon"
                className="border-[#631C21]/20 text-[#631C21]"
                onClick={addToWishlist}
              >
                <Heart className="h-4 w-4" />
              </Button> */}
            </div>
          </div>

          <div className="text-sm text-[#631C21]/70">
            <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>
              {product.stock > 0 ? `${product.stock} unidades em estoque` : "Produto esgotado"}
            </span>
          </div>
        </div>

        <Separator className="bg-[#F4847B]/10" />

        <Tabs defaultValue="description">
          <TabsList className="bg-[#FBE1D0]/50">
            <TabsTrigger value="description" className="data-[state=active]:bg-white">
              Descrição
            </TabsTrigger>
            {/*<TabsTrigger value="ingredients" className="data-[state=active]:bg-white">
              Ingredientes
            </TabsTrigger> */}
            <TabsTrigger value="how-to-use" className="data-[state=active]:bg-white">
              Como usar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 text-[#631C21]/80">
            <p>{product.description}</p>
            <p className="mt-4">
              Nossas velas são produzidas artesanalmente em pequenos lotes para garantir a qualidade e atenção aos
              detalhes. Cada vela é única e pode apresentar pequenas variações na cor e textura, características que
              tornam nossos produtos especiais.
            </p>
          </TabsContent>
          {/*<TabsContent value="ingredients" className="mt-4 text-[#631C21]/80">
            <p>{product.ingredients}</p>
            <p className="mt-4">
              Utilizamos apenas ingredientes naturais e sustentáveis em nossas velas. A cera de soja é biodegradável e
              queima de forma mais limpa e duradoura que a parafina tradicional. Nossos óleos essenciais são
              selecionados cuidadosamente para criar fragrâncias únicas e duradouras.
            </p>
          </TabsContent>*/}
          <TabsContent value="how-to-use" className="mt-4 text-[#631C21]/80">
            <h4 className="font-medium text-[#631C21]">Para o primeiro uso:</h4>
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                Na primeira vez que acender sua vela, deixe-a queimar por pelo menos 2 horas, ou até que toda a
                superfície da cera esteja derretida.
              </li>
              <li>
                Isso evitará o "tunneling" (quando apenas o centro da vela derrete) e garantirá que sua vela queime de
                forma uniforme nas próximas utilizações.
              </li>
            </ul>

            <h4 className="mt-4 font-medium text-[#631C21]">Para usos subsequentes:</h4>
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>
                Sempre apare o pavio para 5-7mm antes de acender a vela novamente. Isso garante uma chama controlada e
                evita fumaça excessiva.
              </li>
              <li>
                Nunca deixe a vela queimando sem supervisão e mantenha longe de correntes de ar, crianças e animais de
                estimação.
              </li>
              <li>
                Para maximizar a duração da sua vela, recomendamos não deixá-la acesa por mais de 4 horas consecutivas.
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

