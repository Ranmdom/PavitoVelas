"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Eye, Loader2, Search, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react";


// Tipos
type OrderStatus =
  | "pendente"
  | "pago"
  | "enviado"
  | "a_caminho"
  | "pagamento_confirmado"
  | "entregue"
  | "cancelado";

type TrackingInfo = {
  trackingCarrier?: string | null
  trackingCode?: string | null
  trackingUrl?: string | null
}


interface OrderItem {
  itemPedidoId: number
  produtoId: number
  nome: string
  quantidade: number
  precoUnitario: number
}

interface Order {
  pedidoId: number
  dataPedido: string
  statusPedido: OrderStatus
  valorTotal: number
  itensPedido: OrderItem[]
  endereco?: {
    logradouro: string
    numero:    string
    bairro:    string
    cidade:    string
    estado:    string
    cep:       string
  } | null
}

// Componente principal
export default function CustomerOrders() {
  const { data: session, status } = useSession(); 
  const userId = session?.user?.id; 

  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [sortField, setSortField] = useState<"dataPedido" | "valorTotal">("dataPedido")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  const ordersPerPage = 5

  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); 


  // Buscar pedidos
  useEffect(() => {
    // 1. Espera a sessão terminar de carregar
    if (status !== "authenticated") return;

    // 2. Garante que há id antes de chamar a API
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        
        // Em um ambiente real, isso seria uma chamada à API
        const response = await fetch('/api/usuarios/pedidos/' + userId)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar pedidos')
        }
        
        const data = await response.json()
        setOrders(data)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
      }
    }


    
    // Simular dados após um pequeno delay para simular carregamento
    // setTimeout(simulateOrders, 1000)
    fetchOrders()
  }, [status, userId])

  // Aplicar filtros e ordenação
  useEffect(() => {
    console.log(orders)
    let result = [...orders]
    
    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      result = result.filter(order => order.statusPedido === statusFilter)
    }
    
    // Aplicar busca por número do pedido
    if (searchTerm) {
      result = result.filter(order => 
        order.pedidoId.toString().includes(searchTerm)
      )
    }
    
    // Aplicar ordenação
    result.sort((a, b) => {
      if (sortField === "dataPedido") {
        return sortDirection === "asc" 
          ? new Date(a.dataPedido).getTime() - new Date(b.dataPedido).getTime()
          : new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime()
      } else {
        return sortDirection === "asc"
          ? a.valorTotal - b.valorTotal
          : b.valorTotal - a.valorTotal
      }
    })
    
    setFilteredOrders(result)
    setTotalPages(Math.max(1, Math.ceil(result.length / ordersPerPage)))
    setCurrentPage(1)
  }, [orders, statusFilter, searchTerm, sortField, sortDirection])

  // Obter pedidos da página atual
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage
    const endIndex = startIndex + ordersPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }

  // Visualizar detalhes do pedido
    const handleViewDetails = async (order: Order) => {
    setIsLoading(true);
    setTracking(null);
    setIsTrackingLoading(true);

    try {
      const res = await fetch(`/api/admin/pedidos/${order.pedidoId}`);
      if (!res.ok) throw new Error("Erro ao buscar detalhes");
      const data: any = await res.json();
      setSelectedOrder(data);
      setIsDetailsOpen(true);
    } catch (err) {
      toast({ title: "Não foi possível carregar o pedido." });
    } finally {
      setIsLoading(false);
    }

    // busca do rastreio (independente do sucesso dos detalhes)
    try {
      const rt = await fetch(`/api/melhorEnvio/rastreio?pedidoId=${order.pedidoId}`, { cache: "no-store" })
        if (rt.ok) {
          const data: TrackingInfo = await rt.json()
          setTracking(data)
        } else {
          setTracking(null)
        }
    } catch {
      setTracking(null);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  async function handleRefreshTracking(pedidoId: number) {
    try {
      setIsSyncing(true);
      // força sincronização no backend
      await fetch("/api/melhorEnvio/resyncPendentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
        cache: "no-store",
      });

      // re-busca tracking para esse pedido
      const rt = await fetch(`/api/melhorEnvio/rastreio?pedidoId=${pedidoId}`, { cache: "no-store" });
      const data = rt.ok ? await rt.json() : null;
      setTracking(data);
      toast({ title: "Rastreio atualizado", description: "Código de rastreio atualizado com sucesso." });
    } catch (e: any) {
      toast({ title: "Não foi possível atualizar agora", description: e.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  }



  // Formatar status do pedido
  const formatStatus = (status: OrderStatus) => {
    const statusMap = {
      pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
      pago: { label: "Pago", color: "bg-blue-100 text-blue-800" },
      enviado: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
      a_caminho: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
      pagamento_confirmado: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
      entregue: { label: "Entregue", color: "bg-green-100 text-green-800" },
      cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" }
    }
    
    return (
      <Badge className={`${statusMap[status]?.color || ''} border-none`}>
        {statusMap[status]?.label}
      </Badge>
    )
  }

  // Renderizar estado vazio
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4847B]" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-[#F4847B]/50 mb-4" />
        <h3 className="text-lg font-medium text-[#631C21] mb-2">Nenhum pedido encontrado</h3>
        <p className="text-[#631C21]/70 mb-4">Você ainda não realizou nenhum pedido.</p>
        <Button asChild className="bg-[#882335] text-white hover:bg-[#631C21]">
          <a href="/">Explorar produtos</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="search" className="text-[#631C21]">Buscar por número</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Número do pedido"
              className="pl-8 border-[#F4847B]/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="status" className="text-[#631C21]">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-[#F4847B]/30">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="sort" className="text-[#631C21]">Ordenar por</Label>
          <div className="flex gap-2">
            <Select 
              value={sortField} 
              onValueChange={(value) => setSortField(value as "dataPedido" | "valorTotal")}
            >
              <SelectTrigger className="border-[#F4847B]/30">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dataPedido">Data</SelectItem>
                <SelectItem value="valorTotal">Valor</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              className="border-[#F4847B]/30"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de pedidos */}
      <Card className="border-[#F4847B]/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FBE1D0]/30 hover:bg-[#FBE1D0]/50">
                <TableHead className="text-[#631C21]">Nº do Pedido</TableHead>
                <TableHead className="text-[#631C21]">Data</TableHead>
                <TableHead className="text-[#631C21]">Status</TableHead>
                <TableHead className="text-[#631C21] text-right">Valor Total</TableHead>
                <TableHead className="text-[#631C21] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageOrders().map((order) => (
                <TableRow key={order.pedidoId} className="hover:bg-[#FBE1D0]/10">
                  <TableCell className="font-medium">#{order.pedidoId}</TableCell>
                  <TableCell>
                    {format(new Date(order.dataPedido), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{formatStatus(order.statusPedido)}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.valorTotal)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="text-[#631C21] hover:text-[#882335] hover:bg-[#FBE1D0]/30"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination className="mx-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar apenas páginas próximas à atual
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      isActive={page === currentPage}
                      className={page === currentPage ? "bg-[#882335] text-white" : ""}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              
              // Mostrar elipses para páginas omitidas
              if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              
              return null
            })}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}




      {/* Modal de detalhes do pedido */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#631C21] text-xl">
              Detalhes do Pedido #{selectedOrder?.pedidoId}
            </DialogTitle>
            <DialogDescription className="text-[#631C21]/70">
              Realizado em {selectedOrder && format(new Date(selectedOrder.dataPedido), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* ENDEREÇO */}
                <div>
                  <h4 className="font-medium text-[#631C21] mb-1">Endereço de Entrega</h4>
                  {selectedOrder.endereco ? (
                    <>
                      <p>
                        {selectedOrder.endereco.logradouro}, {selectedOrder.endereco.numero}
                      </p>
                      <p>
                        {selectedOrder.endereco.bairro} — {selectedOrder.endereco.cidade}/{selectedOrder.endereco.estado}
                      </p>
                      <p>CEP: {selectedOrder.endereco.cep}</p>
                    </>
                  ) : (
                    <p className="text-sm text-[#631C21]/70">Nenhum endereço encontrado.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-[#631C21] mb-1">Status</h4>
                  <div>{formatStatus(selectedOrder.statusPedido)}</div>
                </div>
                <div>
                  <h4 className="font-medium text-[#631C21] mb-1">Valor Total</h4>
                  <div className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.valorTotal)}
                  </div>
                </div>
                {/* RASTREAMENTO */}
                <div className="col-span-2">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium text-[#631C21]">Rastreamento</h4>

                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#F4847B]/30"
                      onClick={() => selectedOrder && handleRefreshTracking(Number(selectedOrder.pedidoId))}
                      disabled={isTrackingLoading || isSyncing}
                    >
                      {(isTrackingLoading || isSyncing) ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Atualizando…
                        </span>
                      ) : (
                        "Atualizar rastreio"
                      )}
                    </Button>
                  </div>

                  {isTrackingLoading ? (
                    <div className="flex items-center gap-2 text-[#631C21]/70">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando informações de rastreio…
                    </div>
                  ) : !tracking?.trackingCarrier && !tracking?.trackingCode ? (
                    <p className="text-sm text-[#631C21]/70">
                      Ainda não há informações de rastreio disponíveis. Tente “Atualizar rastreio” em alguns minutos.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div>
                        <b>Transportadora:</b> {tracking?.trackingCarrier ?? "-"}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span><b>Código:</b> {tracking?.trackingCode ?? "-"}</span>

                        {tracking?.trackingCode && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#F4847B]/30"
                            onClick={async () => {
                              await navigator.clipboard.writeText(tracking.trackingCode!);
                              toast({ title: "Código copiado!", description: "Cole no site da transportadora." });
                            }}
                          >
                            Copiar código
                          </Button>
                        )}
                        {tracking?.trackingUrl && (
                          <Button asChild size="sm" className="bg-[#882335] text-white hover:bg-[#631C21]">
                            <a href={tracking.trackingUrl} target="_blank" rel="noreferrer">Ver rastreio</a>
                          </Button>
                        )}
                      </div>

                      <small className="text-[#631C21]/70">
                        Copie o código e cole no site da transportadora para acompanhar.
                      </small>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="bg-[#F4847B]/20" />
              
              <div>
                <h4 className="font-medium text-[#631C21] mb-3">Itens do Pedido</h4>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FBE1D0]/30 hover:bg-[#FBE1D0]/50">
                      <TableHead className="text-[#631C21]">Produto</TableHead>
                      <TableHead className="text-[#631C21] text-center">Quantidade</TableHead>
                      <TableHead className="text-[#631C21] text-right">Preço Unitário</TableHead>
                      <TableHead className="text-[#631C21] text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.itensPedido.map((item) => (
                      <TableRow key={item.itemPedidoId} className="hover:bg-[#FBE1D0]/10">
                        <TableCell>{item.nome}</TableCell>
                        <TableCell className="text-center">{item.quantidade}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario * item.quantidade)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-[#882335] text-white hover:bg-[#631C21]"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
