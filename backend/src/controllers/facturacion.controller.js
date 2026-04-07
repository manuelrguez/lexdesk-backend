const { sequelize } = require('../config/database')

async function getAll(req, res, next) {
  try {
    const [facturas] = await sequelize.query(`
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      ORDER BY f.fecha DESC, f.numero DESC
    `)
    res.json(facturas)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const [rows] = await sequelize.query(`
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = :id
    `, { replacements: { id: req.params.id } })
    if (!rows[0]) return res.status(404).json({ error: 'Factura no encontrada' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { cliente_id, concepto, base, estado, fecha } = req.body
    if (!concepto) return res.status(400).json({ error: 'El concepto es obligatorio' })
    if (!base)     return res.status(400).json({ error: 'La base imponible es obligatoria' })

    const baseNum = parseFloat(base)
    const ivaNum  = parseFloat((baseNum * 0.21).toFixed(2))
    const total   = parseFloat((baseNum + ivaNum).toFixed(2))

    // Generar número de factura automático: F{AÑO}-{NNN}
    const year = new Date().getFullYear()
    const [countRows] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM facturas WHERE numero LIKE :pattern`,
      { replacements: { pattern: `F${year}-%` } }
    )
    const next_num = String(parseInt(countRows[0].cnt) + 1).padStart(3, '0')
    const numero   = `F${year}-${next_num}`

    const [rows] = await sequelize.query(`
      INSERT INTO facturas (numero, cliente_id, concepto, base, iva, total, estado, fecha)
      VALUES (:numero, :cliente_id, :concepto, :base, :iva, :total, :estado, :fecha)
      RETURNING *
    `, { replacements: {
        numero,
        cliente_id: cliente_id || null,
        concepto,
        base:       baseNum,
        iva:        ivaNum,
        total,
        estado:     estado || 'Emitida',
        fecha:      fecha  || new Date().toISOString().slice(0,10),
    }})

    const [full] = await sequelize.query(`
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = :id
    `, { replacements: { id: rows[0].id } })

    res.status(201).json(full[0])
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const { cliente_id, concepto, base, estado, fecha } = req.body

    const baseNum = parseFloat(base)
    const ivaNum  = parseFloat((baseNum * 0.21).toFixed(2))
    const total   = parseFloat((baseNum + ivaNum).toFixed(2))

    const [rows] = await sequelize.query(`
      UPDATE facturas
      SET cliente_id = :cliente_id,
          concepto   = :concepto,
          base       = :base,
          iva        = :iva,
          total      = :total,
          estado     = :estado,
          fecha      = :fecha
      WHERE id = :id
      RETURNING *
    `, { replacements: {
        id:         req.params.id,
        cliente_id: cliente_id || null,
        concepto,
        base:       baseNum,
        iva:        ivaNum,
        total,
        estado,
        fecha,
    }})

    if (!rows[0]) return res.status(404).json({ error: 'Factura no encontrada' })

    const [full] = await sequelize.query(`
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = :id
    `, { replacements: { id: req.params.id } })

    res.json(full[0])
  } catch (err) { next(err) }
}

async function updateEstado(req, res, next) {
  try {
    const { estado } = req.body
    const [rows] = await sequelize.query(`
      UPDATE facturas SET estado = :estado WHERE id = :id RETURNING *
    `, { replacements: { id: req.params.id, estado } })
    if (!rows[0]) return res.status(404).json({ error: 'Factura no encontrada' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await sequelize.query('DELETE FROM facturas WHERE id = :id',
      { replacements: { id: req.params.id } })
    res.json({ message: 'Factura eliminada' })
  } catch (err) { next(err) }
}

async function exportPDF(req, res, next) {
  try {
    const [rows] = await sequelize.query(`
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = :id
    `, { replacements: { id: req.params.id } })

    if (!rows[0]) return res.status(404).json({ error: 'Factura no encontrada' })

    const { generateFacturaPDF } = require('../services/pdf.service')
    const pdf = await generateFacturaPDF(rows[0])

    const filename = `Factura_${rows[0].numero}.pdf`
    res.writeHead(200, {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      pdf.length,
      'Cache-Control':       'no-cache',
    })
    res.end(pdf, 'binary')
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, updateEstado, remove, exportPDF }