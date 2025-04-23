"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"

interface CollectionItem {
  id: string
  name: string
  price: number
  image: string
  weight: string
  color: string
  category: string
}

interface CollectionCardProps {
  slug: string
  name: string
  description: string
  price: number
  image: string
  color: string
  category: string
  items: CollectionItem[]
}

export default function CollectionCard({
  slug,
  name,
  description,
  price,
  image,
  color,
  category,
  items,
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const { addItem } = useCart()

  // Criar um array de imagens para o carrossel (imagem principal + imagens dos itens)
  const images = [image, ...items.map((item) => item.image)]

  // Função para navegar para a próxima imagem
  const nextImage = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)

    // Resetar o estado de transição após a animação
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [images.length, isTransitioning])

  // Função para navegar para a imagem anterior
  const prevImage = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)

    // Resetar o estado de transição após a animação
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [images.length, isTransitioning])

  // Rotação automática de imagens
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Só iniciar o carrossel automático se houver mais de uma imagem
    if (images.length > 1) {
      interval = setInterval(() => {
        // Não avançar se estiver em transição ou se o usuário estiver interagindo (hover)
        if (!isTransitioning) {
          nextImage()
        }
      }, 4000) // Intervalo de 4 segundos entre cada transição
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [nextImage, images.length, isTransitioning])

  // Adicionar um useEffect separado para pausar a rotação quando o usuário estiver com hover
  useEffect(() => {
    // Este efeito não faz nada além de forçar uma re-renderização quando o hover muda
    // Isso garante que o estado isHovered seja atualizado e usado no efeito acima
  }, [isHovered])

  // Manipuladores de eventos de toque para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }

    // Resetar valores
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Manipulador de teclas para acessibilidade
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevImage()
    } else if (e.key === "ArrowRight") {
      nextImage()
    }
  }

  const handleAddCollectionToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Adicionar cada item da coleção ao carrinho
    items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        weight: item.weight,
        color: item.color,
      })
    })
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md backdrop-blur-md bg-white/40 border border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Coleção ${name} com ${items.length} velas`}
    >
      <Link href={`/colecoes/${slug}`} className="block">
        <div
          className="relative aspect-square overflow-hidden bg-[#FBE1D0]/70"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              background: `radial-gradient(circle, ${color}40 0%, ${color}10 70%)`,
            }}
          ></div>

          {/* Carrossel de imagens */}
          <div className="relative w-full h-full">
            {images.map((img, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300 ease-in-out",
                  currentImageIndex === index ? "opacity-100 z-10" : "opacity-0 z-0",
                )}
                aria-hidden={currentImageIndex !== index}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={index === 0 ? `Coleção ${name}` : `${items[index - 1]?.name || "Vela da coleção"}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-contain p-4 transition-transform duration-500",
                    isHovered ? "scale-110" : "scale-100",
                  )}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Controles de navegação */}
          {images.length > 1 && (
            <>
              {/* Botões de navegação */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                aria-label="Imagem anterior"
                tabIndex={0}
              >
                <ChevronLeft className="h-5 w-5" style={{ color }} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                aria-label="Próxima imagem"
                tabIndex={0}
              >
                <ChevronRight className="h-5 w-5" style={{ color }} />
              </button>

              {/* Indicadores de slide */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                      currentImageIndex === index ? "bg-white w-4" : "bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Ir para imagem ${index + 1} de ${images.length}`}
                    aria-current={currentImageIndex === index}
                    tabIndex={0}
                  />
                ))}
              </div>
            </>
          )}

          <div
            className="absolute bottom-2 left-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-1 text-xs font-medium z-20"
            style={{ color }}
          >
            {category}
          </div>
          <div
            className="absolute right-2 top-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-1 text-xs font-medium z-20"
            style={{ color }}
          >
            {items.length} velas
          </div>
        </div>
        <CardContent className="p-4 bg-white/60 backdrop-blur-sm">
          <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
          <p className="mt-2 text-xl font-bold" style={{ color }}>
            R$ {price.toFixed(2).replace(".", ",")}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 p-4 pt-0 bg-white/60 backdrop-blur-sm">
          <Button
            variant="outline"
            className="w-full border-[#631C21] text-[#631C21] hover:bg-[#631C21] hover:text-white"
            onClick={handleAddCollectionToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
          <Button variant="ghost" className="flex-shrink-0 text-[#631C21] hover:bg-[#631C21]/10 hover:text-[#631C21]">
            Ver
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
