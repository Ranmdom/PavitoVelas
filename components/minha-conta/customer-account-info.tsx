"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react";

import { toast } from "@/hooks/use-toast"

export default function CustomerAccountInfo() {
  const { data: session } = useSession()
  const user = session?.user ?? null
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email:  "",
    celular: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        nome: session.user.nome || "",
        email: session.user.email || "",
        celular: formatPhone(session.user.celular || ""),
      }))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    const formattedValue = name === "celular" ? formatPhone(value) : value

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`/api/usuarios/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          celular: formData.celular,
        }),
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar usuário.')
      }

      toast({
        title: "Informações atualizadas",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove tudo que não for dígito
      .replace(/^(\d{2})(\d)/, "($1) $2") // Coloca parênteses nos dois primeiros dígitos
      .replace(/(\d{5})(\d)/, "$1-$2") // Adiciona o traço depois do quinto dígito
      .slice(0, 15) // Limita o tamanho total
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro ao atualizar senha",
        description: "As senhas não coincidem. Por favor, tente novamente.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/usuarios/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (!res.ok) throw new Error()

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      })

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-8">
      <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
        <h3 className="text-lg font-medium text-[#631C21]">Informações Pessoais</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="border-[#F4847B]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="border-[#F4847B]/30"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Telefone</Label>
            <Input
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="border-[#F4847B]/30"
            />
          </div>
        </div>

        <Button type="submit" className="bg-[#882335] text-white hover:bg-[#631C21]" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </form>

      <Separator className="bg-[#F4847B]/20" />

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="text-lg font-medium text-[#631C21]">Alterar Senha</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              className="border-[#F4847B]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className="border-[#F4847B]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border-[#F4847B]/30"
            />
          </div>
        </div>

        <Button type="submit" className="bg-[#882335] text-white hover:bg-[#631C21]" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            "Atualizar Senha"
          )}
        </Button>
      </form>
    </div>
  )
}

