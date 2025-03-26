"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

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
}

export default function CategoryForm({ open, onOpenChange }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, image: file }))

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.name) {
        throw new Error("Por favor, informe o nome da categoria.")
      }

      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Categoria cadastrada com sucesso",
        description: `A categoria "${formData.name}" foi adicionada ao catálogo.`,
      })

      // Resetar formulário
      setFormData({
        name: "",
        description: "",
        image: null,
      })
      setImagePreview(null)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro ao cadastrar categoria",
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
          <DialogTitle className="text-xl text-[#631C21]">Cadastrar Nova Categoria</DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            Adicione uma nova categoria para organizar seus produtos.
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
                name="name"
                value={formData.name}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px] border-[#F4847B]/30"
                placeholder="Descreva a categoria..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#631C21]">Imagem da Categoria</Label>

            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-[#F4847B]/30 rounded-lg p-6 transition-colors hover:border-[#F4847B]/50"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-40 w-40 overflow-hidden rounded-md">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData((prev) => ({ ...prev, image: null }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="mb-2 h-10 w-10 text-[#F4847B]/50" />
                  <p className="mb-1 text-sm font-medium text-[#631C21]">Arraste e solte uma imagem aqui</p>
                  <p className="text-xs text-[#631C21]/70 mb-4">ou</p>
                  <label htmlFor="category-image" className="cursor-pointer">
                    <div className="rounded-md bg-[#F4847B]/10 px-4 py-2 text-sm font-medium text-[#631C21] hover:bg-[#F4847B]/20 transition-colors">
                      Selecionar arquivo
                    </div>
                    <Input
                      id="category-image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#631C21]/70">PNG, JPG ou GIF (máx. 5MB)</p>
                </div>
              )}
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
            <Button type="submit" className="bg-[#882335] text-white hover:bg-[#631C21]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Categoria"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

