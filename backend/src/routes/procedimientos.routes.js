const router = require('express').Router()
const ctrl   = require('../controllers/procedimientos.controller')
const auth   = require('../middleware/auth.middleware')

router.get('/cliente/:clienteId', auth, ctrl.getByCliente)
router.post('/',                  auth, ctrl.create)
router.put('/:id',                auth, ctrl.update)
router.delete('/:id',             auth, ctrl.remove)

module.exports = router