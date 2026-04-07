const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Evento = sequelize.define('Evento', {
  // TODO: definir campos
}, { tableName: 'Eventos'.toLowerCase(), timestamps: true })

module.exports = Evento
