const { sequelize } = require('../config/database')

async function getAll(req, res, next) {
  try {
    const [clientes] = await sequelize.query(`
      SELECT c.*,
        json_agg(json_build_object(
          'id', p.id, 'numero', p.numero, 'tipo', p.tipo,
          'juzgado', p.juzgado, 'estado', p.estado, 'proxima_act', p.proxima_act
        )) FILTER (WHERE p.id IS NOT NULL) AS procedimientos
      FROM clientes c
      LEFT JOIN procedimientos p ON p.cliente_id = c.id
      GROUP BY c.id
      ORDER BY c.nombre
    `)
    res.json(clientes)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const [rows] = await sequelize.query(`
      SELECT c.*,
        json_agg(json_build_object(
          'id', p.id, 'numero', p.numero, 'tipo', p.tipo,
          'juzgado', p.juzgado, 'estado', p.estado, 'proxima_act', p.proxima_act
        )) FILTER (WHERE p.id IS NOT NULL) AS procedimientos
      FROM clientes c
      LEFT JOIN procedimientos p ON p.cliente_id = c.id
      WHERE c.id = :id
      GROUP BY c.id
    `, { replacements: { id: req.params.id } })
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function getProcedimientos(req, res, next) {
  try {
    const [rows] = await sequelize.query(`
      SELECT id, numero, tipo, juzgado, estado, proxima_act
      FROM procedimientos
      WHERE cliente_id = :id
      ORDER BY numero
    `, { replacements: { id: req.params.id } })
    res.json(rows)
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { nombre, nif, direccion, telefono, email, notas } = req.body
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
    const [rows] = await sequelize.query(`
      INSERT INTO clientes (nombre, nif, direccion, telefono, email, notas, user_id)
      VALUES (:nombre, :nif, :direccion, :telefono, :email, :notas, :user_id)
      RETURNING *
    `, { replacements: { nombre, nif: nif||null, direccion: direccion||null,
        telefono: telefono||null, email: email||null, notas: notas||null,
        user_id: req.user.id } })
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const { nombre, nif, direccion, telefono, email, notas } = req.body
    const [rows] = await sequelize.query(`
      UPDATE clientes SET nombre=:nombre, nif=:nif, direccion=:direccion,
        telefono=:telefono, email=:email, notas=:notas, updated_at=NOW()
      WHERE id=:id RETURNING *
    `, { replacements: { id: req.params.id, nombre, nif: nif||null,
        direccion: direccion||null, telefono: telefono||null,
        email: email||null, notas: notas||null } })
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await sequelize.query('DELETE FROM clientes WHERE id = :id',
      { replacements: { id: req.params.id } })
    res.json({ message: 'Cliente eliminado' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, getProcedimientos, create, update, remove }