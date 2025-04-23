"use client"

import type React from "react"

import { useState } from "react"
import { Phone, Mail, Clock, MapPin, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ContactItemProps {
  icon: React.ReactNode
  title: string
  content: string
  copyable?: boolean
}

function ContactItem({ icon, title, content, copyable = false }: ContactItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="flex items-start gap-4 mb-6 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
    >
      <div className="bg-[#631C21]/10 rounded-full p-3 text-[#631C21]">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-[#631C21]">{title}</h3>
        <p className="text-muted-foreground">{content}</p>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Copiar ${title}`}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </motion.div>
  )
}

export default function ContactInfo() {
  return (
    <div className="space-y-2">
      <ContactItem icon={<Phone className="h-5 w-5" />} title="Telefone" content="(11) 99999-9999" copyable />
      <ContactItem icon={<Mail className="h-5 w-5" />} title="Email" content="contato@pavitovelas.com.br" copyable />
      <ContactItem
        icon={<MapPin className="h-5 w-5" />}
        title="Endereço"
        content="Rua das Velas, 123 - Jardim Luminoso, São Paulo - SP, 01234-567"
        copyable
      />
      <ContactItem
        icon={<Clock className="h-5 w-5" />}
        title="Horário de Atendimento"
        content="Segunda a Sexta: 9h às 18h | Sábado: 9h às 13h"
      />

      <div className="pt-4 mt-6 border-t border-[#F4847B]/20">
        <h3 className="font-medium text-[#631C21] mb-2">Atendimento Personalizado</h3>
        <p className="text-muted-foreground text-sm">
          Precisa de um atendimento especial ou tem interesse em encomendas personalizadas? Entre em contato conosco por
          telefone ou email para conversarmos sobre suas necessidades específicas.
        </p>
      </div>
    </div>
  )
}
