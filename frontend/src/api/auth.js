
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT to protected API requests.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData)
  return response.data
}

export const loginUser = async (userData) => {
  const response = await API.post('/auth/login', userData)
  return response.data
}

export default API
