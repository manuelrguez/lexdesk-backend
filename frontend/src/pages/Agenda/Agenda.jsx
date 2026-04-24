import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Pencil,
         Clock, Calendar, RefreshCw } from 'lucide-react'
import { agendaService }    from '../../services/agenda.service.js'
import { clientesService }  from '../../services/clientes.service.js'
import { authService }      from '../../services/auth.service.js'
import { googleCalService } from '../../services/google-cal.service.js'
import { useSelector }      from 'react-redux'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'
import { useTranslation } from 'react-i18next'

const MNAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DNAMES = ['L','M','X','J','V','S','D']

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...extra,
})
const btn = (col = C.gold, extra = {}) => ({
  background: col, color: col === C.gold ? '#07101E' : '#fff',
  border: 'none', borderRadius: 8, padding: '8px 16px',
  cursor: 'pointer', fontWeight: 700, fontSize: 13,
  display: 'flex', alignItems: 'center', gap: 6, ...extra,
})
const inputStyle = {
  width: '100%', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, padding: '9px 12px',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function EventModal({ evento, usuarios, onSave, onClose }) {
  const { t } = useTranslation()
  const currentUser = useSelector(s => s.auth.user)
  const [clientes, setClientes] = useState([])
  const [procs,    setProcs]    = useState([])
  const [saving,   setSaving]   = useState(false)

  const TIPOS = [
    { val: 'juicio',       label: t('agenda.juicio'),      icon: '⚖',  col: '#C44848' },
    { val: 'plazo',        label: t('agenda.plazo'),        icon: '⏰', col: '#C88020' },
    { val: 'señalamiento', label: t('agenda.señalamiento'), icon: '📋', col: '#3A80C2' },
    { val: 'reunion',      label: t('agenda.reunion'),      icon: '👥', col: '#3BAD78' },
    { val: 'otro',         label: t('agenda.otro'),         icon: '📌', col: '#7A62D2' },
  ]

  const [form, setForm] = useState({
    titulo:           evento?.titulo              || '',
    tipo:             evento?.tipo               || 'juicio',
    fecha:            evento?.fecha?.slice(0,10) || '',
    hora:             evento?.hora?.slice(0,5)   || '',
    user_ids:         evento?.usuarios?.map(u => u.id) || [currentUser?.id] || [],
    procedimiento_id: evento?.procedimiento_id   || '',
    cliente_id:       '',
    notas:            evento?.notas              || '',
  })

  useEffect(() => {
    clientesService.getAll().then(({ data }) => {
      setClientes(data)
      if (evento?.procedimiento_id) {
        const cli = data.find(c => c.procedimientos?.some(p => p.id === evento.procedimiento_id))
        if (cli) {
          setForm(f => ({ ...f, cliente_id: cli.id }))
          clientesService.getProcedimientos(cli.id).then(({ data: ps }) => setProcs(ps)).catch(() => {})
        }
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.cliente_id) { setProcs([]); return }
    clientesService.getProcedimientos(form.cliente_id)
      .then(({ data }) => setProcs(data)).catch(() => setProcs([]))
  }, [form.cliente_id])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleUser = (uid) => setForm(p => ({
    ...p, user_ids: p.user_ids.includes(uid) ? p.user_ids.filter(x => x !== uid) : [...p.user_ids, uid]
  }))

  const handleSave = async () => {
    if (!form.titulo || !form.fecha || form.user_ids.length === 0) return
    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo, tipo: form.tipo, fecha: form.fecha,
        hora: form.hora || null, user_ids: form.user_ids,
        procedimiento_id: form.procedimiento_id || null, notas: form.notas || null,
      }
      const { data } = evento
        ? await agendaService.update(evento.id, payload)
        : await agendaService.create(payload)
      onSave(data, !!evento)
    } catch { /* silencioso */ } finally { setSaving(false) }
  }

  const Lbl = ({ children }) => (
    <label style={{ color: C.textS, fontSize: 13, display: 'block', marginBottom: 5, marginTop: 14 }}>
      {children}
    </label>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card({ width: 480, padding: 28 }), position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
          <X size={18} />
        </button>
        <div style={{ fontFamily: font.display, fontSize: 22, color: C.text, marginBottom: 20 }}>
          {evento ? t('agenda.editarEvento') : t('agenda.nuevoEvento')}
        </div>

        <Lbl>{t('agenda.titulo')}</Lbl>
        <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
          placeholder="Ej: Vista oral — López Martínez" style={inputStyle} />

        <Lbl>{t('agenda.tipo')}</Lbl>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TIPOS.map(tp => (
            <button key={tp.val} onClick={() => set('tipo', tp.val)}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: `1px solid ${form.tipo === tp.val ? tp.col : C.border}`,
                background: form.tipo === tp.val ? tp.col + '22' : 'transparent',
                color: form.tipo === tp.val ? tp.col : C.textS }}>
              {tp.icon} {tp.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><Lbl>{t('agenda.fecha')}</Lbl><input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={inputStyle} /></div>
          <div><Lbl>{t('agenda.hora')}</Lbl><input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} style={inputStyle} /></div>
        </div>

        <Lbl>{t('agenda.asignarA')}</Lbl>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {usuarios.map(u => {
            const sel = form.user_ids.includes(u.id)
            return (
              <button key={u.id} onClick={() => toggleUser(u.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  border: `1.5px solid ${sel ? u.color : C.border}`,
                  background: sel ? u.color + '22' : 'transparent',
                  color: sel ? u.color : C.textS }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? u.color : C.textM }} />
                {u.name.split(' ')[0]}
                {sel && <span style={{ fontSize: 11 }}>✓</span>}
              </button>
            )
          })}
        </div>
        {form.user_ids.length === 0 && (
          <div style={{ color: C.red, fontSize: 12, marginTop: 4 }}>{t('agenda.seleccionaAbogado')}</div>
        )}

        <Lbl>{t('agenda.clienteOpcional')}</Lbl>
        <select value={form.cliente_id} onChange={e => { set('cliente_id', e.target.value); set('procedimiento_id', '') }} style={inputStyle}>
          <option value="">— {t('common.sinAsignar')} —</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <Lbl>{t('agenda.procedimientoOpcional')}</Lbl>
        <select value={form.procedimiento_id} onChange={e => set('procedimiento_id', e.target.value)} style={inputStyle} disabled={!form.cliente_id}>
          <option value="">— {t('common.sinAsignar')} —</option>
          {procs.map(p => <option key={p.id} value={p.id}>{p.numero} — {p.tipo}</option>)}
        </select>

        <Lbl>{t('agenda.notas')}</Lbl>
        <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
          placeholder={t('agenda.notasPlaceholder')}
          rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btn(C.border, { color: C.textS })}>{t('agenda.cancelar')}</button>
          <button onClick={handleSave} disabled={saving || !form.titulo || !form.fecha || form.user_ids.length === 0}
            style={btn(C.gold, { opacity: (!form.titulo || !form.fecha || form.user_ids.length === 0) ? 0.5 : 1 })}>
            {saving ? t('agenda.guardando') : evento ? t('agenda.guardarCambios') : t('agenda.crearEvento')}
          </button>
        </div>
      </div>
    </div>
  )
}

