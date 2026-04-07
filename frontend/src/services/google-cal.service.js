import api from './api.js'

export const googleCalService = {
  getAuthUrl:   ()          => api.get('/google/auth-url'),
  getStatus:    ()          => api.get('/google/status'),
  disconnect:   ()          => api.delete('/google/disconnect'),
  syncEvent:    (id, action) => api.post('/google/sync-event', { evento_id: id, action }),
  syncAll:      ()          => api.post('/google/sync-all'),
}