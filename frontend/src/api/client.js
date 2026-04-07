import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://pitchiq-backend-xsyd.onrender.com'

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh/`,
            { refresh }
          )
          localStorage.setItem('access_token', res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return client(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default client
