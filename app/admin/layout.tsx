"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useAuth } from "@/context/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import LoadingIndicator from "@/components/loading-indicator"

const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0 },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()


  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
    if (!isLoading && user && user.tipo !== "admin") {
      router.replace("/")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#882335]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FBE1D0]/30">
      <AdminSidebar />
      <LoadingIndicator />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
