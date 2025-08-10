"use client"
import { useRouter } from "next/navigation";
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
import { useState } from "react"

// Tipo para os dados do produto, conforme o modelo Prisma "Produto"
type Product = {
  produtoId: string
  nome: string
  categoria: string  // Vem de Produto.categoria?.nome na consulta (caso exista relacionamento)
  preco: number
  fragrancia?: string
  estoque?: number
  createdAt: string
  image?: string    // Caso haja imagem, ou usar um placeholder
}



export default function ProductsTable({ data, onEditar }: { data: Product[], onEditar: (produtoId: string) => void }) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const router = useRouter()

  // Definição das colunas para o React Table
  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => {
        const raw = row.getValue("image") as unknown
        const srcArray = Array.isArray(raw) ? raw : [] // Verifica se é um array 
        const src = srcArray.length > 0 ? srcArray[0] : "/placeholder.svg"
    
        return (
          <div className="relative h-10 w-10 overflow-hidden rounded-md">
            <img
              src={src}
              alt={String(row.getValue("nome"))}
              className="object-cover w-full h-full"
            />
          </div>
        )
      },
      enableSorting: false,
    }
    ,
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
          <div className="text-sm text-[#631C21]/70">ID: {row.original.produtoId}</div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => {
        const cat = row.getValue("categoria") as string;
        const label = cat === "Limitada" ? "Edição limitada" : cat;
        return (
          <Badge
            variant="outline"
            className={
              cat === "Limitada"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-[#F4847B]/10 text-[#631C21]"
            }
          >
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "fragrancia",
      header: "Fragrância",
      cell: ({ row }) => <div>{row.getValue("fragrancia")}</div>,
    },
    {
      accessorKey: "preco",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Preço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("preco"))
        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "estoque",
      header: "Estoque",
      cell: ({ row }) => <div>{row.getValue("estoque")}</div>,
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

        const isLimited = product.categoria === "Limitada"
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

              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.produtoId)}>
                Copiar ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onEditar(product.produtoId)}>
                Editar produto
              </DropdownMenuItem>

              {product.categoria !== "Limitada" ? (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `/api/produtos/${product.produtoId}/limitada`,
                        { method: "POST" }
                      );
                      if (res.ok) {
                        alert("Produto marcado como edição limitada!");
                        router.refresh();
                      } else {
                        let errorMessage: string | undefined;
                        try {
                          const json = await res.json();
                          errorMessage = json.error;
                        } catch {
                          errorMessage = undefined;
                        }
                        alert(errorMessage ?? "Erro ao marcar como limitada");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Falha na requisição.");
                    }
                  }}
                >
                  Marcar como edição limitada
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `/api/produtos/${product.produtoId}/limitada`,
                        { method: "DELETE" }
                      );
                      if (res.ok) {
                        alert("Produto removido da edição limitada!");
                        router.refresh();
                      } else {
                        let errorMessage: string | undefined;
                        try {
                          const json = await res.json();
                          errorMessage = json.error;
                        } catch {
                          errorMessage = undefined;
                        }
                        alert(errorMessage ?? "Erro ao desmarcar como limitada");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Falha na requisição.");
                    }
                  }}
                >
                  Remover de edição limitada
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onClick={async () => {
                  const confirmDelete = confirm(
                    `Tem certeza que deseja excluir o produto "${product.nome}"?`
                  );
                  if (!confirmDelete) return;

                  try {
                    const res = await fetch(`/api/produtos/${product.produtoId}`, {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      alert("Produto excluído com sucesso!");
                      router.refresh();
                    } else {
                      let errorMessage: string | undefined;
                      try {
                        const json = await res.json();
                        errorMessage = json.error;
                      } catch {
                        errorMessage = undefined;
                      }
                      alert(errorMessage ?? "Erro ao excluir produto");
                    }
                  } catch (error) {
                    console.error("Erro ao excluir produto:", error);
                    alert("Erro ao excluir produto.");
                  }
                }}
              >
                Excluir produto
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

  


  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar produtos..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nome")?.setFilterValue(event.target.value)}
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
              .map((column) => (
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
                  {column.id === "nome"
                    ? "Nome"
                    : column.id === "categoria"
                    ? "Categoria"
                    : column.id === "fragrancia"
                    ? "Fragrância"
                    : column.id === "preco"
                    ? "Preço"
                    : column.id === "estoque"
                    ? "estoque"
                    : column.id === "createdAt"
                    ? "Criado em"
                    : column.id}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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
