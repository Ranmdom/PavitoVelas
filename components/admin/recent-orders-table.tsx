"use client"

import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { DetalhePedidoModal } from "./detalhe-pedido-modal"
import { AtualizarStatusModal } from "./atualizar-status-modal"
import { type PedidoTabela, type StatusPedido, statusPedidoMap } from "@/types/pedido"
import CandleLoading from "../loading/candle-loading"

// Função para formatar o status do pedido
function getStatusBadge(status: StatusPedido) {
  const config = statusPedidoMap[status]
  return (
    <Badge variant="outline" className={config?.className}>
      {config?.label}
    </Badge>
  )
}

export default function RecentOrdersTable() {
  const [pedidos, setPedidos] = useState<PedidoTabela[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [pedidoSelecionado, setPedidoSelecionado] = useState<string | null>(null)
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false)
  const [modalStatusAberto, setModalStatusAberto] = useState(false)
  const { toast } = useToast()

  // Buscar pedidos da API
  useEffect(() => {
    const buscarPedidos = async () => {
      try {
        setCarregando(true)
        const resposta = await fetch("/api/pedidos")

        if (!resposta.ok) {
          throw new Error("Erro ao buscar pedidos")
        }

        const dados = await resposta.json()
        setPedidos(dados)
      } catch (erro) {
        console.error("Erro ao buscar pedidos:", erro)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setCarregando(false)
      }
    }

    buscarPedidos()
  }, [toast])

  // Atualizar a lista de pedidos após uma atualização de status
  const atualizarListaPedidos = async () => {
    try {
      const resposta = await fetch("/api/pedidos")

      if (!resposta.ok) {
        throw new Error("Erro ao buscar pedidos")
      }

      const dados = await resposta.json()
      setPedidos(dados)
    } catch (erro) {
      console.error("Erro ao atualizar lista de pedidos:", erro)
    }
  }

  // Abrir modal de detalhes
  const abrirDetalhes = (id: string) => {
    setPedidoSelecionado(id)
    setModalDetalheAberto(true)
  }

  // Abrir modal de atualização de status
  const abrirAtualizarStatus = (id: string) => {
    setPedidoSelecionado(id)
    setModalStatusAberto(true)
  }

  // Definição das colunas
  const columns: ColumnDef<PedidoTabela>[] = [
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
      accessorKey: "pedidoId",
      header: "Pedido",
      cell: ({ row }) => <div className="font-medium">{row.getValue("pedidoId")}</div>,
    },
    {
      accessorKey: "cliente",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Cliente
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("cliente")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "data",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const data = new Date(row.getValue("data"))
        return <div>{data.toLocaleDateString("pt-BR")}</div>
      },
    },
    {
      accessorKey: "itens",
      header: "Itens",
      cell: ({ row }) => <div className="text-center">{row.getValue("itens")}</div>,
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const valor = Number.parseFloat(row.getValue("total"))
        const formatado = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor)
        return <div className="text-right font-medium">{formatado}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const pedido = row.original
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(pedido.pedidoId)}>
                Copiar ID do pedido
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => abrirDetalhes(pedido.pedidoId)}>Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => abrirAtualizarStatus(pedido.pedidoId)}>
                Atualizar status
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setPedidoSelecionado(pedido.pedidoId)
                  abrirAtualizarStatus(pedido.pedidoId)
                }}
              >
                Cancelar pedido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: pedidos,
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
          placeholder="Filtrar pedidos..."
          value={(table.getColumn("cliente")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("cliente")?.setFilterValue(event.target.value)}
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
                    {column.id === "pedidoId"
                      ? "Pedido"
                      : column.id === "cliente"
                        ? "Cliente"
                        : column.id === "status"
                          ? "Status"
                          : column.id === "data"
                            ? "Data"
                            : column.id === "itens"
                              ? "Itens"
                              : column.id === "total"
                                ? "Total"
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
            {carregando ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <CandleLoading/>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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

      {/* Modal de detalhes do pedido */}
      {pedidoSelecionado && (
        <DetalhePedidoModal
          pedidoId={pedidoSelecionado}
          aberto={modalDetalheAberto}
          aoFechar={() => {
            setModalDetalheAberto(false)
            setPedidoSelecionado(null)
          }}
        />
      )}

      {/* Modal de atualização de status */}
      {pedidoSelecionado && (
        <AtualizarStatusModal
          pedidoId={pedidoSelecionado}
          aberto={modalStatusAberto}
          aoFechar={() => {
            setModalStatusAberto(false)
            setPedidoSelecionado(null)
          }}
          aoAtualizar={atualizarListaPedidos}
        />
      )}
    </div>
  )
}
