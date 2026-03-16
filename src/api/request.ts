import axios from 'axios'

const API_BASE_URL = '/api'

export const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('youpai-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('youpai-token')
      localStorage.removeItem('youpai-auth')
      window.location.href = '/'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default request
