const { Sequelize } = require('sequelize')

const isProduction = process.env.NODE_ENV === 'production'

const sequelize = new Sequelize({
  dialect:  'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME     || 'lexdesk',
  username: process.env.DB_USER     || 'lexdesk_user',
  password: process.env.DB_PASSWORD || 'change_me',
  logging:  false,
  pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
})

module.exports = { sequelize, Sequelize }