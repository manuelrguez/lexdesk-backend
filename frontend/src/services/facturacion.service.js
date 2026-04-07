import api from './api.js'

export const facturacionService = {
  getAll:       ()             => api.get('/facturacion'),
  getOne:       (id)           => api.get(`/facturacion/${id}`),
  create:       (data)         => api.post('/facturacion', data),
  update:       (id, data)     => api.put(`/facturacion/${id}`, data),
  updateEstado: (id, estado)   => api.patch(`/facturacion/${id}/estado`, { estado }),
  remove:       (id)           => api.delete(`/facturacion/${id}`),
  exportPDF:    (id)           => api.get(`/facturacion/${id}/pdf`, { responseType: 'arraybuffer' }),
}