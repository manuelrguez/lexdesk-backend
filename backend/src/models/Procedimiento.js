// ── procedimiento.model.js ────────────────────────────────────
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Procedimiento = sequelize.define('Procedimiento', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  numero:      { type: DataTypes.STRING(50), allowNull: false },
  tipo:        DataTypes.STRING(100),
  juzgado:     DataTypes.TEXT,
  estado:      { type: DataTypes.STRING(50), defaultValue: 'En curso' },
  proxima_act: DataTypes.DATEONLY,
  cliente_id:  DataTypes.UUID
}, {
  tableName: 'procedimientos', schema: 'public', timestamps: true,
  createdAt: 'created_at', updatedAt: 'updated_at'
})

module.exports = Procedimiento