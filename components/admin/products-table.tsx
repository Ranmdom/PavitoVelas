"use client"

import { useState } from "react"
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
import Image from "next/image"

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
import { Badge } from "@/components/ui/badge"

// Tipo para os dados do produto
type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  fragrance: string
  weight: string
  createdAt: string
  image: string
}

// Dados de exemplo
const data: Product[] = [
  {
    id: "1",
    name: "Vela Pêssego & Baunilha",
    category: "Frutal",
    price: 49.9,
    stock: 15,
    fragrance: "Pêssego & Baunilha",
    weight: "250g",
    createdAt: "2023-04-10",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Vela Lavanda & Bergamota",
    category: "Floral",
    price: 54.9,
    stock: 8,
    fragrance: "Lavanda & Bergamota",
    weight: "250g",
    createdAt: "2023-04-12",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Vela Madeira & Âmbar",
    category: "Amadeirado",
    price: 59.9,
    stock: 12,
    fragrance: "Madeira & Âmbar",
    weight: "300g",
    createdAt: "2023-04-15",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Vela Vanilla & Canela",
    category: "Especiarias",
    price: 49.9,
    stock: 20,
    fragrance: "Vanilla & Canela",
    weight: "250g",
    createdAt: "2023-04-18",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Vela Limão & Manjericão",
    category: "Cítrico",
    price: 45.9,
    stock: 5,
    fragrance: "Limão & Manjericão",
    weight: "200g",
    createdAt: "2023-04-20",
    image: "/placeholder.svg?height=40&width=40",
  },
]

// Definição das colunas
const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value : any) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value : any) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <div className="relative h-10 w-10 overflow-hidden rounded-md">
        <Image
          src={row.getValue("image") || "/placeholder.svg"}
          alt={row.getValue("name")}
          fill
          className="object-cover"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-sm text-[#631C21]/70">ID: {row.original.id}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-[#F4847B]/10 text-[#631C21]">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "fragrance",
    header: "Fragrância",
    cell: ({ row }) => <div>{row.getValue("fragrance")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Preço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = Number.parseInt(row.getValue("stock"))
      return (
        <div className={`font-medium ${stock <= 5 ? "text-red-600" : stock <= 10 ? "text-yellow-600" : ""}`}>
          {stock}
        </div>
      )
    },
  },
  {
    accessorKey: "weight",
    header: "Peso",
    cell: ({ row }) => <div>{row.getValue("weight")}</div>,
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
      const product = row.original
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar produto</DropdownMenuItem>
            <DropdownMenuItem>Gerenciar estoque</DropdownMenuItem>
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Excluir produto</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function ProductsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar produtos..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm border-[#F4847B]/30"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto border-[#F4847B]/30">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="capitalize"
                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      className="mr-2"
                      aria-label={`Mostrar coluna ${column.id}`}
                    />
                    {column.id === "name"
                      ? "Nome"
                      : column.id === "category"
                        ? "Categoria"
                        : column.id === "fragrance"
                          ? "Fragrância"
                          : column.id === "price"
                            ? "Preço"
                            : column.id === "stock"
                              ? "Estoque"
                              : column.id === "weight"
                                ? "Peso"
                                : column.id === "createdAt"
                                  ? "Criado em"
                                  : column.id}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border border-[#F4847B]/20">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
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

