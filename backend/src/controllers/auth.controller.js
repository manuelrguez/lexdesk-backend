const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { sequelize } = require('../config/database')

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña requeridos' })

    const [users] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } }
    )
    const user = users[0]
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'change_me_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color, short: user.short }
    })
  } catch (err) { next(err) }
}

function logout(req, res) {
  res.json({ message: 'Sesión cerrada' })
}

async function getUsers(req, res, next) {
  try {
    const [users] = await sequelize.query(
      'SELECT id, name, email, role, color, short FROM users ORDER BY name'
    )
    res.json(users)
  } catch (err) { next(err) }
}

async function getProfile(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      'SELECT id, name, email, role, color, short FROM users WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, color, short } = req.body
    if (!name || !email) return res.status(400).json({ error: 'Nombre y email son obligatorios' })

    const [rows] = await sequelize.query(`
      UPDATE users SET name = :name, email = :email, color = :color, short = :short, updated_at = NOW()
      WHERE id = :id RETURNING id, name, email, role, color, short
    `, { replacements: { id: req.user.id, name, email, color: color || '#C8A035', short: short || name.slice(0,2).toUpperCase() } })

    res.json(rows[0])
  } catch (err) { next(err) }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password)
      return res.status(400).json({ error: 'Faltan campos' })
    if (new_password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    const [rows] = await sequelize.query(
      'SELECT password FROM users WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    const valid = await bcrypt.compare(current_password, rows[0].password)
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' })

    const hashed = await bcrypt.hash(new_password, 10)
    await sequelize.query(
      'UPDATE users SET password = :password WHERE id = :id',
      { replacements: { password: hashed, id: req.user.id } }
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
}

module.exports = { login, logout, getUsers, getProfile, updateProfile, changePassword }