export const Agenda = () => {
  const { t } = useTranslation()
  const now  = new Date()
  const [eventos,       setEventos]  = useState([])
  const [usuarios,      setUsuarios] = useState([])
  const [loading,       setLoading]  = useState(true)
  const [year,          setYear]     = useState(now.getFullYear())
  const [month,         setMonth]    = useState(now.getMonth())
  const [modal,         setModal]    = useState(false)
  const [editing,       setEditing]  = useState(null)
  const [selDay,        setSelDay]   = useState(null)
  const [activeU,       setActiveU]  = useState([])
  const [gcalConnected, setGcalConn] = useState(false)
  const [syncing,       setSyncing]  = useState(false)
  const [syncMsg,       setSyncMsg]  = useState(null)

  const TIPOS_MAP = {
    juicio:       { label: t('agenda.juicio'),      icon: '⚖',  col: '#C44848' },
    plazo:        { label: t('agenda.plazo'),        icon: '⏰', col: '#C88020' },
    señalamiento: { label: t('agenda.señalamiento'), icon: '📋', col: '#3A80C2' },
    reunion:      { label: t('agenda.reunion'),      icon: '👥', col: '#3BAD78' },
    otro:         { label: t('agenda.otro'),         icon: '📌', col: '#7A62D2' },
  }
  const tipoInfo = (val) => TIPOS_MAP[val] || TIPOS_MAP.otro

  useEffect(() => {
    fetchEventos()
    authService.getUsers().then(({ data }) => { setUsuarios(data); setActiveU(data.map(u => u.id)) }).catch(() => {})
    googleCalService.getStatus().then(({ data }) => setGcalConn(data.connected)).catch(() => {})
    if (window.location.search.includes('google_connected=1')) {
      setSyncMsg({ ok: true, text: '✓ Google Calendar conectado correctamente' })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchEventos = async () => {
    setLoading(true)
    try { const { data } = await agendaService.getAll(); setEventos(data) }
    catch { /* silencioso */ } finally { setLoading(false) }
  }

  const handleSave = async (ev, isEdit) => {
    setEventos(prev => isEdit ? prev.map(e => e.id === ev.id ? ev : e) : [ev, ...prev])
    setModal(false); setEditing(null)
    if (gcalConnected) { try { await googleCalService.syncEvent(ev.id, isEdit ? 'update' : 'create') } catch { /* silencioso */ } }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm(t('agenda.confirmarEliminar'))) return
    if (gcalConnected) { try { await googleCalService.syncEvent(id, 'delete') } catch { /* silencioso */ } }
    await agendaService.remove(id)
    setEventos(prev => prev.filter(ev => ev.id !== id))
  }

  const handleConnectGoogle    = async () => { try { const { data } = await googleCalService.getAuthUrl(); window.location.href = data.url } catch { /* silencioso */ } }
  const handleDisconnectGoogle = async () => { if (!confirm('¿Desconectar Google Calendar?')) return; try { await googleCalService.disconnect(); setGcalConn(false) } catch { /* silencioso */ } }
  const handleSyncAll = async () => {
    setSyncing(true); setSyncMsg(null)
    try {
      const { data } = await googleCalService.syncAll()
      setSyncMsg({ ok: true, text: `✓ ${data.creados} nuevos, ${data.actualizados} actualizados` })
      await fetchEventos()
    } catch { setSyncMsg({ ok: false, text: '✗ Error sincronizando' }) }
    finally { setSyncing(false) }
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const dayStr      = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const visibles  = (evs) => evs.filter(e =>
    e.usuarios?.some(u => activeU.includes(u.id)) ||
    ((!e.usuarios || e.usuarios.length === 0) && activeU.includes(e.user_id))
  )
  const evForDay  = (d) => visibles(eventos.filter(e => e.fecha?.slice(0,10) === dayStr(d)))
  const monthEvs  = visibles(eventos.filter(e => e.fecha?.slice(0,7) === `${year}-${String(month+1).padStart(2,'0')}`))
    .sort((a,b) => a.fecha.localeCompare(b.fecha) || (a.hora||'').localeCompare(b.hora||''))
  const toggleUser = (uid) => setActiveU(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: C.textS, cursor: 'pointer' }}><ChevronLeft size={22} /></button>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, minWidth: 240, textAlign: 'center' }}>{MNAMES[month]} {year}</div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: C.textS, cursor: 'pointer' }}><ChevronRight size={22} /></button>
          <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()) }}
            style={btn(C.border, { color: C.textS, fontSize: 12, padding: '6px 12px' })}>{t('agenda.hoy')}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {usuarios.map(u => (
            <button key={u.id} onClick={() => toggleUser(u.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: `1.5px solid ${activeU.includes(u.id) ? u.color : C.border}`,
                background: activeU.includes(u.id) ? u.color + '22' : 'transparent',
                color: activeU.includes(u.id) ? u.color : C.textS }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.color }} />
              {u.name.split(' ')[0]}
            </button>
          ))}
          <button onClick={() => setModal(true)} style={btn(C.gold)}>
            <Plus size={14} /> {t('agenda.nuevoEvento')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexShrink: 0,
        padding: '10px 16px', background: C.card, borderRadius: 10,
        border: `1px solid ${gcalConnected ? C.green + '44' : C.border}` }}>
        <div style={{ fontSize: 18 }}>📅</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t('agenda.googleCalendar')}</div>
          <div style={{ color: gcalConnected ? C.green : C.textM, fontSize: 12 }}>
            {gcalConnected ? t('agenda.conectado') : t('agenda.noConectado')}
          </div>
        </div>
        {syncMsg && <div style={{ color: syncMsg.ok ? C.green : C.red, fontSize: 12 }}>{syncMsg.text}</div>}
        {gcalConnected ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSyncAll} disabled={syncing} style={btn(C.gold, { fontSize: 12, padding: '6px 14px' })}>
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? t('agenda.sincronizando') : t('agenda.sincronizarTodo')}
            </button>
            <button onClick={handleDisconnectGoogle} style={btn(C.border, { color: C.textM, fontSize: 12, padding: '6px 14px' })}>
              {t('agenda.desconectar')}
            </button>
          </div>
        ) : (
          <button onClick={handleConnectGoogle} style={btn('#4285F4', { fontSize: 12, padding: '6px 16px' })}>
            {t('agenda.conectarGoogle')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={card({ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' })}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              {DNAMES.map(d => (
                <div key={d} style={{ padding: '11px 0', textAlign: 'center', color: C.textM, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridTemplateRows: 'repeat(6, 1fr)', flex: 1 }}>
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`e${i}`} style={{ borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1, ds = dayStr(day), evs = evForDay(day)
                const isToday = ds === todayStr, isSel = ds === selDay
                return (
                  <div key={day} onClick={() => setSelDay(isSel ? null : ds)}
                    style={{ padding: '7px 8px', cursor: 'pointer', minHeight: 80,
                      borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`,
                      background: isSel ? C.gold + '0D' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = C.cardHov }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ fontSize: 13, marginBottom: 4, fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#07101E' : C.textS, background: isToday ? C.gold : 'transparent',
                      borderRadius: '50%', width: 24, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {day}
                    </div>
                    {evs.slice(0, 2).map(ev => {
                      const tp = tipoInfo(ev.tipo)
                      const firstColor = ev.usuarios?.[0]?.color || tp.col
                      return (
                        <div key={ev.id} title={ev.titulo}
                          style={{ fontSize: 11, color: firstColor, background: firstColor + '22',
                            borderRadius: 4, padding: '2px 6px', marginBottom: 2,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            borderLeft: ev.google_event_id ? `2px solid ${firstColor}` : 'none' }}>
                          {tp.icon} {ev.titulo}
                          {ev.usuarios?.length > 1 && <span style={{ opacity: 0.7 }}> +{ev.usuarios.length - 1}</span>}
                        </div>
                      )
                    })}
                    {evs.length > 2 && <div style={{ fontSize: 11, color: C.textM }}>+{evs.length - 2}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ color: C.textS, fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
            {t('agenda.eventosLabel')} {selDay
              ? new Date(selDay + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
              : MNAMES[month]}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {loading ? (
              <div style={{ color: C.textM, fontSize: 14 }}>{t('agenda.cargando')}</div>
            ) : (() => {
              const lista = selDay
                ? visibles(eventos.filter(e => e.fecha?.slice(0,10) === selDay))
                : monthEvs
              if (lista.length === 0)
                return <div style={{ ...card({ textAlign: 'center', padding: 28 }), color: C.textM, fontSize: 14 }}>{t('agenda.sinEventos')}</div>
              return lista.map(ev => {
                const tp = tipoInfo(ev.tipo)
                const evUsuarios = ev.usuarios || []
                const firstColor = evUsuarios[0]?.color || tp.col
                return (
                  <div key={ev.id} style={{ ...card({ marginBottom: 10, padding: '14px 16px', borderLeft: `3px solid ${firstColor}` }) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>{tp.icon}</span>
                          <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{ev.titulo}</span>
                          {ev.google_event_id && <span style={{ fontSize: 12, color: C.green }}>📅</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.textM, fontSize: 13 }}>
                            <Calendar size={12} />
                            {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </div>
                          {ev.hora && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.textM, fontSize: 13 }}>
                              <Clock size={12} /> {ev.hora?.slice(0,5)}
                            </div>
                          )}
                        </div>
                        {ev.proc_numero && <div style={{ color: C.gold, fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>#{ev.proc_numero}</div>}
                        {ev.notas && <div style={{ color: C.textM, fontSize: 13, marginBottom: 8 }}>{ev.notas}</div>}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {evUsuarios.map(u => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%',
                                background: (u.color || C.textM) + '22', border: `1px solid ${u.color || C.textM}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, color: u.color || C.textM, fontWeight: 700 }}>
                                {u.short}
                              </div>
                              <span style={{ color: u.color || C.textM, fontSize: 12 }}>{u.name?.split(' ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {gcalConnected && !ev.google_event_id && (
                          <button onClick={async (e) => { e.stopPropagation(); try { await googleCalService.syncEvent(ev.id, 'create'); await fetchEventos() } catch { /* silencioso */ } }}
                            style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#4285F4'}
                            onMouseLeave={e => e.currentTarget.style.color = C.textM}>📅</button>
                        )}
                        <button onClick={() => setEditing(ev)}
                          style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                          onMouseEnter={e => e.currentTarget.style.color = C.gold}
                          onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(ev.id, e)}
                          style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                          onMouseEnter={e => e.currentTarget.style.color = C.red}
                          onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {modal   && <EventModal usuarios={usuarios} onSave={handleSave} onClose={() => setModal(false)} />}
      {editing && <EventModal evento={editing} usuarios={usuarios} onSave={handleSave} onClose={() => setEditing(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}