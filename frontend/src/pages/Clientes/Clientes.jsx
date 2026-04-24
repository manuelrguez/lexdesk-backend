import { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, MapPin, X } from 'lucide-react'
import { clientesService }      from '../../services/clientes.service.js'
import { procedimientosService } from '../../services/procedimientos.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'
import { useTranslation } from 'react-i18next'

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
  width: '100%', background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, padding: '9px 12px',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const estadoC  = { 'En curso': C.blue, 'Archivado': C.textM, 'Pendiente': C.amber }
const EMPTY    = { nombre: '', nif: '', direccion: '', telefono: '', email: '', notas: '' }
const PROC_EMPTY = { numero: '', tipo: '', juzgado: '', estado: 'En curso', proxima_act: '' }

export const Clientes = () => {
  const { t } = useTranslation()
  const [clientes,     setClientes]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)
  const [showForm,     setShowForm]     = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState(null)
  const [showProcForm, setShowProcForm] = useState(false)
  const [editingProc,  setEditingProc]  = useState(null)
  const [savingProc,   setSavingProc]   = useState(false)
  const [procForm,     setProcForm]     = useState(PROC_EMPTY)

  const Lbl = ({ children }) => (
    <label style={{ display: 'block', color: C.textS, fontSize: 13, marginBottom: 5, marginTop: 14 }}>
      {children}
    </label>
  )

  useEffect(() => { fetchClientes() }, [])

  const fetchClientes = async () => {
    setLoading(true)
    try { const { data } = await clientesService.getAll(); setClientes(data) }
    catch { setError(t('clientes.errorCargando')) } finally { setLoading(false) }
  }

  const openNew      = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit     = (c) => { setEditing(c); setForm({ nombre: c.nombre, nif: c.nif||'', direccion: c.direccion||'', telefono: c.telefono||'', email: c.email||'', notas: c.notas||'' }); setShowForm(true) }
  const openNewProc  = () => { setEditingProc(null); setProcForm(PROC_EMPTY); setShowProcForm(true) }
  const openEditProc = (p) => { setEditingProc(p); setProcForm({ numero: p.numero, tipo: p.tipo||'', juzgado: p.juzgado||'', estado: p.estado||'En curso', proxima_act: p.proxima_act ? p.proxima_act.split('T')[0] : '' }); setShowProcForm(true) }

  const handleSave = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    try {
      if (editing) {
        const { data } = await clientesService.update(editing.id, form)
        setClientes(prev => prev.map(c => c.id === editing.id ? { ...c, ...data } : c))
        if (selected?.id === editing.id) setSelected({ ...selected, ...data })
      } else {
        const { data } = await clientesService.create(form)
        setClientes(prev => [...prev, { ...data, procedimientos: [] }])
      }
      setShowForm(false)
    } catch { setError(t('clientes.errorGuardando')) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('clientes.confirmarEliminar'))) return
    try {
      await clientesService.remove(id)
      setClientes(prev => prev.filter(c => c.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch { setError(t('clientes.errorEliminando')) }
  }

  const handleSaveProc = async () => {
    if (!procForm.numero.trim()) return
    setSavingProc(true)
    try {
      if (editingProc) {
        const { data } = await procedimientosService.update(editingProc.id, procForm)
        const upd = selected.procedimientos.map(p => p.id === editingProc.id ? data : p)
        setSelected({ ...selected, procedimientos: upd })
        setClientes(prev => prev.map(c => c.id === selected.id ? { ...c, procedimientos: upd } : c))
      } else {
        const { data } = await procedimientosService.create({ ...procForm, cliente_id: selected.id })
        const upd = [...(selected.procedimientos || []), data]
        setSelected({ ...selected, procedimientos: upd })
        setClientes(prev => prev.map(c => c.id === selected.id ? { ...c, procedimientos: upd } : c))
      }
      setShowProcForm(false)
    } catch { setError(t('clientes.errorExpediente')) } finally { setSavingProc(false) }
  }

  const handleDeleteProc = async (procId) => {
    if (!confirm(t('clientes.confirmarEliminarProc'))) return
    try {
      await procedimientosService.remove(procId)
      const upd = selected.procedimientos.filter(p => p.id !== procId)
      setSelected({ ...selected, procedimientos: upd })
      setClientes(prev => prev.map(c => c.id === selected.id ? { ...c, procedimientos: upd } : c))
    } catch { setError(t('clientes.errorExpediente')) }
  }

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.nif || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>{t('clientes.titulo')}</div>
        <button onClick={openNew} style={btn(C.gold)}><Plus size={15} /> {t('clientes.nuevoCliente')}</button>
      </div>

      {error && (
        <div style={{ color: C.red, background: C.red+'18', border: `1px solid ${C.red}44`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14,
          display: 'flex', justifyContent: 'space-between' }}>
          {error} <span style={{ cursor: 'pointer' }} onClick={() => setError(null)}>✕</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={15} color={C.textM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('clientes.buscar')}
              style={{ ...inputStyle, padding: '9px 12px 9px 36px' }} />
          </div>

          <div style={card({ padding: 0, overflow: 'hidden' })}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 80px',
              padding: '11px 20px', borderBottom: `1px solid ${C.border}`,
              color: C.textM, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              <div>{t('clientes.cliente')}</div>
              <div>{t('clientes.contacto')}</div>
              <div>{t('clientes.expedientes')}</div>
              <div></div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>{t('clientes.cargando')}</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>
                {search ? t('clientes.noClientesFiltro') : t('clientes.noClientes')}
              </div>
            ) : filtered.map((c, i) => (
              <div key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 80px',
                  padding: '15px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                  alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
                  background: selected?.id === c.id ? C.gold + '10' : 'transparent',
                  borderLeft: selected?.id === c.id ? `3px solid ${C.gold}` : '3px solid transparent' }}
                onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = C.cardHov }}
                onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = 'transparent' }}>
                <div>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 500 }}>{c.nombre}</div>
                  <div style={{ color: C.textM, fontSize: 13, marginTop: 2 }}>{c.nif || '—'}</div>
                </div>
                <div>
                  <div style={{ color: C.textS, fontSize: 13 }}>{c.telefono || '—'}</div>
                  <div style={{ color: C.textS, fontSize: 13, marginTop: 2 }}>{c.email || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: 14, color: C.gold, fontWeight: 600 }}>{c.procedimientos?.length || 0}</span>
                  <span style={{ color: C.textM, fontSize: 13 }}> {t('clientes.activos')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={e => { e.stopPropagation(); openEdit(c) }}
                    style={{ background: C.gold+'22', color: C.gold, border: 'none',
                      borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
                    {t('clientes.editar')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ color: C.textM, fontSize: 13, marginTop: 10 }}>
            {filtered.length} {filtered.length !== 1 ? t('clientes.cliente').toLowerCase()+'s' : t('clientes.cliente').toLowerCase()}
          </div>
        </div>

        {selected && (
          <div style={{ width: 440, flexShrink: 0 }}>
            <div style={card({ marginBottom: 12 })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: font.display, fontSize: 21, color: C.text, fontWeight: 600 }}>{selected.nombre}</div>
                  <div style={{ color: C.textM, fontSize: 14, marginTop: 3 }}>{selected.nif || t('clientes.sinNif')}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {[{ icon: MapPin, val: selected.direccion }, { icon: Phone, val: selected.telefono }, { icon: Mail, val: selected.email }]
                .filter(r => r.val).map(({ icon: Icon, val }) => (
                <div key={val} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <Icon size={14} color={C.textM} style={{ marginTop: 3, flexShrink: 0 }} />
                  <span style={{ color: C.textS, fontSize: 14 }}>{val}</span>
                </div>
              ))}

              {selected.notas && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: C.bg,
                  borderRadius: 8, color: C.textS, fontSize: 14, fontStyle: 'italic' }}>
                  {selected.notas}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => openEdit(selected)} style={{ ...btn(C.gold), flex: 1, justifyContent: 'center' }}>{t('clientes.editar')}</button>
                <button onClick={() => handleDelete(selected.id)}
                  style={{ background: C.red+'22', color: C.red, border: `1px solid ${C.red}44`,
                    borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                  {t('clientes.eliminar')}
                </button>
              </div>
            </div>

            <div style={card()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ color: C.textS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {t('clientes.expedientesN', { n: selected.procedimientos?.length || 0 })}
                </div>
                <button onClick={openNewProc} style={{ ...btn(C.gold, { fontSize: 12, padding: '5px 12px' }) }}>
                  <Plus size={12} /> {t('clientes.nuevo')}
                </button>
              </div>

              {(!selected.procedimientos || selected.procedimientos.length === 0) ? (
                <div style={{ color: C.textM, fontSize: 14 }}>{t('clientes.sinExpedientes')}</div>
              ) : selected.procedimientos.map(p => (
                <div key={p.id} style={{ ...card({ marginBottom: 10, padding: 14, borderLeft: `3px solid ${estadoC[p.estado] || C.textM}` }) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: C.gold, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>#{p.numero}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: estadoC[p.estado] || C.textM,
                        background: (estadoC[p.estado] || C.textM) + '22', padding: '2px 9px', borderRadius: 10 }}>
                        {p.estado}
                      </span>
                      <button onClick={() => openEditProc(p)}
                        style={{ background: C.gold+'22', color: C.gold, border: 'none', borderRadius: 4, padding: '3px 9px', cursor: 'pointer', fontSize: 12 }}>
                        {t('clientes.editar')}
                      </button>
                      <button onClick={() => handleDeleteProc(p.id)}
                        style={{ background: C.red+'22', color: C.red, border: 'none', borderRadius: 4, padding: '3px 9px', cursor: 'pointer', fontSize: 12 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={{ color: C.text, fontSize: 14 }}>{p.tipo || '—'}</div>
                  <div style={{ color: C.textM, fontSize: 13, marginTop: 3 }}>{p.juzgado || '—'}</div>
                  {p.proxima_act && (
                    <div style={{ color: C.amber, fontSize: 13, marginTop: 8 }}>
                      📅 {new Date(p.proxima_act).toLocaleDateString('es-ES')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal cliente */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: font.display, fontSize: 22, color: C.text }}>{editing ? t('clientes.editarCliente') : t('clientes.nuevoCliente')}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: C.textS, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[
              { key: 'nombre',    label: t('clientes.nombreRazon'), placeholder: 'Empresa S.L.' },
              { key: 'nif',       label: t('clientes.nifCif'),      placeholder: 'B12345678' },
              { key: 'telefono',  label: t('clientes.telefono'),    placeholder: '911 234 567' },
              { key: 'email',     label: 'Email',                   placeholder: 'contacto@empresa.es' },
              { key: 'direccion', label: t('clientes.direccion'),   placeholder: 'Calle Mayor 1, 28001 Madrid' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <Lbl>{label}</Lbl>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <Lbl>{t('clientes.observaciones')}</Lbl>
              <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                rows={3} placeholder={t('clientes.notasInternas')}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving || !form.nombre.trim()}
                style={{ flex: 1, background: form.nombre.trim() ? C.gold : C.textM, color: '#07101E',
                  border: 'none', borderRadius: 8, padding: '12px', cursor: form.nombre.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14 }}>
                {saving ? t('clientes.guardando') : editing ? t('clientes.guardarCambios') : t('clientes.crearCliente')}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'transparent', color: C.textS, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 20px', cursor: 'pointer', fontSize: 14 }}>
                {t('clientes.cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal procedimiento */}
      {showProcForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontFamily: font.display, fontSize: 22, color: C.text }}>{editingProc ? t('clientes.editarExpediente') : t('clientes.nuevoExpediente')}</span>
              <button onClick={() => setShowProcForm(false)} style={{ background: 'none', border: 'none', color: C.textS, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {[
              { key: 'numero',  label: t('clientes.numeroProcedimiento'), placeholder: '2024/001234' },
              { key: 'tipo',    label: t('clientes.tipo'),                placeholder: 'Mercantil, Civil, Penal...' },
              { key: 'juzgado', label: t('clientes.juzgado'),             placeholder: 'Juzgado Mercantil nº 3 Madrid' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <Lbl>{label}</Lbl>
                <input value={procForm[key]} onChange={e => setProcForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <Lbl>{t('clientes.estado')}</Lbl>
              <select value={procForm.estado} onChange={e => setProcForm(f => ({ ...f, estado: e.target.value }))} style={inputStyle}>
                <option>En curso</option><option>Pendiente</option><option>Archivado</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <Lbl>{t('clientes.proximaActuacion')}</Lbl>
              <input type="date" value={procForm.proxima_act} onChange={e => setProcForm(f => ({ ...f, proxima_act: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSaveProc} disabled={savingProc || !procForm.numero.trim()}
                style={{ flex: 1, background: procForm.numero.trim() ? C.gold : C.textM, color: '#07101E',
                  border: 'none', borderRadius: 8, padding: '12px', cursor: procForm.numero.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14 }}>
                {savingProc ? t('clientes.guardando') : editingProc ? t('clientes.guardarCambios') : t('clientes.crearExpediente')}
              </button>
              <button onClick={() => setShowProcForm(false)}
                style={{ background: 'transparent', color: C.textS, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 20px', cursor: 'pointer', fontSize: 14 }}>
                {t('clientes.cancelar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}