"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Package, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react";
import AddressDialog from "../adress-dialog-form"


// Tipos
interface Address {
    enderecoId: number
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
}

// Componente principal
export default function CustomerAddresses() {

    const { data: session, status } = useSession(); 
    const userId = session?.user?.id; 

    const [isLoading, setIsLoading] = useState(true)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Estado do formulário
    const [addressForm, setAddressForm] = useState<Omit<Address, "enderecoId"> & { enderecoId?: number }>({
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
    })

    const fetchAddresses = useCallback(async () => {
        setIsLoading(true)
        try {
        const resp = await fetch("/api/usuarios/enderecos", { method: "GET" })
        if (!resp.ok) throw new Error("Erro ao buscar endereços")
        const data: any[] = await resp.json()
        setAddresses(data)
        } catch (err) {
        console.error(err)
        toast({ title: "Erro ao carregar endereços", variant: "destructive" })
        } finally {
        setIsLoading(false)
        }
    }, [])

    // Buscar endereços
    useEffect(() => {
        if (status === "authenticated") {
        fetchAddresses()
        }
    }, [status, fetchAddresses])

 
    // Abrir modal para adicionar endereço
    const handleAddAddress = () => {
        setAddressForm({
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
        })
        setFormErrors({})
        setIsAddressDialogOpen(true)
    }

    // Abrir modal para editar endereço
    const handleEditAddress = (address: Address) => {
        setAddressForm({
            enderecoId: address.enderecoId,
            logradouro: address.logradouro,
            numero: address.numero,
            complemento: address.complemento || "",
            bairro: address.bairro,
            cidade: address.cidade,
            estado: address.estado,
            cep: address.cep,
        })
        setFormErrors({})
        setIsAddressDialogOpen(true)
    }

    // Abrir confirmação para excluir endereço
    const handleDeleteConfirm = (addressId: number) => {
        setAddressToDelete(addressId)
        setIsDeleteDialogOpen(true)
    }

    // Excluir endereço
    const handleDeleteAddress = async () => {
        if (!addressToDelete) return

        try {
            setIsLoading(true)

            // Em um ambiente real, isso seria uma chamada à API
            // await fetch(`/api/enderecos/${addressToDelete}`, {
            //   method: 'DELETE'
            // })

            // Simulação de exclusão
            setAddresses((prev) => prev.filter((addr) => addr.enderecoId !== addressToDelete))

            toast({
                title: "Endereço excluído",
                description: "O endereço foi excluído com sucesso.",
            })

            setIsDeleteDialogOpen(false)
            setAddressToDelete(null)
            setIsLoading(false)
        } catch (error) {
            console.error("Erro ao excluir endereço:", error)
            toast({
                title: "Erro ao excluir endereço",
                description: "Não foi possível excluir o endereço. Tente novamente mais tarde.",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }


    // Renderizar estado vazio
    if (isLoading && addresses.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#F4847B]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[#631C21]">Meus Endereços</h3>
                <Button onClick={handleAddAddress} className="bg-[#882335] text-white hover:bg-[#631C21]">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Endereço
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-[#F4847B]/50 mb-4" />
                    <h3 className="text-lg font-medium text-[#631C21] mb-2">Nenhum endereço cadastrado</h3>
                    <p className="text-[#631C21]/70 mb-4">Você ainda não cadastrou nenhum endereço.</p>
                    <Button onClick={handleAddAddress} className="bg-[#882335] text-white hover:bg-[#631C21]">
                        Adicionar Endereço
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                        <Card key={address.enderecoId} className="border-[#F4847B]/30">
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-[#631C21]">
                                            {address.logradouro}, {address.numero}
                                            {address.complemento && `, ${address.complemento}`}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditAddress(address)}
                                                className="h-8 w-8 p-0 text-[#631C21]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteConfirm(address.enderecoId)}
                                                className="h-8 w-8 p-0 text-[#631C21]"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Excluir</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-[#631C21]/70">
                                        {address.bairro}, {address.cidade} - {address.estado}
                                    </div>
                                    <div className="text-[#631C21]/70">CEP: {address.cep}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Modal para adicionar/editar endereço */}
            <AddressDialog address={addressForm} open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen} onSuccess={fetchAddresses}/>

            {/* Confirmação de exclusão */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#631C21]">Excluir Endereço</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#631C21]/70">
                            Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#F4847B]/30">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAddress} className="bg-red-600 text-white hover:bg-red-700">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                "Excluir"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
