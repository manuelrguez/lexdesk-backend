const router = require('express').Router()
const ctrl   = require('../controllers/documentos.controller')
const auth   = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')

router.get('/',                   auth, ctrl.getAll)
router.get('/cliente/:id',        auth, ctrl.getByCliente)
router.get('/:id/file',           auth, ctrl.getFile)
router.get('/:id/download',       auth, ctrl.downloadFile)
router.post('/upload',            auth, upload.single('file'), ctrl.upload)
router.put('/:id',                auth, ctrl.update)
router.delete('/:id',             auth, ctrl.remove)

module.exports = router