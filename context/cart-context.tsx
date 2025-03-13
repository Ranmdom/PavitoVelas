"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  weight: string
  color: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Carregar carrinho do localStorage quando o componente montar
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem("pavito-cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        localStorage.removeItem("pavito-cart")
      }
    }
  }, [])

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("pavito-cart", JSON.stringify(items))
    }
  }, [items, mounted])

  // Adicionar item ao carrinho
  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex((i) => i.id === item.id)

      if (existingItemIndex > -1) {
        // Item já existe, atualizar quantidade
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }

        toast({
          title: "Carrinho atualizado",
          description: `Quantidade de ${item.name} atualizada para ${updatedItems[existingItemIndex].quantity}.`,
        })

        return updatedItems
      } else {
        // Novo item, adicionar ao carrinho
        toast({
          title: "Item adicionado",
          description: `${item.name} foi adicionado ao seu carrinho.`,
        })

        return [...currentItems, { ...item, quantity }]
      }
    })
  }

  // Remover item do carrinho
  const removeItem = (id: string) => {
    setItems((currentItems) => {
      const item = currentItems.find((i) => i.id === id)

      if (item) {
        toast({
          title: "Item removido",
          description: `${item.name} foi removido do seu carrinho.`,
        })
      }

      return currentItems.filter((item) => item.id !== id)
    })
  }

  // Atualizar quantidade de um item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setItems((currentItems) => {
      return currentItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity }
        }
        return item
      })
    })
  }

  // Limpar carrinho
  const clearCart = () => {
    setItems([])
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do seu carrinho.",
    })
  }

  // Calcular número total de itens
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Calcular subtotal
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

