import api from './api.js'

export const procedimientosService = {
  getByCliente: (clienteId) => api.get(`/procedimientos/cliente/${clienteId}`),
  create:       (data)      => api.post('/procedimientos', data),
  update:       (id, data)  => api.put(`/procedimientos/${id}`, data),
  remove:       (id)        => api.delete(`/procedimientos/${id}`),
}