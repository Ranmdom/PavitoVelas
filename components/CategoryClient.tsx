"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CategoriesTable, { Category } from "@/components/admin/categories-table"
import CategoryForm from "@/components/admin/category-form"

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<null | Category>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEditCategory = (category: Category) => {
    // Adapta os dados para o formulário (os campos do formulário são "nome" e "descricao")
    setEditingCategory({
      categoriaId: category.categoriaId,
      nome: category.nome,
      descricao: category.descricao 
    } as any)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Atualiza a tabela após sucesso (forçando um refresh)
    setRefreshKey((prev) => prev + 1)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Categorias</h1>
        <Button
          className="bg-[#882335] text-white hover:bg-[#631C21]"
          onClick={() => {
            setEditingCategory(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesTable key={refreshKey} onEditCategory={handleEditCategory} />

      <CategoryForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        initialData={editingCategory || undefined}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
