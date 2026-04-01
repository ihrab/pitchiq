import client from './client'

export const login = (email, password) =>
  client.post('/api/auth/login/', { email, password })

export const register = (email, password, name) =>
  client.post('/api/auth/register/', { email, password, name })

export const googleLogin = (token) =>
  client.post('/api/auth/google/', { token })

export const getMe = () => client.get('/api/auth/me/')

export const updateMe = (data) => client.patch('/api/auth/me/', data)

export const deleteMe = () => client.delete('/api/auth/me/')
