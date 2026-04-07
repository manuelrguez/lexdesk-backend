import api from './api.js'

export const agendaService = {
  getAll:  ()           => api.get('/agenda'),
  getOne:  (id)         => api.get(`/agenda/${id}`),
  create:  (data)       => api.post('/agenda', data),
  update:  (id, data)   => api.put(`/agenda/${id}`, data),
  remove:  (id)         => api.delete(`/agenda/${id}`),
}