import type { Pedido, ItemPedido, Usuario, Endereco, Produto } from "@prisma/client"

// Tipo para o pedido com informações detalhadas
export type PedidoDetalhado = Pedido & {
  itensPedido: (ItemPedido & {
    produto: Produto
  })[]
  usuario: Usuario
  endereco?: Endereco | null
}

// Tipo para o pedido na tabela
export type PedidoTabela = {
  pedidoId: string
  cliente: string
  status: StatusPedido
  data: string
  total: number
  itens: number
}

// Tipo para o status do pedido
export type StatusPedido = "pendente" | "em_producao" | "a_caminho" | "entregue" | "cancelado"

// Mapeamento de status para exibição
export const statusPedidoMap = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  em_producao: { label: "Em Produção", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  a_caminho: { label: "A Caminho", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
  entregue: { label: "Entregue", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-100" },
}
