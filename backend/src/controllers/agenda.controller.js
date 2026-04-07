const { sequelize } = require('../config/database')

async function getAll(req, res, next) {
  try {
    const [eventos] = await sequelize.query(`
      SELECT e.*,
        p.numero AS proc_numero,
        json_agg(DISTINCT jsonb_build_object(
          'id', u.id, 'name', u.name, 'color', u.color, 'short', u.short
        )) FILTER (WHERE u.id IS NOT NULL) AS usuarios
      FROM eventos e
      LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
      LEFT JOIN evento_usuarios eu ON eu.evento_id = e.id
      LEFT JOIN users u ON u.id = eu.user_id
      GROUP BY e.id, p.numero
      ORDER BY e.fecha ASC, e.hora ASC
    `)
    res.json(eventos)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const [rows] = await sequelize.query(`
      SELECT e.*,
        p.numero AS proc_numero,
        json_agg(DISTINCT jsonb_build_object(
          'id', u.id, 'name', u.name, 'color', u.color, 'short', u.short
        )) FILTER (WHERE u.id IS NOT NULL) AS usuarios
      FROM eventos e
      LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
      LEFT JOIN evento_usuarios eu ON eu.evento_id = e.id
      LEFT JOIN users u ON u.id = eu.user_id
      WHERE e.id = :id
      GROUP BY e.id, p.numero
    `, { replacements: { id: req.params.id } })
    if (!rows[0]) return res.status(404).json({ error: 'Evento no encontrado' })
    res.json(rows[0])
  } catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const { titulo, tipo, fecha, hora, user_ids, procedimiento_id, notas } = req.body
    if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' })
    if (!fecha)  return res.status(400).json({ error: 'La fecha es obligatoria' })

    // user_ids puede ser array o string único — normalizar
    const uids = Array.isArray(user_ids)
      ? user_ids
      : user_ids ? [user_ids] : [req.user.id]

    const [rows] = await sequelize.query(`
      INSERT INTO eventos (titulo, tipo, fecha, hora, user_id, procedimiento_id, notas)
      VALUES (:titulo, :tipo, :fecha, :hora, :user_id, :procedimiento_id, :notas)
      RETURNING *
    `, { replacements: {
        titulo, tipo: tipo || 'reunion', fecha,
        hora: hora || null, user_id: uids[0],
        procedimiento_id: procedimiento_id || null,
        notas: notas || null,
    }})

    const eventoId = rows[0].id

    // Insertar relaciones evento_usuarios
    for (const uid of uids) {
      await sequelize.query(
        `INSERT INTO evento_usuarios (evento_id, user_id) VALUES (:eid, :uid) ON CONFLICT DO NOTHING`,
        { replacements: { eid: eventoId, uid } }
      )
    }

    const [full] = await sequelize.query(`
      SELECT e.*, p.numero AS proc_numero,
        json_agg(DISTINCT jsonb_build_object(
          'id', u.id, 'name', u.name, 'color', u.color, 'short', u.short
        )) FILTER (WHERE u.id IS NOT NULL) AS usuarios
      FROM eventos e
      LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
      LEFT JOIN evento_usuarios eu ON eu.evento_id = e.id
      LEFT JOIN users u ON u.id = eu.user_id
      WHERE e.id = :id
      GROUP BY e.id, p.numero
    `, { replacements: { id: eventoId } })

    res.status(201).json(full[0])
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const { titulo, tipo, fecha, hora, user_ids, procedimiento_id, notas } = req.body

    const uids = Array.isArray(user_ids)
      ? user_ids
      : user_ids ? [user_ids] : null

    await sequelize.query(`
      UPDATE eventos
      SET titulo = :titulo, tipo = :tipo, fecha = :fecha, hora = :hora,
          user_id = :user_id, procedimiento_id = :procedimiento_id,
          notas = :notas, updated_at = NOW()
      WHERE id = :id
    `, { replacements: {
        id: req.params.id, titulo, tipo: tipo || 'reunion', fecha,
        hora: hora || null, user_id: uids ? uids[0] : req.user.id,
        procedimiento_id: procedimiento_id || null, notas: notas || null,
    }})

    if (uids) {
      await sequelize.query(
        `DELETE FROM evento_usuarios WHERE evento_id = :id`,
        { replacements: { id: req.params.id } }
      )
      for (const uid of uids) {
        await sequelize.query(
          `INSERT INTO evento_usuarios (evento_id, user_id) VALUES (:eid, :uid) ON CONFLICT DO NOTHING`,
          { replacements: { eid: req.params.id, uid } }
        )
      }
    }

    const [full] = await sequelize.query(`
      SELECT e.*, p.numero AS proc_numero,
        json_agg(DISTINCT jsonb_build_object(
          'id', u.id, 'name', u.name, 'color', u.color, 'short', u.short
        )) FILTER (WHERE u.id IS NOT NULL) AS usuarios
      FROM eventos e
      LEFT JOIN procedimientos p ON p.id = e.procedimiento_id
      LEFT JOIN evento_usuarios eu ON eu.evento_id = e.id
      LEFT JOIN users u ON u.id = eu.user_id
      WHERE e.id = :id
      GROUP BY e.id, p.numero
    `, { replacements: { id: req.params.id } })

    res.json(full[0])
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    await sequelize.query('DELETE FROM eventos WHERE id = :id',
      { replacements: { id: req.params.id } })
    res.json({ message: 'Evento eliminado' })
  } catch (err) { next(err) }
}

module.exports = { getAll, getOne, create, update, remove }