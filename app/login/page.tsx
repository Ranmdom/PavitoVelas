import type { Metadata } from "next"
import Link from "next/link"
import { Flame } from "lucide-react"
import CustomerLoginForm from "@/components/costumer-login-form"

export const metadata: Metadata = {
  title: "Login | Pavito Velas",
  description: "Faça login na sua conta Pavito Velas",
}

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-[#882335]" />
            <h1 className="text-2xl font-bold text-[#631C21]">Pavito Velas</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#631C21]">Bem-vindo(a) de volta</h2>
          <p className="text-sm text-[#631C21]/70">Entre com seu e-mail e senha para acessar sua conta</p>
        </div>

        <div className="rounded-lg border border-[#F4847B]/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <CustomerLoginForm />
        </div>

        <div className="text-center text-sm text-[#631C21]/70">
          <p>
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="font-medium text-[#882335] hover:text-[#631C21]">
              Cadastre-se
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/admin/login" className="font-medium text-[#631C21]/70 hover:text-[#631C21]">
              Acesso para administradores
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

