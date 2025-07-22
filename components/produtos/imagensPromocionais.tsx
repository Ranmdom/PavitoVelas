"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function ImagemPromocional() {
    // Simulando o array de imagens que viria da API
    const [imagens, setImagens] = useState<string[]>(["templates/vela-1.jpeg?height=400&width=400"])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [frontImage, setFrontImage] = useState(imagens[0])
    const [backImage, setBackImage] = useState(imagens[0])
    const [showFront, setShowFront] = useState(true)

    useEffect(() => {
        async function fetchImage() {
            try {
                const res = await fetch("/api/produtos/imagens-promocionais")
                if (res.ok) {
                    const data = await res.json()
                    if (data && Array.isArray(data)) {
                        // Quando a API estiver funcionando, você pode usar:
                        setImagens(data);
                    }
                }
            } catch (error) {
                // handle error if needed
            }
        }
        fetchImage()
    }, [])
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % imagens.length

            if (showFront) {
                // A imagem da frente está visível, então muda a de trás e depois faz fade
                setBackImage(imagens[nextIndex])
                setTimeout(() => {
                    setShowFront(false) // Fade out da frente, mostra a de trás
                }, 50) // Pequeno delay para garantir que a imagem de trás carregou
            } else {
                // A imagem de trás está visível, então muda a da frente e depois faz fade
                setFrontImage(imagens[nextIndex])
                setTimeout(() => {
                    setShowFront(true) // Fade in da frente, esconde a de trás
                }, 50)
            }

            setCurrentIndex(nextIndex)
        }, 3000)

        return () => clearInterval(interval)
    }, [currentIndex, showFront, imagens])

    return (
        <div className="relative aspect-square w-72 overflow-hidden rounded-full bg-gradient-to-br from-amber-100/30 to-orange-200/30 p-2 sm:w-80 md:w-96">
            {/* Efeito de glow/brilho de vela */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.4)] transition-all duration-1000" />

            {/* Container das imagens sobrepostas */}
            <div className="relative h-full w-full rounded-full overflow-hidden">
                {/* Imagem de trás (sempre visível como backup) */}
                <Image
                    src={backImage || "/placeholder.svg"}
                    width={400}
                    height={400}
                    alt="Vela artesanal decorativa"
                    className="absolute inset-0 rounded-full object-cover"
                    priority
                />

                {/* Imagem da frente (com fade in/out) */}
                <Image
                    src={frontImage || "/placeholder.svg"}
                    width={400}
                    height={400}
                    alt="Vela artesanal decorativa"
                    className={`absolute inset-0 rounded-full object-cover transition-opacity duration-1000 ease-in-out ${showFront ? "opacity-100" : "opacity-0"
                        }`}
                />

                {/* Overlay com efeito de chama sutil */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-amber-200/5" />
            </div>

            {/* Indicadores de progresso */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {imagens.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>

            {/* Efeito de partículas flutuantes */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-300/60 rounded-full animate-pulse"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${15 + i * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: "2s",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
