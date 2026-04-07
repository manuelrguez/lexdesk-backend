const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Procedimiento = sequelize.define('Procedimiento', {
  // TODO: definir campos
}, { tableName: 'Procedimientos'.toLowerCase(), timestamps: true })

module.exports = Procedimiento
