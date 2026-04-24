import { useState } from 'react'
import { Send, Zap, CheckCircle } from 'lucide-react'
import { whatsappService } from '../../services/whatsapp.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'
import { useTranslation } from 'react-i18next'

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
  { cmd: 'eventos',    icon: '📅' },
  { cmd: 'facturas',   icon: '💶' },
  { cmd: 'documentos', icon: '📄' },
  { cmd: 'resumen',    icon: '📊' },
  { cmd: 'ayuda',      icon: '❓' },
]

export const WhatsApp = () => {
  const { t } = useTranslation()
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
      showFeedback(t('whatsapp.mensajeEnviado'))
      setMessage('')
    } catch (err) {
      showFeedback(err.response?.data?.error || 'Error enviando mensaje', false)
    } finally { setSending(false) }
  }

  const handleSummary = async () => {
    setSumLoad(true)
    try {
      await whatsappService.sendSummary()
      showFeedback(t('whatsapp.resumenEnviado'))
    } catch {
      showFeedback('Error enviando resumen', false)
    } finally { setSumLoad(false) }
  }

  const COMANDOS_DESC = {
    eventos:    t('dashboard.proximosSeñalamientos'),
    facturas:   t('dashboard.pendienteCobro'),
    documentos: t('dashboard.documentosRecientes'),
    resumen:    t('whatsapp.resumenDiarioAuto'),
    ayuda:      t('whatsapp.comandosDisponibles'),
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>
            {t('whatsapp.titulo')}
          </div>
          <div style={{ color: C.textM, fontSize: 13, marginTop: 4 }}>
            {t('whatsapp.subtitulo')}
          </div>
        </div>
        <button onClick={handleSummary} disabled={sumLoad}
          style={btn('#25D366', { fontSize: 13 })}>
          <Zap size={15} />
          {sumLoad ? t('whatsapp.enviando') : t('whatsapp.enviarResumenDiario')}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 16,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('whatsapp.enviarMensajeManual')}
            </div>

            <label style={{ color: C.textS, fontSize: 12, display: 'block', marginBottom: 4 }}>
              {t('whatsapp.numeroDestino')}
            </label>
            <input value={to} onChange={e => setTo(e.target.value)}
              placeholder="whatsapp:+34600000000"
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: '8px 12px', fontSize: 13,
                outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

            <label style={{ color: C.textS, fontSize: 12, display: 'block', marginBottom: 4 }}>
              {t('whatsapp.mensaje')}
            </label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder={t('whatsapp.mensajePlaceholder')}
              rows={4} style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, padding: '8px 12px', fontSize: 13,
                outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: 12 }} />

            <button onClick={handleSend} disabled={sending || !to || !message}
              style={btn('#25D366', { opacity: (!to || !message) ? 0.5 : 1, justifyContent: 'center', width: '100%' })}>
              <Send size={14} />
              {sending ? t('whatsapp.enviando') : t('whatsapp.enviarMensaje')}
            </button>
          </div>

          <div style={{ ...card(), borderLeft: `3px solid #25D366` }}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 12,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('whatsapp.resumenDiarioAuto')}
            </div>
            <div style={{ color: C.textM, fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
              {t('whatsapp.resumenDesc', { hora: '08:00' })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.green, fontSize: 12 }}>{t('whatsapp.cronActivo')}</span>
              <button onClick={handleSummary} disabled={sumLoad}
                style={btn('#25D366', { fontSize: 11, padding: '5px 12px' })}>
                <Zap size={12} /> {t('whatsapp.enviarAhora')}
              </button>
            </div>
          </div>
        </div>

        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 16,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('whatsapp.comandosDisponibles')}
            </div>
            <div style={{ color: C.textM, fontSize: 12, marginBottom: 14 }}>
              {t('whatsapp.comandosDesc')}
            </div>
            {COMANDOS.map(({ cmd, icon }) => (
              <div key={cmd} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ color: C.gold, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{cmd}</div>
                  <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>{COMANDOS_DESC[cmd]}</div>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
                <div>
                  <div style={{ color: C.gold, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>consulta libre</div>
                  <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>
                    Cualquier pregunta — responde con IA (Claude)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 11, marginBottom: 14,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('whatsapp.configuracion')}
            </div>
            {[
              [t('whatsapp.proveedor'),    'Twilio Sandbox'           ],
              [t('whatsapp.numeroBotLabel'), '+1 415 523 8886'        ],
              [t('whatsapp.webhook'),      '/api/v1/whatsapp/webhook' ],
              [t('whatsapp.resumenAuto'),  'Diario 08:00 (Madrid)'    ],
              [t('whatsapp.ia'),           'Claude Sonnet'            ],
            ].map(([label, val]) => (
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