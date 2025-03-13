"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulando um envio
    setTimeout(() => {
      toast({
        title: "Inscrição realizada com sucesso!",
        description: "Obrigado por se inscrever em nossa newsletter.",
      })
      setEmail("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold tracking-tighter text-[#631C21] sm:text-4xl">Fique por dentro das novidades</h2>
      <p className="mx-auto mt-4 max-w-[600px] text-[#882335]/80">
        Inscreva-se para receber notícias sobre lançamentos, promoções exclusivas e dicas para aproveitar ao máximo suas
        velas.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          className="border-[#F4847B]/30 bg-white text-[#631C21] placeholder:text-[#631C21]/50 focus-visible:ring-[#F4847B]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="bg-[#F4847B] text-white hover:bg-[#F1889C]" disabled={isSubmitting}>
          {isSubmitting ? "Inscrevendo..." : "Inscrever-se"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

