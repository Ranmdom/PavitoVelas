export interface ShippingOption {
  id: number
  name: string
  company: {
    id: number
    name: string
    picture: string
  }
  price: string
  custom_price: string
  discount: string
  currency: string
  delivery_time: number
  delivery_range: {
    min: number
    max: number
  }
  custom_delivery_time: number
  custom_delivery_range: {
    min: number
    max: number
  }
  packages: Array<{
    price: string
    discount: string
    format: string
    weight: string
    insurance_value: string
    products: any[]
  }>
  additional_services: {
    receipt: boolean
    own_hand: boolean
    collect: boolean
  }
  company_id: number
  error?: string
}

export interface ShippingCalculatorProps {
  onShippingSelect: (option: ShippingOption | null, postalCode: string) => void
  selectedShipping?: ShippingOption | null
}
