const { sequelize } = require('../config/database')

async function getByCliente(req, res, next) {
  try {
    const [procs] = await sequelize.query(`
      SELECT * FROM procedimientos
      WHERE cliente_id = :clienteId
      ORDER BY created_at DESC
    `, { replacements: { clienteId: req.params.clienteId } })
    res.json(procs)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { cliente_id, numero, tipo, juzgado, estado, proxima_act } = req.body
    if (!cliente_id || !numero) 
      return res.status(400).json({ error: 'Cliente y número de procedimiento obligatorios' })
    const [rows] = await sequelize.query(`
      INSERT INTO procedimientos (cliente_id, numero, tipo, juzgado, estado, proxima_act)
      VALUES (:cliente_id, :numero, :tipo, :juzgado, :estado, :proxima_act)
      RETURNING *
    `, { replacements: {
        cliente_id, numero, tipo: tipo||null,
        juzgado: juzgado||null,
        estado: estado||'En curso',
        proxima_act: proxima_act||null
    }})
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const { numero, tipo, juzgado, estado, proxima_act } = req.body
    const [rows] = await sequelize.query(`
      UPDATE procedimientos
      SET numero=:numero, tipo=:tipo, juzgado=:juzgado,
          estado=:estado, proxima_act=:proxima_act, updated_at=NOW()
      WHERE id=:id RETURNING *
    `, { replacements: {
        id: req.params.id, numero, tipo: tipo||null,
        juzgado: juzgado||null, estado: estado||'En curso',
        proxima_act: proxima_act||null
    }})
    if (!rows[0]) return res.status(404).json({ error: 'Procedimiento no encontrado' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await sequelize.query('DELETE FROM procedimientos WHERE id = :id',
      { replacements: { id: req.params.id } })
    res.json({ message: 'Procedimiento eliminado' })
  } catch (err) { next(err) }
}

module.exports = { getByCliente, create, update, remove }