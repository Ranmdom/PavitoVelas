"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/hooks/use-toast"

export default function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password, "admin")

      if (success) {
        toast({
          title: "Login administrativo realizado com sucesso",
          description: "Bem-vindo(a) ao painel administrativo da Pavito Velas!",
        })
        router.push("/admin")
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Credenciais administrativas inválidas. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email">E-mail</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="admin@pavitovelas.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-[#F4847B]/30"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Senha</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-[#F4847B]/30 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-[#631C21]/70 hover:text-[#631C21]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-[#882335] text-white hover:bg-[#631C21]" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Acessar Painel"
        )}
      </Button>

      <div className="mt-4 rounded-md bg-[#F4847B]/10 p-3 text-sm text-[#631C21]/80">
        <p>
          <strong>Credenciais de demonstração:</strong>
        </p>
        <p>Email: admin@pavitovelas.com</p>
        <p>Senha: admin123</p>
      </div>
    </form>
  )
}

