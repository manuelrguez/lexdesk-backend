
// ── cliente.model.js ──────────────────────────────────────────
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Cliente = sequelize.define('Cliente', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre:    { type: DataTypes.STRING(200), allowNull: false },
  nif:       DataTypes.STRING(20),
  direccion: DataTypes.TEXT,
  telefono:  DataTypes.STRING(30),
  email:     DataTypes.STRING(255),
  user_id:   DataTypes.UUID,
  notas:     DataTypes.TEXT
}, {
  tableName: 'clientes', schema: 'public', timestamps: true,
  createdAt: 'created_at', updatedAt: 'updated_at'
})

module.exports = Cliente