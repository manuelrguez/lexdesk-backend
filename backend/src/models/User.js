const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const User = sequelize.define('User', {
  // TODO: definir campos
}, { tableName: 'Users'.toLowerCase(), timestamps: true })

module.exports = User
