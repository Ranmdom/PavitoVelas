import type { NextApiRequest, NextApiResponse } from 'next'
import { meFetch } from '../../../lib/melhorEnvioClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiRes = await meFetch('/shipment/companies')
    const companies = await apiRes.json()
    if (!apiRes.ok) throw new Error((companies as any).message || 'Erro ao obter transportadoras')
    res.status(200).json(companies)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
