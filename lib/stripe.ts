import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil", // Use a versão mais recente da API
  appInfo: {
    name: "Pavito Velas",
    version: "1.0.0",
  },
})
