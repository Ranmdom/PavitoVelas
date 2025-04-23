import type React from "react"

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gradient-to-b from-[#FBE1D0]/30 to-white/80">{children}</div>
}
