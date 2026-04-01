import client from './client'

export const getAnalysis = (id) => client.get(`/api/analysis/${id}/`)

export const getAnalysisStatus = (id) => client.get(`/api/analysis/${id}/status/`)

export const getChatMessages = (id) => client.get(`/api/analysis/${id}/chat/`)

export const sendChatMessage = (id, content) =>
  client.post(`/api/analysis/${id}/chat/`, { content })

export const exportPDF = (id) => client.get(`/api/analysis/${id}/pdf/`)

export const exportPPTX = (id) => client.get(`/api/analysis/${id}/pptx/`)
