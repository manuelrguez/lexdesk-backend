const twilio = require('twilio')

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

async function sendMessage(to, body) {
  const client = getClient()
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    body,
  })
}

async function sendToAll(body) {
  const numbers = (process.env.TWILIO_WHATSAPP_TO || '').split(',').map(n => n.trim()).filter(Boolean)
  return Promise.all(numbers.map(n => sendMessage(n, body)))
}

module.exports = { sendMessage, sendToAll }