import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../lib/melhorEnvioClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code } = req.query
    if (!code) {
      const params = new URLSearchParams({
        client_id: process.env.ME_CLIENT_ID!,
        redirect_uri: process.env.ME_REDIRECT_URI!,
        response_type: 'code',
        scope: 'shipping-companies shipping-calculate'
      }).toString()
      return res.redirect(`https://sandbox.melhorenvio.com.br/oauth/authorize?${params}`)
    }
    await getAccessToken(code as string)
    res.status(200).json({ message: 'Autenticado com sucesso!' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
