"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useAuth } from "@/context/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBE1D0]/30">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#882335]" />
          <p className="mt-4 text-[#631C21]">Verificando credenciais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FBE1D0]/30">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  )
}

