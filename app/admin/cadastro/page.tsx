import type { Metadata } from "next"
import Link from "next/link"
import { Flame, ShieldAlert } from "lucide-react"
import AdminRegisterForm from "@/components/admin-register-form"

export const metadata: Metadata = {
  title: "Cadastro de Administrador | Pavito Velas",
  description: "Crie uma conta de administrador na Pavito Velas",
}

export default function AdminCadastroPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-[#882335]" />
            <h1 className="text-2xl font-bold text-[#631C21]">Pavito Velas</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-[#882335]" />
            <h2 className="text-2xl font-semibold tracking-tight text-[#631C21]">Cadastro de Administrador</h2>
          </div>
          <p className="text-sm text-[#631C21]/70">Crie uma conta com privilégios administrativos</p>
        </div>

        <div className="rounded-lg border border-[#F4847B]/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <AdminRegisterForm />
        </div>

        <div className="text-center text-sm text-[#631C21]/70">
          <p>
            <Link href="/admin/login" className="font-medium text-[#882335] hover:text-[#631C21]">
              Voltar para login de administrador
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

