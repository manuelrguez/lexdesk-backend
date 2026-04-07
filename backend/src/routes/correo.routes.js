const router = require('express').Router()
const ctrl   = require('../controllers/correo.controller')
const auth   = require('../middleware/auth.middleware')

router.get('/',                      auth, ctrl.getAll)
router.post('/:uid/seen',            auth, ctrl.markAsRead)
router.post('/:uid/classify',        auth, ctrl.classify)
router.post('/summarize',            auth, ctrl.summarize)
router.post('/archive-attachment',   auth, ctrl.archiveAttachment)

module.exports = router