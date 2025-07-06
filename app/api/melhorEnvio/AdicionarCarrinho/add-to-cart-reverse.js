import { NextApiRequest, NextApiResponse } from 'next';
const REVERSE_URL = 'https://sandbox.melhorenvio.com.br/api/v2/me/cart/return';
const access_token_rev = process.env.MELHOR_ENVIO_ACCESS_TOKEN;
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', ['POST']); return res.status(405).end(`Method ${req.method} Not Allowed`); }
  // req.body expects: reason, from, to, volumes (array)
  const response = await fetch(REVERSE_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token_rev}` }, body: JSON.stringify(req.body)
  });
  const data = await response.json(); return res.status(response.status).json(data);
}