"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProdutoCriado?: () => void
}

interface Categoria {
  categoriaId: number
  nome: string
}

export default function ProductForm({
  open,
  onOpenChange,
  onProdutoCriado,
}: ProductFormProps) {
  /* --------------------------- state ----------------------------------- */
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "image">(
    "basic",
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
    categoriaId: "",
    descricao: "",
    fragrancia: "",
    tempoQueima: "",
    peso: "",
    altura: "",
    largura: "",
    estoque: "",
    image: null as File | null,
  })

  /* ------------------------- load categorias --------------------------- */
  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const res = await fetch("/api/categorias")
        if (!res.ok) throw new Error()
        const data: Categoria[] = await res.json()
        setCategorias(data)
      } catch {
        toast({
          title: "Erro ao carregar categorias",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    })()
  }, [open])

  /* ----------------------- handlers genéricos -------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelect = (value: string) =>
    setFormData(prev => ({ ...prev, categoriaId: value }))

  /* preço ---------------------------------------------------------------- */
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[\D]/g, "")
    const cents = parseInt(raw || "0", 10)
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    setFormData(prev => ({ ...prev, preco: formatted }))
  }
  const getPrecoNumber = () =>
    Number(formData.preco.replace(/[^\d,.-]/g, "").replace(/,/, "."))

  /* imagem -------------------------------------------------------------- */
  const setImage = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }))
    if (!file) return setImagePreview(null)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  /* submit -------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const precoNumber = getPrecoNumber()
    const estoqueNumber = parseInt(formData.estoque || "0", 10)

    if (!formData.nome.trim())
      return toast({
        title: "Nome obrigatório",
        description: "Informe o nome do produto.",
        variant: "destructive",
      })

    if (!precoNumber || precoNumber <= 0)
      return toast({
        title: "Preço inválido",
        description: "Informe um preço maior que zero.",
        variant: "destructive",
      })

    if (!formData.categoriaId)
      return toast({
        title: "Categoria obrigatória",
        description: "Selecione uma categoria.",
        variant: "destructive",
      })

    if (estoqueNumber < 0 || Number.isNaN(estoqueNumber))
      return toast({
        title: "Estoque inválido",
        description: "Estoque deve ser zero ou maior.",
        variant: "destructive",
      })

    setIsLoading(true)
    try {
      /* 1. cria produto -------------------------------------------------- */
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          preco: precoNumber,
          categoriaId: Number(formData.categoriaId),
          descricao: formData.descricao || null,
          fragrancia: formData.fragrancia || null,
          tempoQueima: formData.tempoQueima ? Number(formData.tempoQueima) : null,
          peso: formData.peso ? Number(formData.peso.replace(/,/, ".")) : null,
          altura: formData.altura ? Number(formData.altura.replace(/,/, ".")) : null,
          largura: formData.largura ? Number(formData.largura.replace(/,/, ".")) : null,
          estoque: estoqueNumber,
        }),
      })
      if (!res.ok) throw new Error("Não foi possível cadastrar o produto.")
      const { produtoId } = await res.json()

      /* 2. upload imagem ------------------------------------------------- */
      if (produtoId && formData.image) {
        const imgData = new FormData()
        imgData.append("file", formData.image)
        const imgRes = await fetch(`/api/produtos/${produtoId}/fotos`, {
          method: "POST",
          body: imgData,
        })
        if (!imgRes.ok) throw new Error("Imagem não pôde ser enviada.")
      }

      toast({
        title: "Produto cadastrado!",
        description: `“${formData.nome}” foi adicionado ao catálogo.`,
      })
      onProdutoCriado?.()
      /* reset ----------------------------------------------------------- */
      setFormData({
        nome: "",
        preco: "",
        categoriaId: "",
        descricao: "",
        fragrancia: "",
        tempoQueima: "",
        peso: "",
        altura: "",
        largura: "",
        estoque: "",
        image: null,
      })
      setImagePreview(null)
      setActiveTab("basic")
      onOpenChange(false)
    } catch (err) {
      toast({
        title: "Erro ao cadastrar produto",
        description: err instanceof Error ? err.message : "Erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /* ------------------------------- UI --------------------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#631C21]">
            Cadastrar Novo Produto
          </DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            Preencha os detalhes para adicionar o produto ao catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
            {/* --------------------------- tabs --------------------------- */}
            <TabsList className="grid w-full grid-cols-3 bg-[#FBE1D0]/50">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white">
                Básico
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-white">
                Imagem
              </TabsTrigger>
            </TabsList>

            {/* ------------------ aba 1: básico --------------------------- */}
            <TabsContent value="basic" className="pt-4">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-[#631C21]">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Vela Baunilha"
                    className="border-[#F4847B]/30"
                    required
                  />
                </div>

                {/* preco */}
                <div className="space-y-2">
                  <Label htmlFor="preco" className="text-[#631C21]">
                    Preço (R$) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="preco"
                    name="preco"
                    value={formData.preco}
                    onChange={handlePriceInput}
                    inputMode="decimal"
                    placeholder="R$ 49,90"
                    className="border-[#F4847B]/30"
                    required
                  />
                </div>

                {/* categoria */}
                <div className="space-y-2">
                  <Label className="text-[#631C21]">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.categoriaId} onValueChange={handleSelect}>
                    <SelectTrigger className="border-[#F4847B]/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.categoriaId} value={String(cat.categoriaId)}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* estoque */}
                <div className="space-y-2">
                  <Label htmlFor="estoque" className="text-[#631C21]">
                    Estoque <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estoque"
                    name="estoque"
                    type="number"
                    min={0}
                    value={formData.estoque}
                    onChange={handleChange}
                    placeholder="20"
                    className="border-[#F4847B]/30"
                    required
                  />
                </div>

                {/* descricao */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descricao" className="text-[#631C21]">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descreva o produto..."
                    className="min-h-[100px] border-[#F4847B]/30"
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

            {/* ------------------ aba 2: detalhes -------------------------- */}
            <TabsContent value="details" className="pt-4">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* fragrancia */}
                <div className="space-y-2">
                  <Label htmlFor="fragrancia" className="text-[#631C21]">
                    Fragrância
                  </Label>
                  <Input
                    id="fragrancia"
                    name="fragrancia"
                    value={formData.fragrancia}
                    onChange={handleChange}
                    placeholder="Baunilha"
                    className="border-[#F4847B]/30"
                  />
                </div>

                {/* tempoQueima */}
                <div className="space-y-2">
                  <Label htmlFor="tempoQueima" className="text-[#631C21]">
                    Tempo de Queima (h)
                  </Label>
                  <Input
                    id="tempoQueima"
                    name="tempoQueima"
                    type="number"
                    min={0}
                    value={formData.tempoQueima}
                    onChange={handleChange}
                    placeholder="40"
                    className="border-[#F4847B]/30"
                  />
                </div>

                {/* peso */}
                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-[#631C21]">
                    Peso (g)
                  </Label>
                  <Input
                    id="peso"
                    name="peso"
                    inputMode="decimal"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="250"
                    className="border-[#F4847B]/30"
                  />
                </div>

                {/* altura */}
                <div className="space-y-2">
                  <Label htmlFor="altura" className="text-[#631C21]">
                    Altura (cm)
                  </Label>
                  <Input
                    id="altura"
                    name="altura"
                    inputMode="decimal"
                    value={formData.altura}
                    onChange={handleChange}
                    placeholder="10"
                    className="border-[#F4847B]/30"
                  />
                </div>

                {/* largura */}
                <div className="space-y-2">
                  <Label htmlFor="largura" className="text-[#631C21]">
                    Largura (cm)
                  </Label>
                  <Input
                    id="largura"
                    name="largura"
                    inputMode="decimal"
                    value={formData.largura}
                    onChange={handleChange}
                    placeholder="8"
                    className="border-[#F4847B]/30"
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

            {/* ------------------ aba 3: imagem --------------------------- */}
            <TabsContent value="image" className="pt-4">
              <div className="space-y-4">
                <Label className="text-[#631C21]">Imagem do Produto</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#F4847B]/30 p-6 transition-colors hover:border-[#F4847B]/50"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0]
                    if (file && file.type.startsWith("image/")) setImage(file)
                  }}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-48 w-48 overflow-hidden rounded-md">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="mb-2 h-10 w-10 text-[#F4847B]/50" />
                      <p className="mb-1 text-sm font-medium text-[#631C21]">
                        Arraste e solte uma imagem aqui
                      </p>
                      <p className="mb-4 text-xs text-[#631C21]/70">ou</p>
                      <label htmlFor="image" className="cursor-pointer">
                        <div className="rounded-md bg-[#F4847B]/10 px-4 py-2 text-sm font-medium text-[#631C21] transition-colors hover:bg-[#F4847B]/20">
                          Selecionar arquivo
                        </div>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={e => setImage(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-xs text-[#631C21]/70">PNG, JPG ou GIF (máx. 5 MB)</p>
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
                <Button
                  type="submit"
                  className="bg-[#882335] text-white hover:bg-[#631C21]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
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
