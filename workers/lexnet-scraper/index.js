require('dotenv').config()
const cron = require('node-cron')
const { scrapeLexNet } = require('./scraper')

console.log('🔍 LexNet Scraper iniciado')

// Revisa LexNet cada hora en horario laboral
cron.schedule('0 8-20 * * 1-5', async () => {
  console.log('⏱  Consultando LexNet...')
  await scrapeLexNet()
})
