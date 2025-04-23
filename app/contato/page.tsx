import type { Metadata } from "next"
import ContactForm from "@/components/contato/contact-form"
import ContactInfo from "@/components/contato/contact-info"
import SocialLinks from "@/components/contato/social-links"
import MapLocation from "@/components/contato/map-location"

export const metadata: Metadata = {
  title: "Contato | Pavito Velas",
  description: "Entre em contato conosco para dúvidas, sugestões ou informações sobre nossos produtos artesanais.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero da página de contato */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#631C21] to-[#882335] py-10 md:py-10">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/flame-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        <div className="flex flex-col justify-center items-center text-center p-12 md:p-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Fale Conosco</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Estamos à disposição para atender suas dúvidas, sugestões ou pedidos especiais. Sua mensagem é muito
            importante para nós.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Formulário de contato */}
        <div className="order-2 lg:order-1">
          <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#631C21] mb-6">Envie sua mensagem</h2>
            <ContactForm />
          </div>
        </div>

        {/* Informações de contato */}
        <div className="order-1 lg:order-2">
          <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 p-6 md:p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-[#631C21] mb-6">Informações de Contato</h2>
            <ContactInfo />
          </div>

          {/* Redes sociais */}
          <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#631C21] mb-6">Nossas Redes Sociais</h2>
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Mapa de localização */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#631C21] mb-6 text-center">Nossa Localização</h2>
        <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 p-2 shadow-sm overflow-hidden">
          <MapLocation />
        </div>
      </div>

    </div>
  )
}
