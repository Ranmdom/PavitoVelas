"use client"
import { Flame, Mail, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from 'next/link'

export default function EmptyCollections() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            setIsSubmitted(true)
            // Aqui você adicionaria a lógica para salvar o email
            setTimeout(() => {
                setEmail("")
                setIsSubmitted(false)
            }, 3000)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="relative rounded-2xl overflow-hidden mb-16">
                <div className="absolute inset-0 bg-gradient-to-r from-[#631C21] to-[#8A2A2F] z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat z-0"></div>

                <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 md:p-20">
                    <div className="w-20 h-20 mb-6 relative">
                        <div className="absolute inset-0 bg-[#F4847B]/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Flame className="h-12 w-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Nossas Coleções</h1>

                    <div className="w-24 h-1 bg-[#F4847B] rounded-full mb-6"></div>

                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
                        No momento, estamos preparando novas coleções exclusivas para você.
                        Nossas artesãs estão cuidadosamente selecionando ingredientes e criando
                        fragrâncias que transformarão seu ambiente.
                    </p>

                    <div className="glass bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8 max-w-md w-full">
                        <h3 className="text-white text-xl font-semibold mb-3">Seja o primeiro a saber</h3>
                        <p className="text-white/80 mb-4">
                            Deixe seu email e avisaremos quando nossas novas coleções estiverem disponíveis.
                        </p>

                        {isSubmitted ? (
                            <div className="bg-white/20 rounded-lg p-4 text-white animate-pulse">
                                Obrigado! Você será notificado quando lançarmos novas coleções.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    type="email"
                                    placeholder="Seu melhor email"
                                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="bg-white text-[#631C21] hover:bg-white/90 transition-all"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Notifique-me
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="mt-10">
                        <Link href="/" passHref>
                            <Button variant="link" className="text-white hover:text-[#F4847B] transition-colors">
                                Explorar produtos disponíveis <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20 text-center">
                    <div className="w-12 h-12 bg-[#631C21]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="h-6 w-6 text-[#631C21]" />
                    </div>
                    <h3 className="font-bold text-[#631C21] mb-2">Artesanais</h3>
                    <p>Cada vela é produzida à mão com cuidado e atenção aos detalhes.</p>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20 text-center">
                    <div className="w-12 h-12 bg-[#631C21]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="h-6 w-6 text-[#631C21]" />
                    </div>
                    <h3 className="font-bold text-[#631C21] mb-2">Naturais</h3>
                    <p>Ingredientes naturais selecionados, livres de substâncias tóxicas.</p>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-6 rounded-lg shadow-sm border border-white/20 text-center">
                    <div className="w-12 h-12 bg-[#631C21]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="h-6 w-6 text-[#631C21]" />
                    </div>
                    <h3 className="font-bold text-[#631C21] mb-2">Exclusivas</h3>
                    <p>Fragrâncias únicas desenvolvidas para criar experiências sensoriais memoráveis.</p>
                </div>
            </div>
        </div>
    )
}
