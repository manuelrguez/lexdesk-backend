const imapSimple  = require('imap-simple')
const { simpleParser } = require('mailparser')

function getImapConfig() {
  return {
    imap: {
      host:     process.env.IMAP_HOST     || 'imap.gmail.com',
      port:     parseInt(process.env.IMAP_PORT) || 993,
      user:     process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      tls:      process.env.IMAP_TLS === 'true',
      tlsOptions:      { rejectUnauthorized: false },
      authTimeout:     10000,
      connTimeout:     30000,
    }
  }
}

async function fetchEmails(limit = 50) {
  let connection
  try {
    connection = await imapSimple.connect(getImapConfig())
    await connection.openBox('INBOX')

    const searchCriteria = ['ALL']
    const fetchOptions   = {
      bodies:  ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT', ''],
      markSeen: false,
      struct:  true,
    }

    const messages = await connection.search(searchCriteria, fetchOptions)
    const latest   = messages.slice(-limit).reverse()

    const emails = []
    for (const msg of latest) {
      try {
        const all  = msg.parts.find(p => p.which === '')
        if (!all) continue

        const parsed = await simpleParser(all.body)

        // Extraer adjuntos PDF
        const attachments = (parsed.attachments || [])
          .filter(a => a.contentType === 'application/pdf')
          .map(a => ({
            filename: a.filename,
            size:     Math.round(a.size / 1024),
            content:  a.content.toString('base64'),
          }))

        emails.push({
          uid:         msg.attributes.uid,
          messageId:   parsed.messageId || '',
          from:        parsed.from?.text || '',
          subject:     parsed.subject   || '(Sin asunto)',
          date:        parsed.date      || new Date(),
          seen:        msg.attributes.flags?.includes('\\Seen') || false,
          text:        parsed.text      || parsed.html || '',
          attachments,
        })
      } catch { /* skip mensaje con error */ }
    }

    return emails
  } finally {
    connection?.end()
  }
}

async function markSeen(uid) {
  let connection
  try {
    connection = await imapSimple.connect(getImapConfig())
    await connection.openBox('INBOX')
    await connection.addFlags(uid, '\\Seen')
  } finally {
    connection?.end()
  }
}

module.exports = { fetchEmails, markSeen }