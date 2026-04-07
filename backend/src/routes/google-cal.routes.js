const router = require('express').Router()
const ctrl   = require('../controllers/google-cal.controller')
const auth   = require('../middleware/auth.middleware')

router.get('/auth-url',    auth, ctrl.getAuthUrl)
router.get('/callback',         ctrl.callback)    // público — Google redirige aquí
router.get('/status',      auth, ctrl.getStatus)
router.delete('/disconnect', auth, ctrl.disconnect)
router.post('/sync-event', auth, ctrl.syncEvent)
router.post('/sync-all',   auth, ctrl.syncAll)

module.exports = router