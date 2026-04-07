import api from './api.js'

export const correoService = {
  getAll:             ()           => api.get('/correo'),
  markSeen:           (uid)        => api.post(`/correo/${uid}/seen`),
  classify:           (uid, data)  => api.post(`/correo/${uid}/classify`, data),
  summarize:          (emails)     => api.post('/correo/summarize', { emails }),
  archiveAttachment:  (data)       => api.post('/correo/archive-attachment', data),
}