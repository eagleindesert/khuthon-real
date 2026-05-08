import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { pathname } = window.location
      if (pathname !== '/login' && pathname !== '/signup') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
