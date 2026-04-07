// ── factura.model.js ──────────────────────────────────────────
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Factura = sequelize.define('Factura', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  numero:     { type: DataTypes.STRING(30), allowNull: false, unique: true },
  cliente_id: DataTypes.UUID,
  concepto:   DataTypes.TEXT,
  base:       DataTypes.DECIMAL(12, 2),
  iva:        DataTypes.DECIMAL(12, 2),
  total:      DataTypes.DECIMAL(12, 2),
  estado:     { type: DataTypes.STRING(30), defaultValue: 'Emitida' },
  fecha:      { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
  tableName: 'facturas', schema: 'public', timestamps: true,
  createdAt: 'created_at', updatedAt: 'updated_at'
})

module.exports = Factura