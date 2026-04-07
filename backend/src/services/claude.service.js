const Anthropic = require('@anthropic-ai/sdk')

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

async function classifyDocument(fileName, fileSize) {
  const msg = await getClient().messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:     'Eres un sistema OCR jurídico especializado en España. Responde SOLO con JSON válido, sin texto adicional ni markdown.',
    messages: [{
      role:    'user',
      content: `Analiza el nombre del archivo PDF: "${fileName}" (${fileSize} KB). Extrae metadata jurídica española.\nResponde SOLO con este JSON: {"procedimiento":"...","cliente":"...","tipo":"...","juzgado":"...","confianza":"alta|media|baja","observaciones":"..."}`,
    }],
  })
  return JSON.parse(msg.content[0].text.replace(/```json|```/g, '').trim())
}

async function classifyEmail(subject, from, text) {
  const msg = await getClient().messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 512,
    system:     'Eres un asistente jurídico español. Clasificas correos de un despacho de abogados. Responde SOLO con JSON válido, sin markdown.',
    messages: [{
      role:    'user',
      content: `Clasifica este correo:\nDe: ${from}\nAsunto: ${subject}\nCuerpo: ${(text || '').slice(0, 800)}\n\nResponde SOLO con: {"tipo":"lexnet|judicial|cliente|otro","procedimiento":"número o vacío","cliente":"nombre o vacío","prioridad":"alta|media|baja","resumen":"máx 100 chars"}`,
    }],
  })
  return JSON.parse(msg.content[0].text.replace(/```json|```/g, '').trim())
}

async function summarizeEmail(emails) {
  const list = emails.map(e =>
    `• [${e.tipo || '?'}] ${e.subject} — de: ${e.from}`
  ).join('\n')

  const msg = await getClient().messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 600,
    system:     'Eres el asistente jurídico IA de un despacho español. Generas resúmenes diarios de WhatsApp concisos y útiles para abogados.',
    messages: [{
      role:    'user',
      content: `Genera un resumen de WhatsApp profesional para el despacho.\n\nCorreos recibidos:\n${list}\n\nEl mensaje debe:\n- Comenzar con "⚖ *Resumen jurídico del día*"\n- Listar notificaciones prioritarias (LexNet primero)\n- Señalar plazos urgentes si los hay\n- Máximo 12 líneas, con emojis jurídicos\n- Formato WhatsApp (negritas con asteriscos)`,
    }],
  })
  return msg.content[0].text
}

module.exports = { classifyDocument, classifyEmail, summarizeEmail }