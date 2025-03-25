import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CategoriesTable from "@/components/admin/categories-table"

export const metadata = {
  title: "Gerenciar Categorias | Pavito Velas",
  description: "Gerencie as categorias de produtos da loja Pavito Velas",
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#631C21]">Categorias</h1>
        <Button className="bg-[#882335] text-white hover:bg-[#631C21]">
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesTable />
    </div>
  )
}

