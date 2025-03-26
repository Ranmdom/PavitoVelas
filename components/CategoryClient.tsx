"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CategoriesTable from "@/components/admin/categories-table"
import CategoryForm from "@/components/admin/category-form"

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Categorias</h1>
        <Button className="bg-[#882335] text-white hover:bg-[#631C21]" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesTable />

      <CategoryForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}

