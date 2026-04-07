const router = require('express').Router()
const ctrl   = require('../controllers/auth.controller')
const auth   = require('../middleware/auth.middleware')

router.post('/login',            ctrl.login)
router.post('/logout',           ctrl.logout)
router.get('/users',        auth, ctrl.getUsers)
router.get('/profile',      auth, ctrl.getProfile)
router.put('/profile',      auth, ctrl.updateProfile)
router.put('/password',     auth, ctrl.changePassword)

module.exports = router