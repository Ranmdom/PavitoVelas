"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Package, Loader2, Plus, Pencil, Trash2, Check } from "lucide-react"
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
import { useSession } from "next-auth/react"
import AddressDialog from "../adress-dialog-form"

// Tipos
export interface Address {
    enderecoId: number
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
}

// Props do componente
interface AddressSelectorProps {
    onSelect: (address: Address) => void
    initialSelectedId?: number
}

export default function AddressSelector({ onSelect, initialSelectedId }: AddressSelectorProps) {
    const { data: session, status } = useSession()
    const userId = session?.user?.id

    const [isLoading, setIsLoading] = useState(true)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId || null)

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

    // Fetch endereços
    useEffect(() => {
        if (status === "authenticated") {
            fetchAddresses()
        }
    }, [status, fetchAddresses])

    // Selecionar endereço
    const handleSelect = (addr: Address) => {
        setSelectedId(addr.enderecoId)
        onSelect(addr)
        toast({ title: "Endereço selecionado" })
    }

    // Handle form changes & CEP lookup (mesmo do componente original)
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setAddressForm(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) {
            setFormErrors(prev => { const ne = { ...prev }; delete ne[name]; return ne })
        }
    }

    const validateCep = (cep: string) => cep.replace(/\D/g, "").length === 8
    const formatCep = (cep: string) => {
        const num = cep.replace(/\D/g, "")
        return num.length > 5 ? `${num.slice(0, 5)}-${num.slice(5, 8)}` : num
    }
    const fetchAddressByCep = async (cep: string) => {
        const num = cep.replace(/\D/g, "")
        if (num.length !== 8) return
        try {
            const res = await fetch(`https://viacep.com.br/ws/${num}/json/`)
            const data = await res.json()
            if (data.erro) {
                toast({ title: "CEP não encontrado", variant: "destructive" })
                return
            }
            setAddressForm(prev => ({
                ...prev,
                logradouro: data.logradouro || prev.logradouro,
                bairro: data.bairro || prev.bairro,
                cidade: data.localidade || prev.cidade,
                estado: data.uf || prev.estado,
            }))
        } catch {
            toast({ title: "Erro ao buscar CEP", variant: "destructive" })
        }
    }
    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value)
        setAddressForm(prev => ({ ...prev, cep: formatted }))
        if (formErrors.cep) {
            setFormErrors(prev => { const ne = { ...prev }; delete ne.cep; return ne })
        }
        if (formatted.replace(/\D/g, "").length === 8) fetchAddressByCep(formatted)
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!addressForm.logradouro.trim()) errors.logradouro = "O endereço é obrigatório"
        if (!addressForm.numero.trim()) errors.numero = "O número é obrigatório"
        if (!addressForm.bairro?.trim()) errors.bairro = "O bairro é obrigatório"
        if (!addressForm.cidade.trim()) errors.cidade = "A cidade é obrigatória"
        if (!addressForm.estado.trim()) errors.estado = "O estado é obrigatório"
        if (!addressForm.cep.trim()) errors.cep = "O CEP é obrigatório"
        else if (!validateCep(addressForm.cep)) errors.cep = "CEP inválido"
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Add / Update address
    const handleSaveAddress = async () => {
        if (!validateForm()) return
        try {
            setIsLoading(true)
            const method = addressForm.enderecoId ? 'PUT' : 'POST'
            const url = addressForm.enderecoId
                ? `/api/usuarios/enderecos/${addressForm.enderecoId}`
                : `/api/usuarios/enderecos`
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm)
            })
            if (!res.ok) throw new Error('Erro ao salvar')
            const saved: Address = await res.json()
            setAddresses(prev => {
                if (addressForm.enderecoId) {
                    return prev.map(a => a.enderecoId === saved.enderecoId ? saved : a)
                }
                return [...prev, saved]
            })
            toast({ title: addressForm.enderecoId ? 'Endereço atualizado' : 'Endereço adicionado' })
            setIsAddressDialogOpen(false)
            setIsLoading(false)
        } catch (err) {
            console.error(err)
            toast({ title: 'Erro ao salvar endereço', variant: 'destructive' })
            setIsLoading(false)
        }
    }

    // Delete
    const handleDeleteConfirm = (id: number) => {
        setAddressToDelete(id)
        setIsDeleteDialogOpen(true)
    }
    const handleDeleteAddress = async () => {
        if (!addressToDelete) return
        try {
            setIsLoading(true)
            const res = await fetch(`/api/usuarios/enderecos/${addressToDelete}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Falha ao excluir')
            setAddresses(prev => prev.filter(a => a.enderecoId !== addressToDelete))
            toast({ title: 'Endereço excluído' })
            setIsDeleteDialogOpen(false)
            setAddressToDelete(null)
            setIsLoading(false)
        } catch {
            toast({ title: 'Erro ao excluir', variant: 'destructive' })
            setIsLoading(false)
        }
    }

    if (isLoading && addresses.length === 0) {
        return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
    }

    return (
        <div className="space-y-6 p-3">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[#631C21]">Selecione um Endereço</h3>
                <Button onClick={() => { setAddressForm({ logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }); setFormErrors({}); setIsAddressDialogOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Endereço
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {addresses.map(address => (
                    <Card
                        key={address.enderecoId}
                        onClick={() => handleSelect(address)}
                        className={`border hover:shadow-md cursor-pointer ${selectedId === address.enderecoId ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                        <CardContent className="p-4 flex justify-between items-start">
                            <div>
                                <div className="font-medium">
                                    {address.logradouro}, {address.numero}{address.complemento && `, ${address.complemento}`}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {address.bairro}, {address.cidade} - {address.estado}
                                </div>
                                <div className="text-sm text-gray-600">CEP: {address.cep}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {selectedId === address.enderecoId && <Check className="h-5 w-5 text-blue-500" />}
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setAddressForm(address); setFormErrors({}); setIsAddressDialogOpen(true) }}>
                                        <Pencil className="h-4 w-4" /><span className="sr-only">Editar</span>
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); handleDeleteConfirm(address.enderecoId) }}>
                                        <Trash2 className="h-4 w-4" /><span className="sr-only">Excluir</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog para adicionar/editar */}
            <AddressDialog address={addressForm} open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen} onSuccess={fetchAddresses}/>
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{addressForm.enderecoId ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
                        <DialogDescription>Preencha os dados do endereço.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Campos de CEP até Estado (mesmos do exemplo) */}
                        <div className="grid gap-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" name="cep" value={addressForm.cep} onChange={handleCepChange} placeholder="00000-000" className={formErrors.cep ? 'border-red-500' : ''} />
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

                        {/*** Replicar os campos conforme no exemplo original ***/}

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveAddress} disabled={isLoading}>
                            {isLoading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Salvando...</> : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmação de exclusão */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Endereço?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAddress}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
