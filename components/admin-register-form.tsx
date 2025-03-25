"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminRegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    codigoAdmin: "", // Código especial para cadastro de admin
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações básicas
    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.senha || !formData.codigoAdmin) {
      setError("Todos os campos são obrigatórios.")
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.")
      return
    }

    if (formData.senha.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres para administradores.")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/register/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          email: formData.email,
          senha: formData.senha,
          codigoAdmin: formData.codigoAdmin,
          tipo: "admin",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar administrador.")
      }

      // Redireciona para login de admin após cadastro bem-sucedido
      router.push("/admin/login?cadastro=sucesso")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao cadastrar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-[#631C21]">
            Nome
          </Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome"
            value={formData.nome}
            onChange={handleChange}
            className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sobrenome" className="text-[#631C21]">
            Sobrenome
          </Label>
          <Input
            id="sobrenome"
            name="sobrenome"
            placeholder="Seu sobrenome"
            value={formData.sobrenome}
            onChange={handleChange}
            className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#631C21]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha" className="text-[#631C21]">
          Senha
        </Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          placeholder="Crie uma senha segura"
          value={formData.senha}
          onChange={handleChange}
          className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmarSenha" className="text-[#631C21]">
          Confirmar Senha
        </Label>
        <Input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          placeholder="Confirme sua senha"
          value={formData.confirmarSenha}
          onChange={handleChange}
          className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#882335]" />
          <Label htmlFor="codigoAdmin" className="text-[#631C21]">
            Código de Administrador
          </Label>
        </div>
        <Input
          id="codigoAdmin"
          name="codigoAdmin"
          type="password"
          placeholder="Insira o código de administrador"
          value={formData.codigoAdmin}
          onChange={handleChange}
          className="border-[#F4847B]/30 focus-visible:ring-[#882335]"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-[#882335] hover:bg-[#631C21] text-white" disabled={isLoading}>
        {isLoading ? "Cadastrando..." : "Cadastrar Administrador"}
      </Button>
    </form>
  )
}

