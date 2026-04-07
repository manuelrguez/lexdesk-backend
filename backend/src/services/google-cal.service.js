const { google } = require('googleapis')

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// URL para que el usuario autorice el acceso
function getAuthUrl(userId) {
  const oauth2 = getOAuthClient()
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope:       ['https://www.googleapis.com/auth/calendar'],
    prompt:      'consent',
    state:       userId,   // ← pasamos el user_id para recuperarlo en el callback
  })
}

// Intercambiar código por tokens
async function getTokens(code) {
  const oauth2 = getOAuthClient()
  const { tokens } = await oauth2.getToken(code)
  return tokens
}

// Cliente autenticado con tokens guardados
function getAuthenticatedClient(tokens) {
  const oauth2 = getOAuthClient()
  oauth2.setCredentials(tokens)
  return oauth2
}

// Crear evento en Google Calendar
async function createEvent(tokens, evento) {
  const auth     = getAuthenticatedClient(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const fechaInicio = `${evento.fecha}T${evento.hora || '09:00:00'}`
  const fechaFin    = `${evento.fecha}T${evento.hora_fin || addHour(evento.hora || '09:00:00')}`

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary:     evento.titulo,
      description: evento.notas || '',
      start:       { dateTime: fechaInicio, timeZone: 'Europe/Madrid' },
      end:         { dateTime: fechaFin,    timeZone: 'Europe/Madrid' },
      colorId:     tipoToColor(evento.tipo),
    },
  })
  return res.data
}

// Actualizar evento en Google Calendar
async function updateEvent(tokens, googleEventId, evento) {
  const auth     = getAuthenticatedClient(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const fechaInicio = `${evento.fecha}T${evento.hora || '09:00:00'}`
  const fechaFin    = `${evento.fecha}T${addHour(evento.hora || '09:00:00')}`

  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId:    googleEventId,
    requestBody: {
      summary:     evento.titulo,
      description: evento.notas || '',
      start:       { dateTime: fechaInicio, timeZone: 'Europe/Madrid' },
      end:         { dateTime: fechaFin,    timeZone: 'Europe/Madrid' },
      colorId:     tipoToColor(evento.tipo),
    },
  })
  return res.data
}

// Eliminar evento de Google Calendar
async function deleteEvent(tokens, googleEventId) {
  const auth     = getAuthenticatedClient(tokens)
  const calendar = google.calendar({ version: 'v3', auth })
  await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId })
}

// Listar eventos de Google Calendar (últimos 30 días + próximos 60)
async function listEvents(tokens) {
  const auth     = getAuthenticatedClient(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const timeMin = new Date()
  timeMin.setDate(timeMin.getDate() - 30)
  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 60)

  const res = await calendar.events.list({
    calendarId:   'primary',
    timeMin:      timeMin.toISOString(),
    timeMax:      timeMax.toISOString(),
    singleEvents: true,
    orderBy:      'startTime',
    maxResults:   100,
  })
  return res.data.items || []
}

// ── helpers ──────────────────────────────────────────────────────────────────
function addHour(time) {
  const [h, m] = time.split(':').map(Number)
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function tipoToColor(tipo) {
  const map = { juicio: '11', plazo: '6', señalamiento: '9', reunion: '2', otro: '8' }
  return map[tipo] || '1'
}

module.exports = { getAuthUrl, getTokens, getAuthenticatedClient,
                   createEvent, updateEvent, deleteEvent, listEvents }