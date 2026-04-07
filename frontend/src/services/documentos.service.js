import api from './api.js'

export const documentosService = {
  getAll:       ()             => api.get('/documentos'),
  getByCliente: (id)           => api.get(`/documentos/cliente/${id}`),
  upload:       (formData)     => api.post('/documentos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:       (id, data)     => api.put(`/documentos/${id}`, data),
  remove:       (id)           => api.delete(`/documentos/${id}`),

  // URL para iframe (preview) y descarga — el token se inyecta manualmente
  // porque axios no sirve bien para src= de iframe
  getFileUrl:   (id)  => `/api/v1/documentos/${id}/file`,
  getDownloadUrl: (id) => `/api/v1/documentos/${id}/download`,
}