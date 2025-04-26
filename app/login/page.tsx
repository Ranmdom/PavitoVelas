"use client";
import type { Metadata } from "next";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame } from "lucide-react";
import { useAuth } from "@/context/auth-context"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const { login } = useAuth();  

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Ativa o estado de carregamento

    try {
      const success = await login(email, senha);
      if (!success) {
        setError("E-mail ou senha incorretos.");
        setIsLoading(false); // Desativa o estado de carregamento
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor.");
      setIsLoading(false); // Desativa o estado de carregamento
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-[#882335]" />
            <h1 className="text-2xl font-bold text-[#631C21]">Pavito Velas</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#631C21]">
            Bem-vindo(a) de volta
          </h2>
          <p className="text-sm text-[#631C21]/70">
            Entre com seu e-mail e senha para acessar sua conta
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#F4847B]/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm space-y-4"
        >
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#631C21]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-[#631C21]">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#882335] text-white py-2 rounded-md hover:bg-[#631C21] flex items-center justify-center"
            disabled={isLoading} // Desativa o botão durante o carregamento
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-[#631C21]/70">
          <p>
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="font-medium text-[#882335] hover:text-[#631C21]">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
