const { fetchEmails, markSeen } = require('../services/imap.service')
const { summarizeEmail, classifyEmail } = require('../services/claude.service')
const { sequelize } = require('../config/database')
const path = require('path')
const fs   = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')

// GET /correo — leer bandeja de entrada
async function getAll(req, res, next) {
  try {
    const emails = await fetchEmails(50)
    res.json(emails)
  } catch (err) {
    console.error('Error IMAP:', err.message)
    res.status(500).json({ error: 'Error conectando al servidor de correo', detail: err.message })
  }
}

// POST /correo/:uid/seen — marcar como leído
async function markAsRead(req, res, next) {
  try {
    await markSeen(parseInt(req.params.uid))
    res.json({ ok: true })
  } catch (err) { next(err) }
}

// POST /correo/:uid/classify — clasificar con IA
async function classify(req, res, next) {
  try {
    const { subject, from, text } = req.body
    const result = await classifyEmail(subject, from, text)
    res.json(result)
  } catch (err) { next(err) }
}

// POST /correo/:uid/summarize — resumir con IA para WhatsApp
async function summarize(req, res, next) {
  try {
    const { emails } = req.body   // array de { subject, from, date, tipo }
    const result = await summarizeEmail(emails)
    res.json({ resumen: result })
  } catch (err) { next(err) }
}

// POST /correo/archive-attachment — guardar PDF adjunto en gestor documental
async function archiveAttachment(req, res, next) {
  try {
    const { filename, content, uid } = req.body
    if (!filename || !content) return res.status(400).json({ error: 'Faltan datos' })

    // Guardar en disco
    const ts       = Date.now()
    const safe     = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const diskName = `${ts}_${safe}`
    const filePath = path.join(uploadDir, diskName)

    fs.writeFileSync(filePath, Buffer.from(content, 'base64'))
    const sizeKb = Math.round(fs.statSync(filePath).size / 1024)

    // Clasificar con IA
    const { classifyDocument } = require('../services/claude.service')
    let iaMeta = null
    try { iaMeta = await classifyDocument(filename, sizeKb) } catch { /* sin IA */ }

    // Buscar cliente si la IA lo detectó
    let clienteId = null, procedimientoId = null
    if (iaMeta?.cliente) {
      const [rows] = await sequelize.query(
        `SELECT id FROM clientes WHERE nombre ILIKE :n LIMIT 1`,
        { replacements: { n: `%${iaMeta.cliente.split(' ')[0]}%` } }
      )
      if (rows[0]) clienteId = rows[0].id
    }
    if (iaMeta?.procedimiento && clienteId) {
      const [rows] = await sequelize.query(
        `SELECT id FROM procedimientos WHERE numero ILIKE :n AND cliente_id = :cid LIMIT 1`,
        { replacements: { n: `%${iaMeta.procedimiento}%`, cid: clienteId } }
      )
      if (rows[0]) procedimientoId = rows[0].id
    }

    const [inserted] = await sequelize.query(`
      INSERT INTO documentos (nombre, tipo, tamanyo_kb, s3_key, cliente_id, procedimiento_id, user_id, ia_metadata)
      VALUES (:nombre, :tipo, :tamanyo_kb, :s3_key, :cliente_id, :procedimiento_id, :user_id, :ia_metadata)
      RETURNING *
    `, { replacements: {
        nombre:           filename,
        tipo:             iaMeta?.tipo || 'Documento',
        tamanyo_kb:       sizeKb,
        s3_key:           diskName,
        cliente_id:       clienteId,
        procedimiento_id: procedimientoId,
        user_id:          req.user.id,
        ia_metadata:      iaMeta ? JSON.stringify(iaMeta) : null,
    }})

    res.status(201).json({ documento: inserted[0], ia: iaMeta })
  } catch (err) { next(err) }
}

module.exports = { getAll, markAsRead, classify, summarize, archiveAttachment }