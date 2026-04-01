import client from './client'

export const createCheckoutSession = (plan) =>
  client.post('/api/auth/stripe/create-checkout-session/', { plan })
