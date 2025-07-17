"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "@/hooks/use-toast"

export interface AddressForm {
  enderecoId?: number
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

interface AddressDialogProps {
  address?: AddressForm
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (saved: AddressForm) => void
}

export default function AddressDialog({
  address,
  open,
  onOpenChange,
  onSuccess,
}: AddressDialogProps) {
  const [formValues, setFormValues] = useState<AddressForm>({
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Inicializa ou reseta o form quando abrir ou mudar address
  useEffect(() => {
    if (address) {
      setFormValues({ ...address })
    } else {
      setFormValues({ logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" })
    }
    setFormErrors({})
  }, [open, address])

  const validateCep = (cep: string) => cep.replace(/\D/g, "").length === 8

  const formatCep = (cep: string) => {
    const num = cep.replace(/\D/g, "")
    return num.length <= 5 ? num : `${num.slice(0,5)}-${num.slice(5,8)}`
  }

  const fetchAddressByCep = async (cep: string) => {
    const num = cep.replace(/\D/g, "")
    if (num.length !== 8) return
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${num}/json/`)
      if (!resp.ok) throw new Error("CEP fetch failed")
      const data = await resp.json()
      if (data.erro) {
        toast({ title: "CEP não encontrado", variant: "destructive" })
        return
      }
      setFormValues((v) => ({
        ...v,
        logradouro: data.logradouro || v.logradouro,
        bairro: data.bairro || v.bairro,
        cidade: data.localidade || v.cidade,
        estado: data.uf || v.estado,
      }))
    } catch {
      toast({ title: "Erro ao buscar CEP", variant: "destructive" })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const val = name === "cep" ? formatCep(value) : value
    setFormValues((v) => ({ ...v, [name]: val }))
    if (formErrors[name]) {
      setFormErrors((errs) => {
        const { [name]: _, ...rest } = errs
        return rest
      })
    }
    if (name === "cep" && value.replace(/\D/g, "").length === 8) {
      fetchAddressByCep(value)
    }
  }

  const validateForm = () => {
    const errs: Record<string,string> = {}
    if (!formValues.logradouro.trim()) errs.logradouro = "O endereço é obrigatório"
    if (!formValues.numero.trim()) errs.numero = "O número é obrigatório"
    if (!formValues.bairro.trim()) errs.bairro = "O bairro é obrigatório"
    if (!formValues.cidade.trim()) errs.cidade = "A cidade é obrigatória"
    if (!formValues.estado.trim()) errs.estado = "O estado é obrigatório"
    if (!formValues.cep.trim()) errs.cep = "O CEP é obrigatório"
    else if (!validateCep(formValues.cep)) errs.cep = "CEP inválido"
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const method = formValues.enderecoId ? 'PUT' : 'POST'
      const url = formValues.enderecoId
        ? `/api/usuarios/enderecos/${formValues.enderecoId}`
        : '/api/usuarios/enderecos'
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      })
      if (!resp.ok) throw new Error('Erro na API')
      const saved: AddressForm = await resp.json()
      toast({ title: formValues.enderecoId ? 'Endereço atualizado' : 'Endereço adicionado' })
      onOpenChange(false)
      onSuccess?.(saved)
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const title = formValues.enderecoId ? "Editar Endereço" : "Adicionar Endereço"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#631C21]">{title}</DialogTitle>
          <DialogDescription className="text-[#631C21]/70">
            Preencha os campos abaixo com os dados do endereço.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* CEP */}
          <div className="grid gap-2">
            <Label htmlFor="cep" className="text-[#631C21]">CEP</Label>
            <Input
              id="cep"
              name="cep"
              value={formValues.cep}
              onChange={handleChange}
              placeholder="00000-000"
              className={`border-[#F4847B]/30 ${formErrors.cep ? "border-red-500" : ""}`}
            />
            {formErrors.cep && <p className="text-red-500 text-sm">{formErrors.cep}</p>}
          </div>
          {/* Logradouro */}
          <div className="grid gap-2">
            <Label htmlFor="logradouro" className="text-[#631C21]">Endereço</Label>
            <Input
              id="logradouro"
              name="logradouro"
              value={formValues.logradouro}
              onChange={handleChange}
              className={`border-[#F4847B]/30 ${formErrors.logradouro ? "border-red-500" : ""}`}
            />
            {formErrors.logradouro && <p className="text-red-500 text-sm">{formErrors.logradouro}</p>}
          </div>
          {/* Número e Complemento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="numero" className="text-[#631C21]">Número</Label>
              <Input
                id="numero"
                name="numero"
                value={formValues.numero}
                onChange={handleChange}
                className={`border-[#F4847B]/30 ${formErrors.numero ? "border-red-500" : ""}`}
              />
              {formErrors.numero && <p className="text-red-500 text-sm">{formErrors.numero}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="complemento" className="text-[#631C21]">Complemento</Label>
              <Input
                id="complemento"
                name="complemento"
                value={formValues.complemento || ""}
                onChange={handleChange}
                className="border-[#F4847B]/30"
              />
            </div>
          </div>
          {/* Bairro */}
          <div className="grid gap-2">
            <Label htmlFor="bairro" className="text-[#631C21]">Bairro</Label>
            <Input
              id="bairro"
              name="bairro"
              value={formValues.bairro}
              onChange={handleChange}
              className={`border-[#F4847B]/30 ${formErrors.bairro ? "border-red-500" : ""}`}
            />
            {formErrors.bairro && <p className="text-red-500 text-sm">{formErrors.bairro}</p>}
          </div>
          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cidade" className="text-[#631C21]">Cidade</Label>
              <Input
                id="cidade"
                name="cidade"
                value={formValues.cidade}
                onChange={handleChange}
                className={`border-[#F4847B]/30 ${formErrors.cidade ? "border-red-500" : ""}`}
              />
              {formErrors.cidade && <p className="text-red-500 text-sm">{formErrors.cidade}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado" className="text-[#631C21]">Estado</Label>
              <Input
                id="estado"
                name="estado"
                value={formValues.estado}
                onChange={handleChange}
                className={`border-[#F4847B]/30 ${formErrors.estado ? "border-red-500" : ""}`}
              />
              {formErrors.estado && <p className="text-red-500 text-sm">{formErrors.estado}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#F4847B]/30">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#882335] text-white hover:bg-[#631C21]" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
