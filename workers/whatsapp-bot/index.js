require('dotenv').config()
const express = require('express')
const { handleIncoming } = require('./bot.service')

const app = express()
app.use(express.urlencoded({ extended: false }))

app.post('/webhook/whatsapp', async (req, res) => {
  const twiml = await handleIncoming(req.body)
  res.type('text/xml').send(twiml)
})

app.listen(3002, () => console.log('💬 WhatsApp Bot en :3002'))
