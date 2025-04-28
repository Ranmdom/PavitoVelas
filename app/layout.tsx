// app/layout.tsx
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Providers   from "./providers";
import MainNav     from "@/components/main-nav";
import LoadingIndicator from "@/components/loading-indicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pavito Velas - Velas Artesanais Premium",
  description: "Loja de velas artesanais premium feitas com ingredientes 100% naturais",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#FBE1D0]/30`}>
        <Providers>
          <MainNav />           {/* agora dentro do provider client */}
          <LoadingIndicator />
          {children}
          <footer className="w-full border-t border-[#F4847B]/10 bg-[#FBE1D0]/60 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-[#631C21]/70">
              © 2025 Pavito Velas. Todos os direitos reservados.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
