import { NextApiRequest, NextApiResponse } from 'next';

const CART_URL = 'https://sandbox.melhorenvio.com.br/api/v2/me/cart';
const access_token = process.env.MELHOR_ENVIO_ACCESS_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const body = req.body; // Espera: from, to, volumes, service, options
  const response = await fetch(CART_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return res.status(response.status).json(data);
}
