"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  Flame,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  User,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/hooks/use-toast"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-[#882335] text-white"
              : "text-[#631C21] hover:bg-[#F4847B]/20 hover:text-[#631C21]",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado do painel administrativo.",
    })
    router.push("/")
  }

  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Produtos",
      href: "/admin/produtos",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Categorias",
      href: "/admin/categorias",
      icon: <Tag className="h-4 w-4" />,
    },
    {
      title: "Pedidos",
      href: "/admin/pedidos",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      title: "Clientes",
      href: "/admin/clientes",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Administradores",
      href: "/admin/cadastro",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Pagamentos",
      href: "/admin/pagamentos",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Análises",
      href: "/admin/analises",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Configurações",
      href: "/admin/configuracoes",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <div className="hidden border-r border-[#F4847B]/20 bg-[#FBE1D0]/80 lg:block lg:w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-[#F4847B]/20 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-[#882335]" />
            <span className="text-xl font-bold text-[#631C21]">Admin</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <SidebarNav className="px-3" items={sidebarNavItems} />
        </ScrollArea>
        <div className="border-t border-[#F4847B]/20 p-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4847B]/20">
              <span className="text-sm font-medium text-[#631C21]">{user?.nome.charAt(0).toUpperCase() || "A"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#631C21]">{user?.nome || "Admin Velas"}</p>
              <p className="text-xs text-[#631C21]/70">{user?.email || "admin@pavitovelas.com"}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-2 w-full justify-start text-[#631C21]" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}

