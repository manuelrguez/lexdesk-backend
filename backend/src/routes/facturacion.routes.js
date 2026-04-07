const router = require('express').Router()
const ctrl   = require('../controllers/facturacion.controller')
const auth   = require('../middleware/auth.middleware')

router.get('/',              auth, ctrl.getAll)
router.get('/:id',           auth, ctrl.getOne)
router.get('/:id/pdf',       auth, ctrl.exportPDF)
router.post('/',             auth, ctrl.create)
router.put('/:id',           auth, ctrl.update)
router.patch('/:id/estado',  auth, ctrl.updateEstado)
router.delete('/:id',        auth, ctrl.remove)

module.exports = router