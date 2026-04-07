const router = require('express').Router()
const ctrl   = require('../controllers/dashboard.controller')
const auth   = require('../middleware/auth.middleware')

router.get('/stats',     auth, ctrl.getStats)
router.get('/eventos',   auth, ctrl.getEventosProximos)
router.get('/actividad', auth, ctrl.getActividadReciente)

module.exports = router