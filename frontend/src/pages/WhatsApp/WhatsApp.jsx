import { useState } from 'react'
import { Send, Zap, CheckCircle, MessageSquare, Phone } from 'lucide-react'
import { whatsappService } from '../../services/whatsapp.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 20, ...extra,
})
const btn = (col = '#25D366', extra = {}) => ({
  background: col, color: col === C.gold ? '#07101E' : '#fff',
  border: 'none', borderRadius: 8, padding: '9px 18px',
  cursor: 'pointer', fontWeight: 700, fontSize: 13,
  display: 'flex', alignItems: 'center', gap: 6, ...extra,
})

const COMANDOS = [
  { cmd: 'eventos',    desc: 'Próximos señalamientos y plazos (14 días)',  icon: '📅' },
  { cmd: 'facturas',   desc: 'Facturas pendientes de cobro',               icon: '💶' },
  { cmd: 'documentos', desc: 'Últimos documentos archivados',              icon: '📄' },
  { cmd: 'resumen',    desc: 'Resumen del día generado con IA',            icon: '📊' },
  { cmd: 'ayuda',      desc: 'Menú de comandos disponibles',               icon: '❓' },
]

export const WhatsApp = () => {
  const [to,       setTo]       = useState(process.env.TWILIO_WHATSAPP_TO || '')
  const [message,  setMessage]  = useState('')
  const [sending,  setSending]  = useState(false)
  const [sumLoad,  setSumLoad]  = useState(false)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, ok = true) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleSend = async () => {
    if (!to || !message) return
    setSending(true)
    try {
      await whatsappService.sendManual(to, message)
      showFeedback('Mensaje enviado correctamente')
      setMessage('')
    } catch (err) {
      showFeedback(err.response?.data?.error || 'Error enviando mensaje', false)
    } finally { setSending(false) }
  }

  const handleSummary = async () => {
    setSumLoad(true)
    try {
      await whatsappService.sendSummary()
      showFeedback('Resumen diario enviado por WhatsApp')
    } catch {
      showFeedback('Error enviando resumen', false)
    } finally { setSumLoad(false) }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>
            WhatsApp Bot
          </div>
          <div style={{ color: C.textM, fontSize: 13, marginTop: 4 }}>
            Asistente jurídico IA · Twilio Sandbox
          </div>
        </div>
        <button onClick={handleSummary} disabled={sumLoad}
          style={btn('#25D366', { fontSize: 13 })}>
          <Zap size={15} />
          {sumLoad ? 'Enviando...' : 'Enviar resumen diario'}
        </button>
      </div>

      {feedback && (
        <div style={{ color: feedback.ok ? C.green : C.red,
          background: (feedback.ok ? C.green : C.red) + '18',
          border: `1px solid ${(feedback.ok ? C.green : C.red)}44`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={15} /> {feedback.msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Panel izquierdo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Enviar mensaje manual */}
          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 16,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              Enviar mensaje manual
            </div>

            <label style={{ color: C.textS, fontSize: 12, display: 'block', marginBottom: 4 }}>
              Número destino (whatsapp:+34...)
            </label>
            <input value={to} onChange={e => setTo(e.target.value)}
              placeholder="whatsapp:+34600000000"
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: '8px 12px', fontSize: 13,
                outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

            <label style={{ color: C.textS, fontSize: 12, display: 'block', marginBottom: 4 }}>
              Mensaje
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Escribe el mensaje a enviar..."
              rows={4} style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: '8px 12px', fontSize: 13,
                outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: 12 }} />

            <button onClick={handleSend} disabled={sending || !to || !message}
              style={btn('#25D366', { opacity: (!to || !message) ? 0.5 : 1, justifyContent: 'center', width: '100%' })}>
              <Send size={14} />
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>

          {/* Resumen automático */}
          <div style={{ ...card(), borderLeft: `3px solid #25D366` }}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 12,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              Resumen diario automático
            </div>
            <div style={{ color: C.textM, fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
              Cada día a las <span style={{ color: C.text, fontWeight: 600 }}>08:00</span> el bot envía
              automáticamente un resumen con los eventos del día, facturas pendientes y novedades del despacho.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.green, fontSize: 12 }}>✓ Cron activo — Europe/Madrid</span>
              <button onClick={handleSummary} disabled={sumLoad}
                style={btn('#25D366', { fontSize: 11, padding: '5px 12px' })}>
                <Zap size={12} /> Enviar ahora
              </button>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Comandos del bot */}
          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 16,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              Comandos disponibles
            </div>
            <div style={{ color: C.textM, fontSize: 12, marginBottom: 14 }}>
              Envía cualquiera de estos mensajes al bot desde WhatsApp:
            </div>
            {COMANDOS.map(({ cmd, desc, icon }) => (
              <div key={cmd} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ color: '#25D366', fontSize: 13, fontWeight: 700,
                    fontFamily: 'monospace' }}>{cmd}</div>
                  <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                <div>
                  <div style={{ color: '#25D366', fontSize: 13, fontWeight: 700,
                    fontFamily: 'monospace' }}>consulta libre</div>
                  <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>
                    Cualquier pregunta — responde con IA (Claude)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 14,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              Configuración
            </div>
            {[
              { label: 'Proveedor',    val: 'Twilio Sandbox'              },
              { label: 'Número bot',   val: '+1 415 523 8886'             },
              { label: 'Webhook',      val: '/api/v1/whatsapp/webhook'    },
              { label: 'Resumen auto', val: 'Diario 08:00 (Madrid)'       },
              { label: 'IA',           val: 'Claude Sonnet'               },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: C.textM, fontSize: 12 }}>{label}</span>
                <span style={{ color: C.textS, fontSize: 12 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}