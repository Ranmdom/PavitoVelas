export function formatCEP(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")

  // Aplica a máscara XXXXX-XXX
  if (numbers.length <= 5) {
    return numbers
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }
}

export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.length === 8
}

export function cleanCEP(cep: string): string {
  return cep.replace(/\D/g, "")
}
