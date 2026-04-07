const twilio   = require('twilio')
const { sendMessage } = require('../services/whatsapp.service')
const { sequelize }   = require('../config/database')
const { classifyEmail, summarizeEmail } = require('../services/claude.service')

// ─── Webhook — recibe mensajes entrantes de WhatsApp ──────────────────────────
async function webhook(req, res) {
  // Validar firma Twilio (seguridad)
  const signature = req.headers['x-twilio-signature'] || ''
  const url       = `${process.env.FRONTEND_URL?.replace('5173','3001') || 'http://localhost:3001'}/api/v1/whatsapp/webhook`

  try {
    const valid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      req.body
    )
    // En desarrollo con ngrok a veces falla la validación — seguimos igualmente
    if (!valid) console.warn('⚠ Twilio signature inválida — continuando en dev')
  } catch { /* silencioso en dev */ }

  const from = req.body.From  // whatsapp:+34...
  const body = (req.body.Body || '').trim().toLowerCase()

  console.log(`📱 WhatsApp de ${from}: ${body}`)

  try {
    let respuesta = ''

    if (body.includes('hola') || body.includes('ayuda') || body === 'menu') {
      respuesta = `⚖ *LexDesk Pro — Asistente Jurídico*\n\nComandos disponibles:\n\n📅 *eventos* — Próximos señalamientos\n📄 *documentos* — Últimos documentos\n💶 *facturas* — Facturas pendientes\n📊 *resumen* — Resumen del día\n❓ *ayuda* — Este menú`

    } else if (body.includes('evento') || body.includes('agenda') || body.includes('juicio')) {
      const [eventos] = await sequelize.query(`
        SELECT e.titulo, e.tipo, e.fecha, e.hora, p.numero AS proc
        FROM eventos e
        LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
        WHERE e.fecha >= CURRENT_DATE AND e.fecha <= CURRENT_DATE + INTERVAL '14 days'
        ORDER BY e.fecha ASC, e.hora ASC
        LIMIT 5
      `)
      if (eventos.length === 0) {
        respuesta = '📅 No hay eventos en los próximos 14 días.'
      } else {
        const tipoI = { juicio: '⚖', plazo: '⏰', señalamiento: '📋', reunion: '👥', otro: '📌' }
        respuesta = '📅 *Próximos eventos (14 días):*\n\n' + eventos.map(e => {
          const fecha = new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          return `${tipoI[e.tipo] || '📌'} *${e.titulo}*\n   📆 ${fecha} · ${e.hora?.slice(0,5) || '—'}h${e.proc ? `\n   #${e.proc}` : ''}`
        }).join('\n\n')
      }

    } else if (body.includes('factura') || body.includes('cobro') || body.includes('pendiente')) {
      const [facturas] = await sequelize.query(`
        SELECT f.numero, f.total, f.estado, c.nombre AS cliente
        FROM facturas f
        LEFT JOIN clientes c ON c.id = f.cliente_id
        WHERE f.estado != 'Pagada'
        ORDER BY f.fecha DESC
        LIMIT 5
      `)
      const total = facturas.reduce((a, f) => a + Number(f.total), 0)
      if (facturas.length === 0) {
        respuesta = '💶 No hay facturas pendientes de cobro.'
      } else {
        respuesta = `💶 *Facturas pendientes:*\n\n` +
          facturas.map(f => `• *${f.numero}* — ${Number(f.total).toLocaleString('es-ES')} €\n  ${f.cliente || '—'} · _${f.estado}_`).join('\n\n') +
          `\n\n💰 *Total pendiente: ${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €*`
      }

    } else if (body.includes('documento')) {
      const [docs] = await sequelize.query(`
        SELECT d.nombre, d.tipo, c.nombre AS cliente
        FROM documentos d
        LEFT JOIN clientes c ON c.id = d.cliente_id
        ORDER BY d.created_at DESC
        LIMIT 5
      `)
      if (docs.length === 0) {
        respuesta = '📄 No hay documentos archivados.'
      } else {
        respuesta = '📄 *Últimos documentos:*\n\n' +
          docs.map(d => `• *${d.nombre}*\n  ${d.tipo} · ${d.cliente || '—'}`).join('\n\n')
      }

    } else if (body.includes('resumen')) {
      // Resumen del día con IA
      const [eventos] = await sequelize.query(`
        SELECT e.titulo, e.tipo FROM eventos e
        WHERE fecha = CURRENT_DATE ORDER BY hora ASC
      `)
      const [factPend] = await sequelize.query(`
        SELECT COUNT(*) AS cnt, COALESCE(SUM(total),0) AS total
        FROM facturas WHERE estado != 'Pagada'
      `)
      const [docs] = await sequelize.query(`
        SELECT COUNT(*) AS cnt FROM documentos
        WHERE created_at::date = CURRENT_DATE
      `)

      const contexto = [
        eventos.length > 0 ? `Eventos hoy: ${eventos.map(e => e.titulo).join(', ')}` : 'Sin eventos hoy',
        `Facturas pendientes: ${factPend[0].cnt} (${Number(factPend[0].total).toLocaleString('es-ES')} €)`,
        `Documentos subidos hoy: ${docs[0].cnt}`,
      ]
      try {
        respuesta = await require('../services/claude.service').summarizeEmail(
          contexto.map(c => ({ subject: c, from: 'sistema', tipo: 'otro' }))
        )
      } catch {
        respuesta = `⚖ *Resumen LexDesk*\n\n${contexto.join('\n')}`
      }

    } else {
      // Respuesta IA libre para cualquier consulta
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const client = new (require('@anthropic-ai/sdk'))({ apiKey: process.env.ANTHROPIC_API_KEY })

        // Contexto del despacho
        const [clientes] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM clientes`)
        const [eventos]  = await sequelize.query(`SELECT COUNT(*) AS cnt FROM eventos WHERE fecha >= CURRENT_DATE AND fecha <= CURRENT_DATE + INTERVAL '7 days'`)

        const msg = await client.messages.create({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 300,
          system:     `Eres el asistente jurídico IA de LexDesk Pro, un despacho de abogados español. Responde de forma concisa y útil en formato WhatsApp. El despacho tiene ${clientes[0].cnt} clientes y ${eventos[0].cnt} eventos esta semana.`,
          messages:   [{ role: 'user', content: req.body.Body }],
        })
        respuesta = msg.content[0].text
      } catch {
        respuesta = '⚖ LexDesk Pro\n\nNo entendí tu consulta. Escribe *ayuda* para ver los comandos disponibles.'
      }
    }

    await sendMessage(from, respuesta)
    res.status(200).send('<Response></Response>')
  } catch (err) {
    console.error('Error webhook WhatsApp:', err.message)
    res.status(200).send('<Response></Response>')
  }
}

// ─── Enviar resumen diario manualmente ───────────────────────────────────────
async function sendDailySummary(req, res, next) {
  try {
    const resultado = await require('../services/whatsapp.service').sendToAll(
      await buildDailySummary()
    )
    res.json({ ok: true, enviado: resultado.length })
  } catch (err) { next(err) }
}

// ─── Enviar mensaje manual desde la UI ───────────────────────────────────────
async function sendManual(req, res, next) {
  try {
    const { to, message } = req.body
    if (!to || !message) return res.status(400).json({ error: 'Faltan to y message' })
    await sendMessage(to, message)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

// ─── Construir resumen diario ─────────────────────────────────────────────────
async function buildDailySummary() {
  const [eventos] = await sequelize.query(`
    SELECT e.titulo, e.tipo, e.hora, p.numero AS proc
    FROM eventos e
    LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
    WHERE e.fecha = CURRENT_DATE OR (e.fecha > CURRENT_DATE AND e.fecha <= CURRENT_DATE + INTERVAL '3 days')
    ORDER BY e.fecha ASC, e.hora ASC
    LIMIT 5
  `)
  const [factPend] = await sequelize.query(`
    SELECT COUNT(*) AS cnt, COALESCE(SUM(total),0) AS total FROM facturas WHERE estado != 'Pagada'
  `)

  const tipoI = { juicio: '⚖', plazo: '⏰', señalamiento: '📋', reunion: '👥', otro: '📌' }
  const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  let msg = `⚖ *LexDesk Pro — ${fecha}*\n\n`

  if (eventos.length > 0) {
    msg += `📅 *Próximos eventos:*\n`
    eventos.forEach(e => {
      msg += `${tipoI[e.tipo] || '📌'} ${e.titulo}${e.hora ? ` (${e.hora.slice(0,5)}h)` : ''}\n`
    })
    msg += '\n'
  } else {
    msg += '📅 Sin eventos próximos\n\n'
  }

  if (Number(factPend[0].cnt) > 0) {
    msg += `💶 *Pendiente de cobro:* ${Number(factPend[0].total).toLocaleString('es-ES', { minimumFractionDigits: 2 })} € (${factPend[0].cnt} facturas)\n\n`
  }

  msg += `_Responde *ayuda* para consultar datos del despacho_`
  return msg
}

module.exports = { webhook, sendDailySummary, sendManual, buildDailySummary }