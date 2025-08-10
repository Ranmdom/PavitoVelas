"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { statusPedidoMap } from "@/types/pedido"

interface DetalhePedidoModalProps {
  pedidoId: string
  aberto: boolean
  aoFechar: () => void
}

export function DetalhePedidoModal({ pedidoId, aberto, aoFechar }: DetalhePedidoModalProps) {
  const [pedido, setPedido] = useState<any | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (aberto && pedidoId) {
      const buscarPedido = async () => {
        try {
          setCarregando(true)
          setErro(null)

          const resposta = await fetch(`/api/admin/pedidos/${pedidoId}`)

          if (!resposta.ok) {
            throw new Error("Erro ao buscar detalhes do pedido")
          }

          const dados = await resposta.json()
          setPedido(dados)
        } catch (erro) {
          console.error("Erro ao buscar detalhes do pedido:", erro)
          setErro("Não foi possível carregar os detalhes do pedido. Tente novamente mais tarde.")
        } finally {
          setCarregando(false)
        }
      }

      buscarPedido()
    }
  }, [aberto, pedidoId])

  // Função para formatar o status do pedido
  function getStatusBadge(status: string) {
    // Primeiro verificamos se o status existe no mapa, caso contrário usamos o valor padrão
    const config = statusPedidoMap[status as keyof typeof statusPedidoMap] || { label: "Desconhecido", className: "text-gray-500" }
    return (
      <Badge variant="outline" className={config.className}>
        {config?.label}
      </Badge>
    )
  }

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
        </DialogHeader>

        {carregando ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : erro ? (
          <div className="text-center py-8 text-red-500">{erro}</div>
        ) : pedido ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Pedido #{pedido.pedidoId}</h3>
                <p className="text-sm text-muted-foreground">
                  Realizado em {new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Status:</span>
                {getStatusBadge(pedido.statusPedido)}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm">
                    {pedido.cliente.nome} {pedido.cliente.sobrenome}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{pedido.cliente.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {pedido.endereco && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4">Endereço de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">
                        {pedido.endereco.logradouro}, {pedido.endereco.numero}
                        <br />
                        {pedido.endereco.bairro}
                        <br />
                        {pedido.endereco.cidade} - {pedido.endereco.estado}
                        <br />
                        CEP: {pedido.endereco.cep}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
              <div className="space-y-4">
                {pedido.itensPedido && pedido.itensPedido.length > 0 ? (
                  pedido.itensPedido.map((item: any) => (
                    <Card key={item.itemPedidoId} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{item.produto.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Quantidade</p>
                            <p>{item.quantidade}</p>
                          </div>
                          <div>
                            <p className="font-medium">Preço Unitário</p>
                            <p>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.precoUnitario)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Subtotal</p>
                            <p>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.quantidade * item.precoUnitario)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum item encontrado para este pedido.</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Total do Pedido</h3>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(pedido.valorTotal)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Pedido não encontrado.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
