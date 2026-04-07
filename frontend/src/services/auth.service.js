import api from './api.js'

export const authService = {
  login:          (email, password) => api.post('/auth/login', { email, password }),
  logout:         ()                => api.post('/auth/logout'),
  getUsers:       ()                => api.get('/auth/users'),
  getProfile:     ()                => api.get('/auth/profile'),
  updateProfile:  (data)            => api.put('/auth/profile', data),
  changePassword: (data)            => api.put('/auth/password', data),
}