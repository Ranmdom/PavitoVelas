// pages/api/auth.js
import { NextApiRequest, NextApiResponse } from 'next';

const client_id = process.env.MELHOR_ENVIO_CLIENT_ID;
const client_secret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
const redirect_uri = process.env.MELHOR_ENVIO_REDIRECT_URI;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { code } = req.query;
    if (!code) {
      // Redirect user to MelhorEnvio OAuth page
      const params = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type: 'code',
        scope: 'shipping-calculate shipping-print',
      });
      return res.redirect(`https://sandbox.melhorenvio.com.br/oauth/authorize?${params}`);
    }
    // Exchange code for token
    const tokenRes = await fetch('https://sandbox.melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        code,
        redirect_uri,
      }),
    });
    const tokenData = await tokenRes.json();
    return res.status(200).json(tokenData);
  } else if (req.method === 'POST') {
    // Refresh token
    const { refresh_token } = req.body;
    const tokenRes = await fetch('https://sandbox.melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id,
        client_secret,
        refresh_token,
      }),
    });
    const tokenData = await tokenRes.json();
    return res.status(200).json(tokenData);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/index.js
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Ao carregar, redireciona para o endpoint de autenticação
    window.location.href = '/api/auth';
  }, []);
  return <p>Redirecionando para autenticação MelhorEnvio...</p>;
}

/*
.env.local
MELHOR_ENVIO_CLIENT_ID=seu_client_id_aqui
MELHOR_ENVIO_CLIENT_SECRET=seu_client_secret_aqui
MELHOR_ENVIO_REDIRECT_URI=http://localhost:3000/api/auth
*/
