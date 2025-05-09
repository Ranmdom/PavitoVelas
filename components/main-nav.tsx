"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Flame, LogOut, Menu, Search, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import CartDropdown from "@/components/cart-dropdown"
import { useSession, signOut } from "next-auth/react";
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CategoryBar from "@/components/category-bar"

export default function MainNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchAnimating, setIsSearchAnimating] = useState(false)
  const { data: session } = useSession()
  const user = session?.user 
  const router = useRouter()

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

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")

    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado da sua conta.",
    })
  }

  const navigateToAdminPanel = () => {
    router.push("/admin")
  }

  const navigateToUserProfile = () => {
    router.push("/minha-conta")
  }

  return (
    <>
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
              {/* <Link href="/colecoes" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                Coleções
              </Link> */}
              <Link href="/sobre" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                Sobre
              </Link>
              <Link href="/contato" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                Contato
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isSearchOpen ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const searchValue = e.currentTarget.search.value
                  if (searchValue.trim()) {
                    router.push(`/produtos?q=${encodeURIComponent(searchValue.trim())}`)
                    handleSearchClose()
                  }
                }}
              >
                <div className="flex items-center animate-in slide-in-from-right duration-300">
                  <Input
                    name="search"
                    type="search"
                    placeholder="Buscar produtos..."
                    className="w-full border-[#F4847B]/30 bg-white/80 focus-visible:ring-[#F4847B]"
                    autoFocus
                  />
                  <Button type="submit" variant="ghost" size="icon" className="ml-2 text-[#631C21]">
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSearchClose}
                    className="ml-1 text-[#631C21]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </form>
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

                <CartDropdown />

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-[#631C21]">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Perfil</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4847B]/20">
                          <span className="text-xs font-medium text-[#631C21]">
                            {user.name?.charAt(0).toUpperCase() ?? ""}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-[#631C21]/70">{user.email}</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {user.tipo === "admin" ? (
                        <>
                          <DropdownMenuItem onClick={navigateToAdminPanel}>Painel Administrativo</DropdownMenuItem>
                          <DropdownMenuItem onClick={navigateToUserProfile}>Minha Conta</DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={navigateToUserProfile}>Minha Conta</DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // Botão "Entrar" direciona diretamente para /login
                  <Link href="/login">
                    <Button variant="ghost" className="relative text-[#631C21]">
                      Entrar
                    </Button>
                  </Link>
                )}

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
                      {!user && (
                        <>
                          <Link href="/login" className="text-[#631C21] transition-colors hover:text-[#F4847B]">
                            Login
                          </Link>
                        </>
                      )}
                      {user && (
                        <Button variant="ghost" className="justify-start p-0 text-[#631C21]" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
        <CategoryBar />
      </header>
    </>
  )
}
