"use client"

import { useState, useEffect } from "react"

interface Categoria {
  categoriaId: string
  nome: string
}

export function useCategories() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Implementar cache para evitar múltiplas requisições
        const cachedData = sessionStorage.getItem("categorias")
        if (cachedData) {
          setCategorias(JSON.parse(cachedData))
          setIsLoading(false)

          // Atualizar em segundo plano
          fetchFromAPI()
          return
        }

        await fetchFromAPI()
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
        setError(error instanceof Error ? error : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    const fetchFromAPI = async () => {
      const response = await fetch("/api/categorias")

      if (!response.ok) {
        throw new Error("Falha ao buscar categorias")
      }

      const data = await response.json()
      setCategorias(data)

      // Armazenar no cache
      sessionStorage.setItem("categorias", JSON.stringify(data))
    }

    fetchCategorias()
  }, [])

  return { categorias, isLoading, error }
}
