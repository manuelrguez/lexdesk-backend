// ── evento.model.js ───────────────────────────────────────────
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Evento = sequelize.define('Evento', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  titulo:          { type: DataTypes.STRING(255), allowNull: false },
  tipo:            DataTypes.STRING(50),
  fecha:           { type: DataTypes.DATEONLY, allowNull: false },
  hora:            DataTypes.TIME,
  user_id:         DataTypes.UUID,
  procedimiento_id:DataTypes.UUID,
  google_event_id: DataTypes.STRING(255),
  notas:           DataTypes.TEXT
}, {
  tableName: 'eventos', schema: 'public', timestamps: true,
  createdAt: 'created_at', updatedAt: 'updated_at'
})

module.exports = Evento