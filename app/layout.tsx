import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import MainNav from "@/components/main-nav"

import LoadingIndicator from "@/components/loading-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pavito Velas - Velas Artesanais Premium",
  description: "Loja de velas artesanais premium feitas com ingredientes 100% naturais",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#FBE1D0]/30`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <CartProvider>
              <MainNav />
              <LoadingIndicator/>
              {children}
              <footer className="w-full border-t border-[#F4847B]/10 bg-[#FBE1D0]/60 py-6">
                <div className="container mx-auto px-4 text-center text-sm text-[#631C21]/70">
                  <p>© 2025 Pavito Velas. Todos os direitos reservados.</p>
                </div>
              </footer>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

