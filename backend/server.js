const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express  = require('express')
const cors     = require('cors')
const helmet   = require('helmet')
const cron     = require('node-cron')
const { sequelize }  = require('./src/config/database')
const routes         = require('./src/routes/index')
const errorHandler   = require('./src/middleware/error.middleware')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false })) // necesario para webhook Twilio

app.use('/api/v1', routes)
app.use(errorHandler)

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await sequelize.authenticate()
    console.log('✅ PostgreSQL conectado')

    // Cron: resumen diario WhatsApp a las 08:00
    cron.schedule('0 8 * * *', async () => {
      console.log('📱 Enviando resumen diario WhatsApp...')
      try {
        const { buildDailySummary } = require('./src/controllers/whatsapp.controller')
        const { sendToAll }         = require('./src/services/whatsapp.service')
        const msg = await buildDailySummary()
        await sendToAll(msg)
        console.log('✅ Resumen diario enviado')
      } catch (err) {
        console.error('❌ Error resumen diario:', err.message)
      }
    }, { timezone: 'Europe/Madrid' })

    app.listen(PORT, () => console.log(`🏛  LexDesk API en http://localhost:${PORT}`))
  } catch (err) {
    console.error('❌ Error de conexión:', err)
    process.exit(1)
  }
}

start()