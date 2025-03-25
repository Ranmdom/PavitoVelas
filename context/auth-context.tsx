"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type UserRole = "admin" | "customer" | null
type UserData = {
  id: string
  name: string
  email: string
  role: UserRole
} | null

interface AuthContextType {
  user: UserData
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("pavito-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("pavito-user")
      }
    }
    setIsLoading(false)
  }, [])

  // Função de login simulada
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true)

    // Simulação de verificação de credenciais
    // Em um ambiente real, isso seria uma chamada de API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulação de credenciais para admin
        if (role === "admin" && email === "admin@pavitovelas.com" && password === "admin123") {
          const adminUser = {
            id: "1",
            name: "Admin Velas",
            email: "admin@pavitovelas.com",
            role: "admin" as UserRole,
          }
          setUser(adminUser)
          localStorage.setItem("pavito-user", JSON.stringify(adminUser))
          setIsLoading(false)
          resolve(true)
          return
        }

        // Simulação de credenciais para cliente
        if (role === "customer" && email.includes("@") && password.length >= 6) {
          const customerUser = {
            id: "2",
            name: email.split("@")[0],
            email: email,
            role: "customer" as UserRole,
          }
          setUser(customerUser)
          localStorage.setItem("pavito-user", JSON.stringify(customerUser))
          setIsLoading(false)
          resolve(true)
          return
        }

        setIsLoading(false)
        resolve(false)
      }, 1000) // Simulação de delay de rede
    })
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("pavito-user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

