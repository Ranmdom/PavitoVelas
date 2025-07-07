"use client"

import { Suspense } from "react"
import ProdutosContent from "../../components/produtos/ProdutosContent"

export default function ProdutosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <section className="w-full bg-gradient-to-r from-[#631C21] to-[#882335] py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Nossos Produtos</h1>
          <p className="mt-4 max-w-[700px] text-white/80 md:text-lg">
            Velas artesanais com ingredientes naturais e fragrâncias exclusivas.
          </p>
        </div>
      </section>

      {/* Conteúdo com Suspense */}
      <Suspense fallback={<div className="text-center py-10">Carregando...</div>}>
        <ProdutosContent />
      </Suspense>
    </div>
  )
}
