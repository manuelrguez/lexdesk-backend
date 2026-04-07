import api from './api.js'

export const clientesService = {
  getAll:            ()           => api.get('/clientes'),
  getOne:            (id)         => api.get(`/clientes/${id}`),
  create:            (data)       => api.post('/clientes', data),
  update:            (id, data)   => api.put(`/clientes/${id}`, data),
  remove:            (id)         => api.delete(`/clientes/${id}`),
  getProcedimientos: (id)         => api.get(`/clientes/${id}/procedimientos`),
}