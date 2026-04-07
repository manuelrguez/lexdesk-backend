const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Documento = sequelize.define('Documento', {
  // TODO: definir campos
}, { tableName: 'Documentos'.toLowerCase(), timestamps: true })

module.exports = Documento
