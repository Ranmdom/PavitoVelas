"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Menu, Search, ShoppingBag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function MainNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchAnimating, setIsSearchAnimating] = useState(false)

  const handleSearchOpen = () => {
    setIsSearchAnimating(true)
    setTimeout(() => {
      setIsSearchOpen(true)
      setIsSearchAnimating(false)
    }, 300)
  }

  const handleSearchClose = () => {
    setIsSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F4847B]/20 bg-[#FBE1D0]/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-[#882335]" />
            <span className="text-xl font-bold text-[#631C21]">Pavito Velas</span>
          </Link>

          <nav className="hidden gap-6 md:flex">
            <Link href="/produtos" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
              Produtos
            </Link>
            <Link href="/colecoes" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
              Coleções
            </Link>
            <Link href="/contato" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
              Contato
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <div className="flex items-center animate-in slide-in-from-right duration-300">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="w-full border-[#F4847B]/30 bg-white/80 focus-visible:ring-[#F4847B]"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSearchClose} className="ml-2 text-[#631C21]">
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`text-[#631C21] transition-all duration-300 ${isSearchAnimating ? "scale-125 rotate-90" : ""}`}
                onClick={handleSearchOpen}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>

              <Button variant="ghost" size="icon" className="text-[#631C21]">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Carrinho</span>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-[#FBE1D0]">
                  <nav className="grid gap-6 text-lg">
                    <Link href="/produtos" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                      Produtos
                    </Link>
                    <Link href="/colecoes" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                      Coleções
                    </Link>
                    <Link href="/contato" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                      Contato
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

