import type { Metadata } from "next"
import Link from "next/link"
import { Flame } from "lucide-react"
import AdminLoginForm from "@/components/admin-login-form"

export const metadata: Metadata = {
  title: "Login Administrativo | Pavito Velas",
  description: "Acesso ao painel administrativo da Pavito Velasa",
}

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-[#882335]" />
            <h1 className="text-2xl font-bold text-[#631C21]">Pavito Velas</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#631C21]">Acesso Administrativo</h2>
          <p className="text-sm text-[#631C21]/70">Entre com suas credenciais para acessar o painel administrativo</p>
        </div>

        <div className="rounded-lg border border-[#F4847B]/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <AdminLoginForm />
        </div>

        <div className="text-center text-sm text-[#631C21]/70">
          <p>
            <Link href="/login" className="font-medium text-[#631C21]/70 hover:text-[#631C21]">
              Voltar para login de cliente
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

