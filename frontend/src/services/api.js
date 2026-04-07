import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use(config => {
  const saved = localStorage.getItem('lexdesk_auth')
  if (saved) {
    const { token } = JSON.parse(saved)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const saved = localStorage.getItem('lexdesk_auth')
      if (saved) {
        localStorage.removeItem('lexdesk_auth')
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api