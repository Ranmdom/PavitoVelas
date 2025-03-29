"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    categoriaId: string
    nome: string
    descricao: string
  }
  onSuccess?: () => void
}

export default function CategoryForm({ open, onOpenChange, initialData, onSuccess }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        descricao: initialData.descricao,
      })
    } else {
      setFormData({
        nome: "",
        descricao: "",
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.nome) {
        throw new Error("Por favor, informe o nome da categoria.")
      }

      let response;
      if (initialData) {
        // Edição: usar PUT para atualizar
        response = await fetch(`/api/categorias/${initialData.categoriaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Criação: usar POST para criar
        response = await fetch("/api/categorias", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar categoria.")
      }

      toast({
        title: initialData ? "Categoria atualizada com sucesso" : "Categoria cadastrada com sucesso",
        description: `A categoria "${formData.nome}" foi ${initialData ? "atualizada" : "adicionada"} ao catálogo.`,
      })

      setFormData({ nome: "", descricao: "" })
      onOpenChange(false)
      onSuccess && onSuccess()
    } catch (error) {
      toast({
        title: "Erro ao salvar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#631C21]">
            {initialData ? "Editar Categoria" : "Cadastrar Nova Categoria"}
          </DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            {initialData
              ? "Atualize os dados da categoria."
              : "Adicione uma nova categoria para organizar seus produtos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-name" className="text-[#631C21]">
                Nome da Categoria <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                required
                placeholder="Ex: Frutal"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-description" className="text-[#631C21]">
                Descrição
              </Label>
              <Textarea
                id="category-description"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="min-h-[100px] border-[#F4847B]/30"
                placeholder="Descreva a categoria..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-[#F4847B]/30 text-[#631C21]"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#882335] text-white hover:bg-[#631C21]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                initialData ? "Atualizar Categoria" : "Salvar Categoria"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
