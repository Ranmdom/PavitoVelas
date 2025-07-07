import type { NextApiRequest, NextApiResponse } from 'next'
import { meFetch } from '../../../lib/melhorEnvioClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiRes = await meFetch('/shipment/services')
    const services = await apiRes.json()
    if (!apiRes.ok) throw new Error((services as any).message || 'Erro ao obter serviços')
    res.status(200).json(services)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
