import type React from "react"
import type { Metadata } from "next"
import AdminSidebar from "@/components/admin/admin-sidebar"

export const metadata: Metadata = {
  title: "Painel Administrativo | Pavito Velas",
  description: "Painel administrativo para gerenciamento do e-commerce Pavito Velas",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FBE1D0]/30">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  )
}

