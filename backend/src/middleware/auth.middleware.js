const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  // Acepta token en header Authorization O en query param ?token=
  // (necesario para iframes y enlaces de descarga directa)
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.query.token

  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change_me_in_production')
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}