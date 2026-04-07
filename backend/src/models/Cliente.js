const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Cliente = sequelize.define('Cliente', {
  // TODO: definir campos
}, { tableName: 'Clientes'.toLowerCase(), timestamps: true })

module.exports = Cliente
