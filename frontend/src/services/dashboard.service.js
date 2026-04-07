import api from './api.js'

export const dashboardService = {
  getStats:     () => api.get('/dashboard/stats'),
  getEventos:   () => api.get('/dashboard/eventos'),
  getActividad: () => api.get('/dashboard/actividad'),
}