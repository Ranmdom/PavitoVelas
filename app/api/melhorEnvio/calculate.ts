import type { NextApiRequest, NextApiResponse } from 'next'
import { meFetch } from '../../../lib/melhorEnvioClient'

type QuoteBody = {
  fromCep: string
  toCep: string
  height: number
  width: number
  length: number
  weight: number
  services: number[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fromCep, toCep, height, width, length, weight, services } = req.body as QuoteBody
    const payload = {
      from: { postal_code: fromCep },
      to: { postal_code: toCep },
      package: { height, width, length, weight },
      services: services.join(','),
      options: { receipt: false, own_hand: false }
    }

    const apiRes = await meFetch('/shipment/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await apiRes.json()
    if (!apiRes.ok) throw new Error((result as any).message || 'Erro no cálculo de frete')
    res.status(200).json(result)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
