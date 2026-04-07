const router = require('express').Router()

router.use('/auth',           require('./auth.routes'))
router.use('/dashboard',      require('./dashboard.routes'))
router.use('/clientes',       require('./clientes.routes'))
router.use('/procedimientos', require('./procedimientos.routes'))
router.use('/documentos',     require('./documentos.routes'))
router.use('/correo',         require('./correo.routes'))
router.use('/agenda',         require('./agenda.routes'))
router.use('/facturacion',    require('./facturacion.routes'))
router.use('/whatsapp',       require('./whatsapp.routes'))
router.use('/google',         require('./google-cal.routes'))
router.use('/lexnet',         require('./lexnet.routes'))

module.exports = router