// ── documento.model.js ────────────────────────────────────────
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Documento = sequelize.define('Documento', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre:           { type: DataTypes.STRING(255), allowNull: false },
  tipo:             DataTypes.STRING(100),
  s3_key:           DataTypes.STRING(500),
  tamanyo_kb:       DataTypes.INTEGER,
  procedimiento_id: DataTypes.UUID,
  cliente_id:       DataTypes.UUID,
  user_id:          DataTypes.UUID,
  ia_metadata:      DataTypes.JSONB
}, {
  tableName: 'documentos', schema: 'public', timestamps: true,
  createdAt: 'created_at', updatedAt: false
})

module.exports = Documento