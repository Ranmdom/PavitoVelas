"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"
import { motion } from "framer-motion"
import { ChevronRight, Tag } from "lucide-react"
import CartDropdown from "@/components/cart-dropdown"

const CategoryBar = () => {
  const pathname = usePathname()
  const { categorias, isLoading } = useCategories()

  // Não mostrar em rotas de admin
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/minha-conta")) {
    return null
  }

  // Variantes de animação para o container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Variantes de animação para os itens
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  // Variantes para o efeito shimmer
  const shimmerVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: "100%",
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: "linear",
      },
    },
  }

  return (
    <div className="sticky top-16 z-40 w-full border-b overflow-y-hidden border-[#F4847B]/20 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 w-full overflow-y-hidden">
        <div className="flex items-center justify-between w-full h-12 overflow-y-hidden" >
          <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden  scrollbar-hide">
            <div className="flex items-center text-[#631C21] mr-2">
              <Tag className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Experimente:</span>
            </div>

            {isLoading ? (
              <div className="flex space-x-2 py-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative overflow-hidden rounded-full">
                    <motion.div
                      className="h-8 w-24 rounded-full bg-gradient-to-r from-[#FBE1D0]/30 via-[#FBE1D0]/50 to-[#FBE1D0]/30"
                      initial="hidden"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      variants={shimmerVariants}
                      initial="hidden"
                      animate="visible"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="flex items-center space-x-1 py-1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {categorias?.map((categoria) => (
                  <motion.div key={categoria.categoriaId} variants={itemVariants}>
                    <Link href={`/produtos?categoria=${encodeURIComponent(categoria.nome)}`} className="group relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 text-sm rounded-full bg-[#FBE1D0]/70 text-[#631C21] hover:bg-[#F4847B]/20 transition-all duration-200 flex items-center"
                      >
                        {categoria.nome}
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border border-[#F4847B]/0 group-hover:border-[#F4847B]/30"
                        initial={false}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants}>
                  <Link
                    href="/produtos"
                    className="px-3 py-1.5 text-sm rounded-full text-[#631C21]/70 hover:text-[#631C21] flex items-center"
                  >
                    <span>Ver todas</span>
                    <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Versão mobile do cart dropdown para telas pequenas */}
          <div className="md:hidden">
            <CartDropdown />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryBar
