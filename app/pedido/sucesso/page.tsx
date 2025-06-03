"use client";

import dynamic from "next/dynamic"
import { Suspense } from "react";

const PedidoSucessoPage = dynamic(() => import("@/components/sucesso-page"), { ssr: false })

export default function LoginPage() {
  

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PedidoSucessoPage />
    </Suspense>
  );
}
