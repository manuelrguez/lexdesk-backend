const { sequelize }  = require('../config/database')
const gcal           = require('../services/google-cal.service')

// GET /google/auth-url — obtener URL de autorización
async function getAuthUrl(req, res) {
  res.json({ url: gcal.getAuthUrl(req.user.id) })
}

// GET /google/callback — recibir código y guardar tokens
async function callback(req, res, next) {
  try {
    const { code, state } = req.query
    const tokens = await gcal.getTokens(code)

    // Guardar tokens en el usuario (state contiene el user_id)
    const userId = state || req.user?.id
    if (userId) {
      await sequelize.query(
        'UPDATE users SET google_tokens = :tokens WHERE id = :id',
        { replacements: { tokens: JSON.stringify(tokens), id: userId } }
      )
    }

    // Redirigir al frontend con éxito
    res.redirect(`${process.env.FRONTEND_URL}?google_connected=1`)
  } catch (err) { next(err) }
}

// GET /google/status — verificar si el usuario tiene tokens
async function getStatus(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      'SELECT google_tokens FROM users WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    const tokens = rows[0]?.google_tokens
    res.json({ connected: !!tokens, hasRefreshToken: !!tokens?.refresh_token })
  } catch (err) { next(err) }
}

// DELETE /google/disconnect — desconectar Google Calendar
async function disconnect(req, res, next) {
  try {
    await sequelize.query(
      'UPDATE users SET google_tokens = NULL WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
}

// POST /google/sync-event — sincronizar un evento concreto
async function syncEvent(req, res, next) {
  try {
    const { evento_id, action } = req.body  // action: 'create' | 'update' | 'delete'

    const [rows] = await sequelize.query(
      'SELECT google_tokens FROM users WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    const tokens = rows[0]?.google_tokens
    if (!tokens) return res.status(400).json({ error: 'Google Calendar no conectado' })

    const [evRows] = await sequelize.query(
      'SELECT * FROM eventos WHERE id = :id',
      { replacements: { id: evento_id } }
    )
    const evento = evRows[0]
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' })

    if (action === 'delete' && evento.google_event_id) {
      await gcal.deleteEvent(tokens, evento.google_event_id)
      await sequelize.query(
        'UPDATE eventos SET google_event_id = NULL WHERE id = :id',
        { replacements: { id: evento_id } }
      )
      return res.json({ ok: true })
    }

    if (action === 'update' && evento.google_event_id) {
      await gcal.updateEvent(tokens, evento.google_event_id, evento)
      return res.json({ ok: true })
    }

    // create (o update sin google_event_id → crear nuevo)
    const gEvent = await gcal.createEvent(tokens, evento)
    await sequelize.query(
      'UPDATE eventos SET google_event_id = :gid WHERE id = :id',
      { replacements: { gid: gEvent.id, id: evento_id } }
    )
    res.json({ ok: true, google_event_id: gEvent.id })
  } catch (err) { next(err) }
}

// POST /google/sync-all — sincronizar todos los eventos del usuario
async function syncAll(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      'SELECT google_tokens FROM users WHERE id = :id',
      { replacements: { id: req.user.id } }
    )
    const tokens = rows[0]?.google_tokens
    if (!tokens) return res.status(400).json({ error: 'Google Calendar no conectado' })

    const [eventos] = await sequelize.query(
      `SELECT * FROM eventos WHERE user_id = :uid AND fecha >= CURRENT_DATE`,
      { replacements: { uid: req.user.id } }
    )

    let creados = 0, actualizados = 0, errores = 0
    for (const ev of eventos) {
      try {
        if (ev.google_event_id) {
          await gcal.updateEvent(tokens, ev.google_event_id, ev)
          actualizados++
        } else {
          const gEvent = await gcal.createEvent(tokens, ev)
          await sequelize.query(
            'UPDATE eventos SET google_event_id = :gid WHERE id = :id',
            { replacements: { gid: gEvent.id, id: ev.id } }
          )
          creados++
        }
      } catch { errores++ }
    }

    res.json({ ok: true, creados, actualizados, errores })
  } catch (err) { next(err) }
}

module.exports = { getAuthUrl, callback, getStatus, disconnect, syncEvent, syncAll }