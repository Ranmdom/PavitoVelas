"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProductForm({ open, onOpenChange }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
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
      if (!formData.name || !formData.price || !formData.category || !formData.stock) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }
  
      // 1. Cria o produto (simulação atual)
      const produtoCriado = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
  
      const { produtoId } = await produtoCriado.json()
  
      // 2. Faz upload da imagem, se existir
      if (formData.image && produtoId) {
        const imgForm = new FormData()
        imgForm.append("file", formData.image)
  
        await fetch(`/api/produtos/${produtoId}/fotos`, {
          method: "POST",
          body: imgForm,
        })
      }
  
      // 3. Toast de sucesso
      toast({
        title: "Produto cadastrado com sucesso",
        description: `O produto "${formData.name}" foi adicionado ao catálogo.`,
      })
  
      // Limpar
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
      setActiveTab("basic")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro ao cadastrar produto",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#631C21]">Cadastrar Novo Produto</DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            Preencha os detalhes do produto para adicioná-lo ao catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#FBE1D0]/50">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white">
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-white">
                Imagem
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="pt-4">
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
                    placeholder="Ex: Vela Pêssego & Baunilha"
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
                    placeholder="Ex: 49.90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#631C21]">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
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
                    placeholder="Ex: 20"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
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
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  className="bg-[#882335] text-white hover:bg-[#631C21]"
                  onClick={() => setActiveTab("details")}
                >
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="pt-4">
              <div className="grid gap-6 sm:grid-cols-2">
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

                <div className="space-y-2 sm:col-span-2">
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
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#F4847B]/30 text-[#631C21]"
                  onClick={() => setActiveTab("basic")}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="bg-[#882335] text-white hover:bg-[#631C21]"
                  onClick={() => setActiveTab("image")}
                >
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="pt-4">
              <div className="space-y-4">
                <Label className="text-[#631C21]">Imagem do Produto</Label>

                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#F4847B]/30 rounded-lg p-6 transition-colors hover:border-[#F4847B]/50"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-48 w-48 overflow-hidden rounded-md">
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
                      <label htmlFor="image" className="cursor-pointer">
                        <div className="rounded-md bg-[#F4847B]/10 px-4 py-2 text-sm font-medium text-[#631C21] hover:bg-[#F4847B]/20 transition-colors">
                          Selecionar arquivo
                        </div>
                        <Input
                          id="image"
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

              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#F4847B]/30 text-[#631C21]"
                  onClick={() => setActiveTab("details")}
                >
                  Voltar
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
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}

