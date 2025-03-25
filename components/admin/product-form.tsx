"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductForm({ open, onOpenChange }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    weight: "",
    fragrance: "",
    burnTime: "",
    stock: "",
    dimensions: "",
    ingredients: "",
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.name || !formData.price || !formData.category || !formData.stock) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Produto cadastrado com sucesso",
        description: `O produto "${formData.name}" foi adicionado ao catálogo.`,
      })

      // Resetar formulário
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        weight: "",
        fragrance: "",
        burnTime: "",
        stock: "",
        dimensions: "",
        ingredients: "",
        image: null,
      })
      setImagePreview(null)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro ao cadastrar produto",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#631C21]">Cadastrar Novo Produto</DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            Preencha os detalhes do produto para adicioná-lo ao catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#631C21]">
                Nome do Produto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-[#631C21]">
                Preço (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#631C21]">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value : any) => handleSelectChange("category", value)}>
                <SelectTrigger className="border-[#F4847B]/30">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frutal">Frutal</SelectItem>
                  <SelectItem value="Floral">Floral</SelectItem>
                  <SelectItem value="Amadeirado">Amadeirado</SelectItem>
                  <SelectItem value="Especiarias">Especiarias</SelectItem>
                  <SelectItem value="Cítrico">Cítrico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fragrance" className="text-[#631C21]">
                Fragrância
              </Label>
              <Input
                id="fragrance"
                name="fragrance"
                value={formData.fragrance}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                placeholder="Ex: Pêssego & Baunilha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="text-[#631C21]">
                Peso
              </Label>
              <Input
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                placeholder="Ex: 250g"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-[#631C21]">
                Estoque <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnTime" className="text-[#631C21]">
                Tempo de Queima
              </Label>
              <Input
                id="burnTime"
                name="burnTime"
                value={formData.burnTime}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                placeholder="Ex: 45 horas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-[#631C21]">
                Dimensões
              </Label>
              <Input
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="border-[#F4847B]/30"
                placeholder="Ex: 10cm x 8cm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#631C21]">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px] border-[#F4847B]/30"
              placeholder="Descreva o produto..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-[#631C21]">
              Ingredientes
            </Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              className="min-h-[80px] border-[#F4847B]/30"
              placeholder="Liste os ingredientes..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-[#631C21]">
              Imagem do Produto
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border-[#F4847B]/30"
              />
              {imagePreview && (
                <div className="relative h-16 w-16">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData((prev) => ({ ...prev, image: null }))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
                "Salvar Produto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

