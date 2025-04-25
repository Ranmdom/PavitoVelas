"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from 'lucide-react'
import { useForm, Controller } from "react-hook-form"

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
import { supabase, uploadImagem, excluirImagem, obterUrlImagem } from "@/lib/supabase"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProdutoCriado?: () => void
  produtoId?: string | undefined // ID do produto para edição
}

interface Categoria {
  categoriaId: number
  nome: string
}

interface ImagemProduto {
  id: number | string; // ID da imagem (pode ser temporário para novas imagens)
  url: string; // URL para exibição
  arquivo?: File; // Arquivo para upload (apenas para novas imagens)
  caminho?: string; // Caminho no Supabase (para imagens existentes)
  nova?: boolean; // Indica se é uma nova imagem
}

interface FormData {
  nome: string;
  preco: string;
  categoriaId: string;
  descricao: string;
  fragrancia: string;
  tempoQueima: string;
  peso: string;
  altura: string;
  largura: string;
  estoque: string;
}

export default function ProductForm({
  open,
  onOpenChange,
  onProdutoCriado,
  produtoId,
}: ProductFormProps) {
  /* --------------------------- state ----------------------------------- */
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "image">("basic")
  const [imagens, setImagens] = useState<ImagemProduto[]>([])
  const [isLoadingProduto, setIsLoadingProduto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)

  /* ------------------------- react-hook-form --------------------------- */
  const { 
    control, 
    handleSubmit: hookFormSubmit, 
    setValue, 
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    defaultValues: {
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
    }
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

  /* ------------------------- carregar produto -------------------------- */
  useEffect(() => {
    if (!open || !produtoId) {
      setModoEdicao(false)
      return
    }
    
    setModoEdicao(true)
    setIsLoadingProduto(true)
    
    // Carregar dados do produto
    const carregarProduto = async () => {
      try {
        // Buscar dados do produto
        const resProduto = await fetch(`/api/produtos/${produtoId}`)
        if (!resProduto.ok) throw new Error("Não foi possível carregar o produto.")
        
        const produto = await resProduto.json()
        
        // Preencher o formulário com os dados do produto
        reset({
          nome: produto.nome || "",
          preco: produto.preco ? 
            (produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 
            "",
          categoriaId: produto.categoriaId ? String(produto.categoriaId) : "",
          descricao: produto.descricao || "",
          fragrancia: produto.fragrancia || "",
          tempoQueima: produto.tempoQueima ? String(produto.tempoQueima) : "",
          peso: produto.peso ? String(produto.peso) : "",
          altura: produto.altura ? String(produto.altura) : "",
          largura: produto.largura ? String(produto.largura) : "",
          estoque: produto.estoque ? String(produto.estoque) : "",
        })
        
        // Buscar imagens do produto
        
        
        // Mapear as imagens existentes
        const imagensProduto: ImagemProduto[] = produto.imagens.map((url: string, index: number) => ({
          id: `img_${index}`,      // Usa o índice se não tiver ID
          url,                     // O link direto da imagem
          caminho: undefined,      // Se não tiver caminho para excluir no Supabase
          nova: false
        }))

        setImagens(imagensProduto)
      } catch (err) {
        toast({
          title: "Erro ao carregar produto",
          description: err instanceof Error ? err.message : "Erro inesperado.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProduto(false)
      }
    }
    
    carregarProduto()
  }, [open, produtoId, reset])

  /* preço ---------------------------------------------------------------- */
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[\D]/g, "")
    const cents = parseInt(raw || "0", 10)
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    setValue("preco", formatted)
  }
  
  const getPrecoNumber = (precoStr: string) =>
    Number(precoStr.replace(/[^\d,.-]/g, "").replace(/,/, "."))

  /* imagens -------------------------------------------------------------- */
  const adicionarImagens = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    // Converter FileList para array e processar cada arquivo
    const novasImagens: ImagemProduto[] = Array.from(files).map(file => {
      // Criar URL temporária para preview
      const url = URL.createObjectURL(file)
      
      return {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        url,
        arquivo: file,
        nova: true
      }
    })
    
    setImagens(prev => [...prev, ...novasImagens])
  }
  
  const removerImagem = async (id: number | string) => {
    setImagens(prev => prev.filter(img => img.id !== id))
  }

  /* submit -------------------------------------------------------------- */
  const onSubmit = hookFormSubmit(async (data) => {
    const precoNumber = getPrecoNumber(data.preco);
    const estoqueNumber = parseInt(data.estoque || "0", 10);
  
    if (!data.nome.trim())
      return toast({ title: "Nome obrigatório", description: "Informe o nome do produto.", variant: "destructive" });
    if (!precoNumber || precoNumber <= 0)
      return toast({ title: "Preço inválido", description: "Informe um preço maior que zero.", variant: "destructive" });
    if (!data.categoriaId)
      return toast({ title: "Categoria obrigatória", description: "Selecione uma categoria.", variant: "destructive" });
    if (estoqueNumber < 0 || Number.isNaN(estoqueNumber))
      return toast({ title: "Estoque inválido", description: "Estoque deve ser zero ou maior.", variant: "destructive" });
  
    setIsLoading(true);
    try {
      let idProduto = produtoId;
  
      // 1. Cria o produto primeiro, se necessário:
      if (!modoEdicao) {
        const res = await fetch("/api/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: data.nome,
            preco: precoNumber,
            categoriaId: Number(data.categoriaId),
            descricao: data.descricao || null,
            fragrancia: data.fragrancia || null,
            tempoQueima: data.tempoQueima ? Number(data.tempoQueima) : null,
            peso: data.peso ? Number(data.peso.replace(/,/, ".")) : null,
            altura: data.altura ? Number(data.altura.replace(/,/, ".")) : null,
            largura: data.largura ? Number(data.largura.replace(/,/, ".")) : null,
            estoque: estoqueNumber,
            imagens: [],
          }),
        });
        if (!res.ok) throw new Error("Não foi possível cadastrar o produto.");
        const resultado = await res.json();
        idProduto = resultado.produtoId;
      }
  
      // 2. Envia imagens para o backend:
      const formData = new FormData();
      imagens.filter(img => img.nova && img.arquivo).forEach(img => {
        if (img.arquivo) {
          formData.append("imagens", img.arquivo);
        }
      });
  
      let imagensFinal: string[] = imagens.filter(img => !img.nova).map(img => img.url);
  
      if (formData.has("imagens")) {
        const resUpload = await fetch(`/api/produtos/${idProduto}/imagens`, {
          method: "POST",
          body: formData,
        });
        if (!resUpload.ok) throw new Error("Erro ao enviar imagens.");
  
        const uploaded = await resUpload.json();
        imagensFinal = [...imagensFinal, ...uploaded.urls]; // Espera que a API retorne { urls: string[] }
      }
  
      // 3. Atualiza o produto com as imagens:
      const resUpdate = await fetch(`/api/produtos/${idProduto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          preco: precoNumber,
          categoriaId: Number(data.categoriaId),
          descricao: data.descricao || null,
          fragrancia: data.fragrancia || null,
          tempoQueima: data.tempoQueima ? Number(data.tempoQueima) : null,
          peso: data.peso ? Number(data.peso.replace(/,/, ".")) : null,
          altura: data.altura ? Number(data.altura.replace(/,/, ".")) : null,
          largura: data.largura ? Number(data.largura.replace(/,/, ".")) : null,
          estoque: estoqueNumber,
          imagens: imagensFinal,
        }),
      });
  
      if (!resUpdate.ok) throw new Error("Erro ao atualizar produto.");
  
      toast({
        title: modoEdicao ? "Produto atualizado!" : "Produto cadastrado!",
        description: `"${data.nome}" foi ${modoEdicao ? "atualizado" : "adicionado"} ao catálogo.`,
      });
  
      onProdutoCriado?.();
      reset();
      setImagens([]);
      setActiveTab("basic");
      onOpenChange(false);
    } catch (err) {
      toast({
        title: modoEdicao ? "Erro ao atualizar produto" : "Erro ao cadastrar produto",
        description: err instanceof Error ? err.message : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  });
  
  
  

  /* ------------------------------- UI --------------------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>{modoEdicao ? "Editar Produto" : "Cadastrar Novo Produto"}</DialogTitle>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        aria-describedby={modoEdicao 
          ? "edit-product-description" 
          : "add-product-description"}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-[#631C21]">
        {modoEdicao ? "Editar Produto" : "Cadastrar Novo Produto"}
          </DialogTitle>
          <DialogDescription
        id={modoEdicao 
          ? "edit-product-description" 
          : "add-product-description"}
        className="text-[#631C21]/70"
          >
        {modoEdicao 
          ? "Atualize as informações do produto no catálogo." 
          : "Preencha os detalhes para adicionar o produto ao catálogo."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingProduto ? (
          <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#631C21]" />
        <span className="ml-2 text-[#631C21]">Carregando produto...</span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
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
          Imagens
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
            <Controller
              name="nome"
              control={control}
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
            <Input
              id="nome"
              {...field}
              placeholder="Vela Baunilha"
              className="border-[#F4847B]/30"
              required
            />
              )}
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* preco */}
          <div className="space-y-2">
            <Label htmlFor="preco" className="text-[#631C21]">
              Preço (R$) <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="preco"
              control={control}
              rules={{ required: "Preço é obrigatório" }}
              render={({ field }) => (
            <Input
              id="preco"
              {...field}
              onChange={handlePriceInput}
              inputMode="decimal"
              placeholder="R$ 49,90"
              className="border-[#F4847B]/30"
              required
            />
              )}
            />
            {errors.preco && (
              <p className="text-xs text-red-500">{errors.preco.message}</p>
            )}
          </div>

          {/* categoria */}
          <div className="space-y-2">
            <Label className="text-[#631C21]">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="categoriaId"
              control={control}
              rules={{ required: "Categoria é obrigatória" }}
              render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
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
              )}
            />
            {errors.categoriaId && (
              <p className="text-xs text-red-500">{errors.categoriaId.message}</p>
            )}
          </div>

          {/* estoque */}
          <div className="space-y-2">
            <Label htmlFor="estoque" className="text-[#631C21]">
              Estoque <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="estoque"
              control={control}
              rules={{ 
            required: "Estoque é obrigatório",
            min: { value: 0, message: "Estoque deve ser zero ou maior" }
              }}
              render={({ field }) => (
            <Input
              id="estoque"
              type="number"
              min={0}
              {...field}
              placeholder="20"
              className="border-[#F4847B]/30"
              required
            />
              )}
            />
            {errors.estoque && (
              <p className="text-xs text-red-500">{errors.estoque.message}</p>
            )}
          </div>

          {/* descricao */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="descricao" className="text-[#631C21]">
              Descrição
            </Label>
            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
            <Textarea
              id="descricao"
              {...field}
              placeholder="Descreva o produto..."
              className="min-h-[100px] border-[#F4847B]/30"
            />
              )}
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
            <Controller
              name="fragrancia"
              control={control}
              render={({ field }) => (
            <Input
              id="fragrancia"
              {...field}
              placeholder="Baunilha"
              className="border-[#F4847B]/30"
            />
              )}
            />
          </div>

          {/* tempoQueima */}
          <div className="space-y-2">
            <Label htmlFor="tempoQueima" className="text-[#631C21]">
              Tempo de Queima (h)
            </Label>
            <Controller
              name="tempoQueima"
              control={control}
              render={({ field }) => (
            <Input
              id="tempoQueima"
              type="number"
              min={0}
              {...field}
              placeholder="40"
              className="border-[#F4847B]/30"
            />
              )}
            />
          </div>

          {/* peso */}
          <div className="space-y-2">
            <Label htmlFor="peso" className="text-[#631C21]">
              Peso (g)
            </Label>
            <Controller
              name="peso"
              control={control}
              render={({ field }) => (
            <Input
              id="peso"
              inputMode="decimal"
              {...field}
              placeholder="250"
              className="border-[#F4847B]/30"
            />
              )}
            />
          </div>

          {/* altura */}
          <div className="space-y-2">
            <Label htmlFor="altura" className="text-[#631C21]">
              Altura (cm)
            </Label>
            <Controller
              name="altura"
              control={control}
              render={({ field }) => (
            <Input
              id="altura"
              inputMode="decimal"
              {...field}
              placeholder="10"
              className="border-[#F4847B]/30"
            />
              )}
            />
          </div>

          {/* largura */}
          <div className="space-y-2">
            <Label htmlFor="largura" className="text-[#631C21]">
              Largura (cm)
            </Label>
            <Controller
              name="largura"
              control={control}
              render={({ field }) => (
            <Input
              id="largura"
              inputMode="decimal"
              {...field}
              placeholder="8"
              className="border-[#F4847B]/30"
            />
              )}
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

          {/* ------------------ aba 3: imagens --------------------------- */}
          <TabsContent value="image" className="pt-4">
            <div className="space-y-4">
          <Label className="text-[#631C21]">Imagens do Produto</Label>
          
          {/* Área de upload */}
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#F4847B]/30 p-6 transition-colors hover:border-[#F4847B]/50"
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              adicionarImagens(e.dataTransfer.files)
            }}
          >
            <div className="flex flex-col items-center text-center">
              <Upload className="mb-2 h-10 w-10 text-[#F4847B]/50" />
              <p className="mb-1 text-sm font-medium text-[#631C21]">
            Arraste e solte imagens aqui
              </p>
              <p className="mb-4 text-xs text-[#631C21]/70">ou</p>
              <label htmlFor="images" className="cursor-pointer">
            <div className="rounded-md bg-[#F4847B]/10 px-4 py-2 text-sm font-medium text-[#631C21] transition-colors hover:bg-[#F4847B]/20">
              Selecionar arquivos
            </div>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={e => adicionarImagens(e.target.files)}
              className="hidden"
            />
              </label>
              <p className="mt-2 text-xs text-[#631C21]/70">PNG, JPG ou GIF (máx. 5 MB por imagem)</p>
            </div>
          </div>
          
          {/* Visualização das imagens */}
          {imagens.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-[#631C21]">Imagens selecionadas</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {imagens.map(img => (
              <div key={img.id} className="relative group">
                <div className="relative h-32 w-full overflow-hidden rounded-md border border-[#F4847B]/30">
              <Image 
                src={img.url || "/placeholder.svg"} 
                alt="Imagem do produto" 
                fill 
                className="object-cover" 
              />
                </div>
                <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 opacity-90"
              onClick={() => removerImagem(img.id)}
                >
              <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
              </div>
            </div>
          )}
            </div>
            
            <div className="mt-6 flex justify-between">
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            {modoEdicao ? "Atualizando..." : "Salvando..."}
              </>
            ) : (
              modoEdicao ? "Atualizar Produto" : "Salvar Produto"
            )}
          </Button>
            </div>
          </TabsContent>
        </Tabs>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
