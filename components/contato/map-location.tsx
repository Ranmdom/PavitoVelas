"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

export default function MapLocation() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      {/* Placeholder enquanto o mapa carrega */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F4847B]/10 flex flex-col items-center justify-center">
          <MapPin className="h-12 w-12 text-[#631C21] mb-4 animate-bounce" />
          <p className="text-[#631C21] font-medium">Carregando mapa...</p>
        </div>
      )}

      {/* Mapa do Google */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975216389485!2d-46.65429492376366!3d-23.56416066162782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1682345678901!5m2!1spt-BR!2sbr"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      ></iframe>
    </div>
  )
}
