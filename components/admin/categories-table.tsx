"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

export type Category = {
  categoriaId: string
  nome: string
  descricao: string
  productCount: number
  createdAt: string
}

interface CategoriesTableProps {
  onEditCategory: (category: Category) => void
}

export default function CategoriesTable({ onEditCategory }: CategoriesTableProps) {
  const [data, setData] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  // Função para buscar categorias na API
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categorias")
      const json = await res.json()
      const categories: Category[] = json.map((cat: any) => ({
        categoriaId: cat.categoriaId.toString(),
        nome: cat.nome,
        descricao: cat.descricao || "",
        productCount: cat.produtos ? cat.produtos.length : 0,
        createdAt: cat.createdAt,
      }))
      setData(categories)
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Função para excluir categoria
  const handleDelete = async (category: Category) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.nome}"?`)) {
      try {
        const res = await fetch(`/api/categorias/${category.categoriaId}`, {
          method: "DELETE",
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || "Erro ao excluir categoria.")
        }
        toast({
          title: "Categoria excluída",
          description: `A categoria "${category.nome}" foi excluída.`,
        })
        fetchCategories()
      } catch (error) {
        toast({
          title: "Erro ao excluir categoria",
          description: error instanceof Error ? error.message : "Ocorreu um erro.",
          variant: "destructive",
        })
      }
    }
  }

  // Definição das colunas da tabela
  const columns: ColumnDef<Category>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("nome")}</div>
          <div className="text-sm text-[#631C21]/70">ID: {row.original.categoriaId}</div>
        </div>
      ),
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => <div>{row.getValue("descricao")}</div>,
    },
    {
      accessorKey: "productCount",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Produtos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue("productCount")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div>{date.toLocaleDateString("pt-BR")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.categoriaId)}>
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                Editar categoria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(category)}>
                Excluir categoria
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  if (isLoading) {
    return <div>Carregando categorias...</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar categorias..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nome")?.setFilterValue(event.target.value)}
          className="max-w-sm border-[#F4847B]/30"
        />
      </div>
      <div className="rounded-md border border-[#F4847B]/20">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s)
          selecionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-[#F4847B]/30"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-[#F4847B]/30"
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
