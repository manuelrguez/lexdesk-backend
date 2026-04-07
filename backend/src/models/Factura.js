const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Factura = sequelize.define('Factura', {
  // TODO: definir campos
}, { tableName: 'Facturas'.toLowerCase(), timestamps: true })

module.exports = Factura
