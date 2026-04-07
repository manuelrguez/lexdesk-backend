import api from './api.js'

export const whatsappService = {
  sendManual:     (to, message)  => api.post('/whatsapp/send', { to, message }),
  sendSummary:    ()             => api.post('/whatsapp/daily-summary'),
}