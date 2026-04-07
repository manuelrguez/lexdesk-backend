const path     = require('path')
const fs       = require('fs')
const { sequelize } = require('../config/database')
const { classifyDocument } = require('../services/claude.service')

const uploadDir = path.join(__dirname, '../../uploads')

async function getAll(req, res, next) {
  try {
    const [docs] = await sequelize.query(`
      SELECT d.*, c.nombre AS cliente_nombre, p.numero AS proc_numero
      FROM documentos d
      LEFT JOIN clientes c ON c.id = d.cliente_id
      LEFT JOIN procedimientos p ON p.id = d.procedimiento_id
      ORDER BY d.created_at DESC
    `)
    res.json(docs)
  } catch (err) { next(err) }
}

async function getByCliente(req, res, next) {
  try {
    const [docs] = await sequelize.query(`
      SELECT d.*, p.numero AS proc_numero
      FROM documentos d
      LEFT JOIN procedimientos p ON p.id = d.procedimiento_id
      WHERE d.cliente_id = :id
      ORDER BY d.created_at DESC
    `, { replacements: { id: req.params.id } })
    res.json(docs)
  } catch (err) { next(err) }
}

// Servir el PDF desde disco
async function getFile(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      'SELECT s3_key, nombre FROM documentos WHERE id = :id',
      { replacements: { id: req.params.id } }
    )
    if (!rows[0]) return res.status(404).json({ error: 'Documento no encontrado' })

    const filePath = path.join(uploadDir, rows[0].s3_key)
    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: 'Archivo no encontrado en disco' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${rows[0].nombre}"`)
    fs.createReadStream(filePath).pipe(res)
  } catch (err) { next(err) }
}

// Descargar el PDF
async function downloadFile(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      'SELECT s3_key, nombre FROM documentos WHERE id = :id',
      { replacements: { id: req.params.id } }
    )
    if (!rows[0]) return res.status(404).json({ error: 'Documento no encontrado' })

    const filePath = path.join(uploadDir, rows[0].s3_key)
    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: 'Archivo no encontrado en disco' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].nombre}"`)
    fs.createReadStream(filePath).pipe(res)
  } catch (err) { next(err) }
}

async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' })

    const { originalname, size, filename } = req.file
    const sizeKb = Math.round(size / 1024)

    // Clasificación IA
    let iaMeta = null
    try {
      iaMeta = await classifyDocument(originalname, sizeKb)
    } catch (e) {
      console.error('Error OCR Claude:', e.message)
    }

    // Buscar cliente por nombre si la IA lo detectó
    let clienteId = req.body.cliente_id || null
    let procedimientoId = req.body.procedimiento_id || null

    if (!clienteId && iaMeta?.cliente) {
      const [rows] = await sequelize.query(
        `SELECT id FROM clientes WHERE nombre ILIKE :nombre LIMIT 1`,
        { replacements: { nombre: `%${iaMeta.cliente.split(' ')[0]}%` } }
      )
      if (rows[0]) clienteId = rows[0].id
    }

    if (!procedimientoId && iaMeta?.procedimiento && clienteId) {
      const [rows] = await sequelize.query(
        `SELECT id FROM procedimientos WHERE numero ILIKE :num AND cliente_id = :cid LIMIT 1`,
        { replacements: { num: `%${iaMeta.procedimiento}%`, cid: clienteId } }
      )
      if (rows[0]) procedimientoId = rows[0].id
    }

    const [inserted] = await sequelize.query(`
      INSERT INTO documentos (nombre, tipo, tamanyo_kb, s3_key, cliente_id, procedimiento_id, user_id, ia_metadata)
      VALUES (:nombre, :tipo, :tamanyo_kb, :s3_key, :cliente_id, :procedimiento_id, :user_id, :ia_metadata)
      RETURNING *
    `, { replacements: {
        nombre:           originalname,
        tipo:             iaMeta?.tipo || req.body.tipo || 'Documento',
        tamanyo_kb:       sizeKb,
        s3_key:           filename,
        cliente_id:       clienteId,
        procedimiento_id: procedimientoId,
        user_id:          req.user.id,
        ia_metadata:      iaMeta ? JSON.stringify(iaMeta) : null,
    }})

    res.status(201).json({ documento: inserted[0], ia: iaMeta })
  } catch (err) { next(err) }
}

// Editar tipo, cliente y procedimiento
async function update(req, res, next) {
  try {
    const { tipo, cliente_id, procedimiento_id } = req.body
    const [rows] = await sequelize.query(`
      UPDATE documentos
      SET tipo = :tipo,
          cliente_id = :cliente_id,
          procedimiento_id = :procedimiento_id
      WHERE id = :id
      RETURNING *
    `, { replacements: {
        id:               req.params.id,
        tipo:             tipo,
        cliente_id:       cliente_id || null,
        procedimiento_id: procedimiento_id || null,
    }})

    if (!rows[0]) return res.status(404).json({ error: 'Documento no encontrado' })

    // Devolver con joins
    const [updated] = await sequelize.query(`
      SELECT d.*, c.nombre AS cliente_nombre, p.numero AS proc_numero
      FROM documentos d
      LEFT JOIN clientes c ON c.id = d.cliente_id
      LEFT JOIN procedimientos p ON p.id = d.procedimiento_id
      WHERE d.id = :id
    `, { replacements: { id: req.params.id } })

    res.json(updated[0])
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    // Borrar archivo de disco también
    const [rows] = await sequelize.query(
      'SELECT s3_key FROM documentos WHERE id = :id',
      { replacements: { id: req.params.id } }
    )
    if (rows[0]?.s3_key) {
      const filePath = path.join(uploadDir, rows[0].s3_key)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await sequelize.query('DELETE FROM documentos WHERE id = :id',
      { replacements: { id: req.params.id } })
    res.json({ message: 'Documento eliminado' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getByCliente, getFile, downloadFile, upload, update, remove }