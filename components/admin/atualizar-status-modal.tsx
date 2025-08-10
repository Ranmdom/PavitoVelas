"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { StatusPedido } from "@/types/pedido"

interface AtualizarStatusModalProps {
  pedidoId: string
  aberto: boolean
  aoFechar: () => void
  aoAtualizar: () => void
}

export function AtualizarStatusModal({ pedidoId, aberto, aoFechar, aoAtualizar }: AtualizarStatusModalProps) {
  const [statusAtual, setStatusAtual] = useState<StatusPedido | null>(null)
  const [novoStatus, setNovoStatus] = useState<StatusPedido | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const { toast } = useToast()

  // Buscar o status atual do pedido
  useEffect(() => {
    if (aberto && pedidoId) {
      const buscarPedido = async () => {
        try {
          setCarregando(true)

          const resposta = await fetch(`/api/admin/pedidos/${pedidoId}`)

          if (!resposta.ok) {
            throw new Error("Erro ao buscar detalhes do pedido")
          }

          const dados = await resposta.json()
          console.log(dados)
          setStatusAtual(dados.statusPedido)
          setNovoStatus(dados.statusPedido)
        } catch (erro) {
          console.error("Erro ao buscar detalhes do pedido:", erro)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes do pedido.",
            variant: "destructive",
          })
        } finally {
          setCarregando(false)
        }
      }

      buscarPedido()
    }
  }, [aberto, pedidoId, toast])

  // Atualizar o status do pedido
  const atualizarStatus = async () => {
    if (!novoStatus || novoStatus === statusAtual) {
      return
    }

    try {
      setAtualizando(true)

      const resposta = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar status do pedido")
      }

      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso.",
      })

      // Chamar a função de callback para atualizar a lista de pedidos
      aoAtualizar()

      // Fechar o modal
      aoFechar()
    } catch (erro) {
      console.error("Erro ao atualizar status do pedido:", erro)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      })
    } finally {
      setAtualizando(false)
    }
  }

  // Mapear os status para exibição
  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "em_producao", label: "Em Produção" },
    { value: "a_caminho", label: "A Caminho" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" },
  ]

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Status do Pedido</DialogTitle>
        </DialogHeader>

        {carregando ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label>Status Atual</Label>
                <div className="mt-2 p-2 bg-muted rounded-md">
                  {statusOptions.find((s) => s.value === statusAtual)?.label || "Desconhecido"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Novo Status</Label>
                <RadioGroup value={novoStatus || ""} onValueChange={(value) => setNovoStatus(value as StatusPedido)}>
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={atualizando}>
            Cancelar
          </Button>
          <Button
            onClick={atualizarStatus}
            disabled={carregando || atualizando || novoStatus === statusAtual || !novoStatus}
          >
            {atualizando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
