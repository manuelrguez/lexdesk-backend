const Anthropic = require('@anthropic-ai/sdk')
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function handleIncoming({ Body, From }) {
  // TODO: consultar DB para contexto del remitente
  const reply = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: 'Eres el asistente del despacho de abogados LexDesk. Responde de forma breve y profesional.',
    messages: [{ role: 'user', content: Body }],
  })
  const text = reply.content[0].text
  return `<Response><Message>${text}</Message></Response>`
}

module.exports = { handleIncoming }
