"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import Link from "next/link"

export default function PedidoSucessoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()

  const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (hasChecked) return;
        setHasChecked(true);

        const session_id = searchParams.get("session_id");

        if (session_id) {
            setSessionId(session_id);
            clearCart();
            setIsLoading(false);
        } else {
            router.replace("/");
        }
    }, [hasChecked, searchParams, clearCart, router]);

  

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#882335]" />
        <p className="text-lg text-[#631C21]">Processando seu pedido...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 rounded-full bg-[#FBE1D0] p-4">
        <CheckCircle className="h-12 w-12 text-[#631C21]" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-[#631C21]">Pedido Confirmado!</h1>
      <p className="mb-6 max-w-md text-center text-[#631C21]/70">
        Obrigado pela sua compra. Seu pedido foi processado com sucesso e será enviado em breve.
      </p>
      {sessionId && (
        <p className="mb-6 text-sm text-[#631C21]/70">
          ID da transação: <span className="font-mono">{sessionId}</span>
        </p>
      )}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button asChild className="bg-[#882335] text-white hover:bg-[#631C21]">
          <Link href="/produtos">Continuar Comprando</Link>
        </Button>
        <Button asChild variant="outline" className="border-[#631C21]/20 text-[#631C21]">
          <Link href="/minha-conta">Ver Meus Pedidos</Link>
        </Button>
      </div>
    </div>
  )
}
