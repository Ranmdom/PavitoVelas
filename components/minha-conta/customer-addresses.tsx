"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Package, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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

    // Buscar endereços
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setIsLoading(true)

                // Em um ambiente real, isso seria uma chamada à API
                const response = await fetch("/api/usuarios/enderecos", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error("Erro ao buscar endereços")
                }

                const data = await response.json()
                setAddresses(data)
                setIsLoading(false)
            } catch (error) {
                console.log("Erro ao buscar endereços:", error)
                setIsLoading(false)
            }
        }

        // Para fins de demonstração, vamos simular dados
        const simulateAddresses = () => {
            const mockAddresses: Address[] = [
                {
                    enderecoId: 1,
                    logradouro: "Rua das Flores",
                    numero: "123",
                    bairro: "Jardim Primavera",
                    cidade: "São Paulo",
                    estado: "SP",
                    cep: "01234-567",
                },
                {
                    enderecoId: 2,
                    logradouro: "Avenida Brasil",
                    numero: "456",
                    complemento: "Apto 101",
                    bairro: "Centro",
                    cidade: "Rio de Janeiro",
                    estado: "RJ",
                    cep: "20010-974",
                },
            ]

            setAddresses(mockAddresses)
            setIsLoading(false)
        }

        // Simular dados após um pequeno delay para simular carregamento
        // setTimeout(simulateAddresses, 1000)
        fetchAddresses()
    }, [status, userId])

    // Manipular mudanças no formulário
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAddressForm((prev) => ({ ...prev, [name]: value }))

        // Limpar erro do campo quando o usuário digita
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    // Validar CEP
    const validateCep = (cep: string) => {
        // Remover caracteres não numéricos
        const numericCep = cep.replace(/\D/g, "")

        // Verificar se tem 8 dígitos
        if (numericCep.length !== 8) {
            return false
        }

        return true
    }

    // Formatar CEP
    const formatCep = (cep: string) => {
        // Remover caracteres não numéricos
        const numericCep = cep.replace(/\D/g, "")

        // Formatar como 00000-000
        if (numericCep.length <= 5) {
            return numericCep
        }

        return `${numericCep.slice(0, 5)}-${numericCep.slice(5, 8)}`
    }

    // Buscar endereço pelo CEP
    const fetchAddressByCep = async (cep: string) => {
        try {
            // Remover caracteres não numéricos
            const numericCep = cep.replace(/\D/g, "")

            if (numericCep.length !== 8) {
                return
            }

            const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`)

            if (!response.ok) {
                throw new Error("Erro ao buscar CEP")
            }

            const data = await response.json()

            if (data.erro) {
                toast({
                    title: "CEP não encontrado",
                    description: "O CEP informado não foi encontrado.",
                    variant: "destructive",
                })
                return
            }

            setAddressForm((prev) => ({
                ...prev,
                logradouro: data.logradouro || prev.logradouro,
                bairro: data.bairro || prev.bairro,
                cidade: data.localidade || prev.cidade,
                estado: data.uf || prev.estado,
            }))
        } catch (error) {
            console.error("Erro ao buscar CEP:", error)
            toast({
                title: "Erro ao buscar CEP",
                description: "Não foi possível buscar o endereço pelo CEP. Preencha manualmente.",
                variant: "destructive",
            })
        }
    }

    // Manipular mudança no CEP
    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        const formattedCep = formatCep(value)

        setAddressForm((prev) => ({ ...prev, cep: formattedCep }))

        // Limpar erro do campo quando o usuário digita
        if (formErrors.cep) {
            setFormErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.cep
                return newErrors
            })
        }

        // Buscar endereço pelo CEP quando tiver 8 dígitos
        if (value.replace(/\D/g, "").length === 8) {
            fetchAddressByCep(value)
        }
    }

    // Validar formulário
    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!addressForm.logradouro.trim()) {
            errors.logradouro = "O endereço é obrigatório"
        }

        if (!addressForm.numero.trim()) {
            errors.numero = "O número é obrigatório"
        }

        if (!addressForm.bairro?.trim()) {
            errors.bairro = "O bairro é obrigatório"
        }

        if (!addressForm.cidade.trim()) {
            errors.cidade = "A cidade é obrigatória"
        }

        if (!addressForm.estado.trim()) {
            errors.estado = "O estado é obrigatório"
        }

        if (!addressForm.cep.trim()) {
            errors.cep = "O CEP é obrigatório"
        } else if (!validateCep(addressForm.cep)) {
            errors.cep = "CEP inválido"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

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

    // Salvar endereço (adicionar ou editar)
    const handleSaveAddress = async () => {
        if (!validateForm()) return

        try {
            setIsLoading(true)

            // Em um ambiente real, isso seria uma chamada à API
            const method = addressForm.enderecoId ? 'PUT' : 'POST'
            const url = addressForm.enderecoId ? '/api/usuarios/enderecos/' + addressForm.enderecoId : '/api/usuarios/enderecos'

            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(addressForm)
            })

            if (!response.ok) {
                throw new Error("Erro ao salvar endereço")
            }

            // Simulação de adição/edição
            if (addressForm.enderecoId && response.ok) {
                // Editar
                setAddresses((prev) =>
                    prev.map((addr) =>
                        addr.enderecoId === addressForm.enderecoId
                            ? ({ ...addressForm, enderecoId: addr.enderecoId } as Address)
                            : addr,
                    ),
                )

                toast({
                    title: "Endereço atualizado",
                    description: "O endereço foi atualizado com sucesso.",
                })
            } else {
                // Adicionar
                const newAddress = {
                    ...addressForm,
                    enderecoId: Math.max(0, ...addresses.map((a) => a.enderecoId)) + 1,
                } as Address

                setAddresses((prev) => [...prev, newAddress])

                toast({
                    title: "Endereço adicionado",
                    description: "O endereço foi adicionado com sucesso.",
                })
            }

            setIsAddressDialogOpen(false)
            setIsLoading(false)
        } catch (error) {
            console.error("Erro ao salvar endereço:", error)
            toast({
                title: "Erro ao salvar endereço",
                description: "Não foi possível salvar o endereço. Tente novamente mais tarde.",
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
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#631C21]">
                            {addressForm.enderecoId ? "Editar Endereço" : "Adicionar Endereço"}
                        </DialogTitle>
                        <DialogDescription className="text-[#631C21]/70">
                            Preencha os campos abaixo com os dados do endereço.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cep" className="text-[#631C21]">
                                CEP
                            </Label>
                            <Input
                                id="cep"
                                name="cep"
                                value={addressForm.cep}
                                onChange={handleCepChange}
                                placeholder="00000-000"
                                className={`border-[#F4847B]/30 ${formErrors.cep ? "border-red-500" : ""}`}
                            />
                            {formErrors.cep && <p className="text-red-500 text-sm">{formErrors.cep}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logradouro" className="text-[#631C21]">
                                Endereço
                            </Label>
                            <Input
                                id="logradouro"
                                name="logradouro"
                                value={addressForm.logradouro}
                                onChange={handleFormChange}
                                className={`border-[#F4847B]/30 ${formErrors.logradouro ? "border-red-500" : ""}`}
                            />
                            {formErrors.logradouro && <p className="text-red-500 text-sm">{formErrors.logradouro}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="numero" className="text-[#631C21]">
                                    Número
                                </Label>
                                <Input
                                    id="numero"
                                    name="numero"
                                    value={addressForm.numero}
                                    onChange={handleFormChange}
                                    className={`border-[#F4847B]/30 ${formErrors.numero ? "border-red-500" : ""}`}
                                />
                                {formErrors.numero && <p className="text-red-500 text-sm">{formErrors.numero}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="complemento" className="text-[#631C21]">
                                    Complemento
                                </Label>
                                <Input
                                    id="complemento"
                                    name="complemento"
                                    value={addressForm.complemento}
                                    onChange={handleFormChange}
                                    className="border-[#F4847B]/30"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bairro" className="text-[#631C21]">
                                Bairro
                            </Label>
                            <Input
                                id="bairro"
                                name="bairro"
                                value={addressForm.bairro}
                                onChange={handleFormChange}
                                className={`border-[#F4847B]/30 ${formErrors.bairro ? "border-red-500" : ""}`}
                            />
                            {formErrors.bairro && <p className="text-red-500 text-sm">{formErrors.bairro}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cidade" className="text-[#631C21]">
                                    Cidade
                                </Label>
                                <Input
                                    id="cidade"
                                    name="cidade"
                                    value={addressForm.cidade}
                                    onChange={handleFormChange}
                                    className={`border-[#F4847B]/30 ${formErrors.cidade ? "border-red-500" : ""}`}
                                />
                                {formErrors.cidade && <p className="text-red-500 text-sm">{formErrors.cidade}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="estado" className="text-[#631C21]">
                                    Estado
                                </Label>
                                <Input
                                    id="estado"
                                    name="estado"
                                    value={addressForm.estado}
                                    onChange={handleFormChange}
                                    className={`border-[#F4847B]/30 ${formErrors.estado ? "border-red-500" : ""}`}
                                />
                                {formErrors.estado && <p className="text-red-500 text-sm">{formErrors.estado}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)} className="border-[#F4847B]/30">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveAddress}
                            className="bg-[#882335] text-white hover:bg-[#631C21]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
