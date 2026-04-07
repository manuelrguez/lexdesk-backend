const router = require('express').Router()
const ctrl   = require('../controllers/whatsapp.controller')
const auth   = require('../middleware/auth.middleware')

// Webhook público — Twilio no envía JWT
router.post('/webhook', ctrl.webhook)

// Rutas protegidas — desde la UI
router.post('/send',          auth, ctrl.sendManual)
router.post('/daily-summary', auth, ctrl.sendDailySummary)

module.exports = router