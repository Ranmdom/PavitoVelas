"use client"
// auth-context.tsx
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type UserRole = "admin" | "cliente" | null
type UserData = {
  id: number
  nome: string
  sobrenome: string
  email: string
  tipo: UserRole
} | null

interface AuthContextType {
  user: UserData
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedToken = localStorage.getItem("pavito-token")
    const storedUser = localStorage.getItem("pavito-user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("pavito-user")
        localStorage.removeItem("pavito-token")
      }
    }
    setIsLoading(false)
  }, [])

  // Função de login com API real
  const login = async (email: string, senha: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login")
      }

      // Salvar token e dados do usuário
      setToken(data.token)
      setUser(data.usuario)

      localStorage.setItem("pavito-token", data.token)
      localStorage.setItem("pavito-user", JSON.stringify(data.usuario))

      return true
    } catch (error) {
      console.error("Erro de login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("pavito-user")
    localStorage.removeItem("pavito-token")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

