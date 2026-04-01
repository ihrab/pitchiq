import client from './client'

export const listIdeas = () => client.get('/api/ideas/')

export const createIdea = (data) => client.post('/api/ideas/', data)
