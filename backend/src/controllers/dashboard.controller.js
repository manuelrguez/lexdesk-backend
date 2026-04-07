const { sequelize } = require('../config/database')
const { fetchEmails } = require('../services/imap.service')

async function getStats(req, res, next) {
  try {
    // Clientes activos
    const [[{ total_clientes }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_clientes FROM clientes`
    )

    // Procedimientos activos
    const [[{ total_procedimientos }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_procedimientos FROM procedimientos WHERE estado != 'Archivado'`
    )

    // Documentos
    const [[{ total_documentos }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_documentos FROM documentos`
    )

    // Eventos próximos (30 días)
    const [[{ total_eventos }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_eventos FROM eventos
       WHERE fecha >= CURRENT_DATE AND fecha <= CURRENT_DATE + INTERVAL '30 days'`
    )

    // Facturas pendientes de cobro
    const [[{ total_pendiente }]] = await sequelize.query(
      `SELECT COALESCE(SUM(total), 0) AS total_pendiente FROM facturas WHERE estado != 'Pagada'`
    )

    // Correos sin leer (IMAP) — con timeout para no bloquear
    let correos_sin_leer = 0
    try {
      const emails = await Promise.race([
        fetchEmails(50),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
      ])
      correos_sin_leer = emails.filter(e => !e.seen).length
    } catch { correos_sin_leer = null } // null = no disponible

    res.json({
      clientes:          parseInt(total_clientes),
      procedimientos:    parseInt(total_procedimientos),
      documentos:        parseInt(total_documentos),
      eventos_proximos:  parseInt(total_eventos),
      pendiente_cobro:   parseFloat(total_pendiente),
      correos_sin_leer,
    })
  } catch (err) { next(err) }
}

async function getEventosProximos(req, res, next) {
  try {
    const [eventos] = await sequelize.query(`
      SELECT DISTINCT e.*, u.name AS user_name, u.color AS user_color, u.short AS user_short,
        p.numero AS proc_numero, c.nombre AS cliente_nombre,
        array_agg(DISTINCT eu.user_id) FILTER (WHERE eu.user_id IS NOT NULL) AS user_ids
      FROM eventos e
      LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN evento_usuarios eu ON eu.evento_id = e.id
      WHERE e.fecha >= CURRENT_DATE
        AND e.fecha <= CURRENT_DATE + INTERVAL '30 days'
        AND (e.user_id IS NOT NULL OR eu.user_id IS NOT NULL)
      GROUP BY e.id, u.name, u.color, u.short, p.numero, c.nombre
      ORDER BY e.fecha ASC, e.hora ASC
      LIMIT 50
    `)
    res.json(eventos)
  } catch (err) { next(err) }
}

async function getActividadReciente(req, res, next) {
  try {
    // Últimas 5 facturas
    const [facturas] = await sequelize.query(`
      SELECT f.id, f.numero, f.total, f.estado, f.fecha, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      ORDER BY f.fecha DESC LIMIT 5
    `)

    // Últimos 5 documentos
    const [documentos] = await sequelize.query(`
      SELECT d.id, d.nombre, d.tipo, d.created_at, c.nombre AS cliente_nombre
      FROM documentos d
      LEFT JOIN clientes c ON c.id = d.cliente_id
      ORDER BY d.created_at DESC LIMIT 5
    `)

    res.json({ facturas, documentos })
  } catch (err) { next(err) }
}

module.exports = { getStats, getEventosProximos, getActividadReciente }