import { useState, useEffect } from 'react'
import { RefreshCw, Mail, FileText, Zap, CheckCircle,
         AlertCircle, X, Archive, MessageSquare } from 'lucide-react'
import { correoService } from '../../services/correo.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

// ─── helpers ─────────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 20, ...extra,
})
const btn = (col = C.gold, extra = {}) => ({
  background: col, color: col === C.gold ? '#07101E' : '#fff',
  border: 'none', borderRadius: 8, padding: '8px 16px',
  cursor: 'pointer', fontWeight: 700, fontSize: 13,
  display: 'flex', alignItems: 'center', gap: 6, ...extra,
})

const TIPO_META = {
  lexnet:   { label: 'LexNet',   col: C.gold  },
  judicial: { label: 'Judicial', col: C.blue  },
  cliente:  { label: 'Cliente',  col: C.green },
  otro:     { label: 'Otro',     col: C.textS },
}

const Badge = ({ tipo }) => {
  const m = TIPO_META[tipo] || TIPO_META.otro
  return (
    <span style={{ fontSize: 11, color: m.col, background: m.col + '22',
      padding: '2px 9px', borderRadius: 10, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) +
    ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ─── Panel detalle correo ─────────────────────────────────────────────────────
function EmailPanel({ email, onClose, onClassify, onArchive }) {
  const [classifying, setClassifying] = useState(false)
  const [archiving,   setArchiving]   = useState(null)
  const [iaResult,    setIaResult]    = useState(email.ia || null)
  const [archived,    setArchived]    = useState({})
  const [archiveMsg,  setArchiveMsg]  = useState(null)

  const handleClassify = async () => {
    setClassifying(true)
    try {
      const { data } = await correoService.classify(email.uid, {
        subject: email.subject, from: email.from, text: email.text,
      })
      setIaResult(data)
      onClassify(email.uid, data)
    } catch { /* silencioso */ }
    finally { setClassifying(false) }
  }

  const handleArchive = async (att) => {
    setArchiving(att.filename)
    try {
      const { data } = await correoService.archiveAttachment({
        filename: att.filename, content: att.content, uid: email.uid,
      })
      setArchived(p => ({ ...p, [att.filename]: true }))
      setArchiveMsg(`✓ ${att.filename} archivado en Documentos`)
      onArchive && onArchive(data)
    } catch {
      setArchiveMsg(`✗ Error archivando ${att.filename}`)
    } finally { setArchiving(null) }
  }

  const prioCol = { alta: C.red, media: C.amber, baja: C.green }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card({ padding: '18px 20px' })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              {email.subject}
            </div>
            <div style={{ color: C.textM, fontSize: 13 }}>
              De: <span style={{ color: C.textS }}>{email.from}</span>
            </div>
            <div style={{ color: C.textM, fontSize: 13, marginTop: 3 }}>{fmtDate(email.date)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ color: C.textS, fontSize: 14, lineHeight: 1.8,
          maxHeight: 200, overflowY: 'auto', marginBottom: 14,
          borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          {email.text || '(Sin contenido de texto)'}
        </div>

        {email.attachments?.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <div style={{ color: C.textM, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Adjuntos
            </div>
            {email.attachments.map(att => (
              <div key={att.filename} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', background: C.bg, borderRadius: 8, marginBottom: 6 }}>
                <FileText size={14} color={C.blue} />
                <span style={{ color: C.textS, fontSize: 13, flex: 1 }}>{att.filename}</span>
                <span style={{ color: C.textM, fontSize: 12 }}>{att.size} KB</span>
                {archived[att.filename] ? (
                  <span style={{ color: C.green, fontSize: 12 }}>✓ Archivado</span>
                ) : (
                  <button onClick={() => handleArchive(att)} disabled={archiving === att.filename}
                    style={btn(C.gold, { fontSize: 11, padding: '5px 12px' })}>
                    <Archive size={12} />
                    {archiving === att.filename ? '...' : 'Archivar'}
                  </button>
                )}
              </div>
            ))}
            {archiveMsg && (
              <div style={{ color: archiveMsg.startsWith('✓') ? C.green : C.red, fontSize: 13, marginTop: 6 }}>
                {archiveMsg}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={card()}>
        <div style={{ color: C.textS, fontSize: 12, marginBottom: 14,
          textTransform: 'uppercase', letterSpacing: 1 }}>
          Clasificación IA
        </div>
        {iaResult ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                ['Tipo',          <Badge tipo={iaResult.tipo} />],
                ['Prioridad',     <span style={{ color: prioCol[iaResult.prioridad] || C.textS, fontSize: 13 }}>{iaResult.prioridad}</span>],
                ['Procedimiento', <span style={{ color: C.gold, fontSize: 13, fontFamily: 'monospace' }}>{iaResult.procedimiento || '—'}</span>],
                ['Cliente',       <span style={{ color: C.textS, fontSize: 13 }}>{iaResult.cliente || '—'}</span>],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: C.textM, fontSize: 11, marginBottom: 4 }}>{k}</div>
                  {v}
                </div>
              ))}
            </div>
            {iaResult.resumen && (
              <div style={{ color: C.textS, fontSize: 13, borderTop: `1px solid ${C.border}`,
                paddingTop: 12, lineHeight: 1.7 }}>
                {iaResult.resumen}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ color: C.textM, fontSize: 14, marginBottom: 14 }}>
              Sin clasificar — la IA puede detectar tipo, procedimiento y prioridad
            </div>
            <button onClick={handleClassify} disabled={classifying}
              style={btn(C.gold, { width: '100%', justifyContent: 'center' })}>
              <Zap size={14} />
              {classifying ? 'Clasificando...' : 'Clasificar con IA'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export const Correo = () => {
  const [emails,     setEmails]    = useState([])
  const [loading,    setLoading]   = useState(false)
  const [error,      setError]     = useState(null)
  const [selected,   setSelected]  = useState(null)
  const [filterTipo, setFilter]    = useState('Todos')
  const [summary,    setSummary]   = useState('')
  const [sumLoading, setSumLoad]   = useState(false)

  const fetchEmails = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await correoService.getAll()
      setEmails(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error conectando al servidor de correo')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchEmails() }, [])

  const handleSelect = async (email) => {
    setSelected(email)
    if (!email.seen) {
      try {
        await correoService.markSeen(email.uid)
        setEmails(prev => prev.map(e => e.uid === email.uid ? { ...e, seen: true } : e))
      } catch { /* silencioso */ }
    }
  }

  const handleClassify = (uid, ia) => {
    setEmails(prev => prev.map(e => e.uid === uid ? { ...e, ia } : e))
    setSelected(prev => prev?.uid === uid ? { ...prev, ia } : prev)
  }

  const handleSummary = async () => {
    setSumLoad(true); setSummary('')
    try {
      const list = emails.map(e => ({ subject: e.subject, from: e.from, tipo: e.ia?.tipo || 'otro' }))
      const { data } = await correoService.summarize(list)
      setSummary(data.resumen)
    } catch { setSummary('⚠ Error generando resumen') }
    finally { setSumLoad(false) }
  }

  const unread  = emails.filter(e => !e.seen).length
  const TIPOS   = ['Todos', 'lexnet', 'judicial', 'cliente', 'otro']
  const filtered = emails.filter(e => filterTipo === 'Todos' || e.ia?.tipo === filterTipo)

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Columna principal — se estrecha cuando hay panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>
              Bandeja de entrada
            </div>
            {unread > 0 && (
              <span style={{ background: C.amber, color: '#000', borderRadius: 10,
                fontSize: 12, fontWeight: 700, padding: '2px 9px' }}>
                {unread} sin leer
              </span>
            )}
          </div>
          <button onClick={fetchEmails} disabled={loading} style={btn(C.blue)}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>

        {error && (
          <div style={{ color: C.red, background: C.red + '18', border: `1px solid ${C.red}44`,
            borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertCircle size={15} /> Error de conexión
            </div>
            <div style={{ color: C.textM, fontSize: 13 }}>{error}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {TIPOS.map(t => {
            const m = TIPO_META[t] || { label: 'Todos', col: C.gold }
            const active = filterTipo === t
            return (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${active ? (m.col || C.gold) : C.border}`,
                  background: active ? (m.col || C.gold) + '22' : 'transparent',
                  color: active ? (m.col || C.gold) : C.textS }}>
                {t === 'Todos' ? 'Todos' : m.label}
                {t !== 'Todos' && (
                  <span style={{ marginLeft: 5, opacity: 0.7 }}>
                    ({emails.filter(e => e.ia?.tipo === t).length})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div style={{ ...card({ textAlign: 'center', padding: 40 }), color: C.textS }}>
            Conectando al servidor de correo...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card({ textAlign: 'center', padding: 40 }), color: C.textS }}>
            {emails.length === 0 ? 'No hay correos. Pulsa Sincronizar.' : 'No hay correos con ese filtro'}
          </div>
        ) : filtered.map(email => {
          const isActive = selected?.uid === email.uid
          return (
            <div key={email.uid} onClick={() => handleSelect(email)}
              style={{ ...card({ marginBottom: 8, padding: '14px 18px', cursor: 'pointer',
                borderColor: isActive ? C.gold : (!email.seen ? C.amber + '66' : C.border),
                borderLeft: `3px solid ${isActive ? C.gold : (!email.seen ? C.amber : 'transparent')}`,
              }), transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.cardHov }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = C.card }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {!email.seen && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: C.amber, marginTop: 6, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, marginLeft: email.seen ? 18 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: C.text, fontSize: 15, fontWeight: email.seen ? 400 : 600 }}>
                      {email.subject}
                    </span>
                    <span style={{ color: C.textM, fontSize: 12, flexShrink: 0, marginLeft: 12 }}>
                      {fmtDate(email.date)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: C.textM, fontSize: 13 }}>{email.from}</span>
                    {email.ia && <Badge tipo={email.ia.tipo} />}
                    {email.attachments?.length > 0 && (
                      <span style={{ color: C.textM, fontSize: 12 }}>
                        📎 {email.attachments.length} adjunto{email.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Panel derecho — más ancho */}
      <div style={{ width: 520, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {selected ? (
          <EmailPanel
            email={selected}
            onClose={() => setSelected(null)}
            onClassify={handleClassify}
            onArchive={() => {}}
          />
        ) : (
          <div style={{ ...card({ textAlign: 'center', padding: 40 }) }}>
            <Mail size={32} color={C.textM} style={{ marginBottom: 10 }} />
            <div style={{ color: C.textM, fontSize: 14 }}>Selecciona un correo para leerlo</div>
          </div>
        )}

        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textS,
            fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            <MessageSquare size={14} /> Resumen diario WhatsApp
          </div>
          <button onClick={handleSummary} disabled={sumLoading || emails.length === 0}
            style={btn('#25D366', { width: '100%', justifyContent: 'center',
              opacity: emails.length === 0 ? 0.5 : 1 })}>
            <Zap size={14} />
            {sumLoading ? 'Generando con IA...' : 'Generar resumen'}
          </button>
          {summary && (
            <div style={{ marginTop: 14, background: '#25D36614',
              border: '1px solid #25D36640', borderRadius: 10, padding: 16 }}>
              <div style={{ color: '#25D366', fontSize: 12, marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={13} /> PREVIEW WHATSAPP
              </div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}