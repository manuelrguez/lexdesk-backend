import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Search, Trash2, CheckCircle, X,
         Download, Eye, Pencil, ChevronRight } from 'lucide-react'
import { documentosService } from '../../services/documentos.service.js'
import { clientesService }   from '../../services/clientes.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

// ─── helpers ────────────────────────────────────────────────────────────────
const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 20, ...extra,
})
const btn = (col = C.gold, extra = {}) => ({
  background: col, color: col === C.gold ? '#07101E' : '#fff',
  border: 'none', borderRadius: 8, padding: '7px 14px',
  cursor: 'pointer', fontWeight: 700, fontSize: 12,
  display: 'flex', alignItems: 'center', gap: 5, ...extra,
})

const TIPOS = ['Todos', 'Demanda', 'Notificación', 'Escrito', 'Auto', 'Recurso', 'Sentencia', 'Documento']
const TIPOS_EDIT = TIPOS.filter(t => t !== 'Todos')
const confianzaC = { alta: C.green, media: C.gold, baja: C.red }

// Obtener token para URLs directas (preview/download en iframe/anchor)
const getToken = () => {
  try { return JSON.parse(localStorage.getItem('lexdesk_auth'))?.token || '' }
  catch { return '' }
}

// ─── Modal Editar ────────────────────────────────────────────────────────────
function EditModal({ doc, clientes, onSave, onClose }) {
  const [tipo,   setTipo]   = useState(doc.tipo || 'Documento')
  const [cliId,  setCliId]  = useState(doc.cliente_id || '')
  const [procs,  setProcs]  = useState([])
  const [procId, setProcId] = useState(doc.procedimiento_id || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!cliId) { setProcs([]); setProcId(''); return }
    clientesService.getProcedimientos(cliId)
      .then(({ data }) => setProcs(data))
      .catch(() => setProcs([]))
  }, [cliId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await documentosService.update(doc.id, {
        tipo, cliente_id: cliId || null, procedimiento_id: procId || null,
      })
      onSave(data)
    } catch { /* error silencioso */ }
    finally { setSaving(false) }
  }

  const sel = (val, setter) => ({
    value: val, onChange: e => setter(e.target.value),
    style: {
      width: '100%', background: C.bg, border: `1px solid ${C.border}`,
      borderRadius: 8, color: C.text, padding: '8px 12px',
      fontSize: 13, outline: 'none', marginTop: 6,
    }
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card({ width: 420, padding: 28 }), position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
          <X size={16} />
        </button>
        <div style={{ fontFamily: font.display, fontSize: 20, color: C.text, marginBottom: 20 }}>
          Editar documento
        </div>
        <div style={{ color: C.textM, fontSize: 12, marginBottom: 16,
          padding: '8px 12px', background: C.bg, borderRadius: 8 }}>
          {doc.nombre}
        </div>

        <label style={{ color: C.textS, fontSize: 12 }}>Tipo de documento</label>
        <select {...sel(tipo, setTipo)}>
          {TIPOS_EDIT.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={{ color: C.textS, fontSize: 12, display: 'block', marginTop: 14 }}>Cliente</label>
        <select {...sel(cliId, id => { setCliId(id); setProcId('') })}>
          <option value="">— Sin asignar —</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <label style={{ color: C.textS, fontSize: 12, display: 'block', marginTop: 14 }}>Procedimiento</label>
        <select {...sel(procId, setProcId)} disabled={!cliId}>
          <option value="">— Sin asignar —</option>
          {procs.map(p => <option key={p.id} value={p.id}>{p.numero} — {p.tipo}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btn(C.border, { color: C.textS })}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={btn(C.gold)}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel Preview ────────────────────────────────────────────────────────────
function PreviewPanel({ doc, onClose }) {
  const token = getToken()
  // Pasamos el token como query param para que el backend lo acepte
  // (necesita pequeño ajuste en auth.middleware — ver nota abajo)
  const src = `${documentosService.getFileUrl(doc.id)}?token=${token}`

  return (
    <div style={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ color: C.text, fontSize: 13, fontWeight: 600, flex: 1, marginRight: 8,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.nombre}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={`${documentosService.getDownloadUrl(doc.id)}?token=${token}`}
            download={doc.nombre}
            style={btn(C.gold, { textDecoration: 'none' })}>
            <Download size={13} /> Descargar
          </a>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            color: C.textM, cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden',
        border: `1px solid ${C.border}`, background: C.bg, minHeight: 600 }}>
        <iframe
          src={src}
          title={doc.nombre}
          style={{ width: '100%', height: '100%', minHeight: 600, border: 'none' }}
        />
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export const Documentos = () => {
  const [docs,      setDocs]      = useState([])
  const [clientes,  setClientes]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterTipo,setFilter]    = useState('Todos')
  const [drag,      setDrag]      = useState(false)
  const [uploading, setUploading] = useState(false)
  const [iaResult,  setIaResult]  = useState(null)
  const [error,     setError]     = useState(null)
  const [preview,   setPreview]   = useState(null)   // doc seleccionado para preview
  const [editing,   setEditing]   = useState(null)   // doc seleccionado para editar
  const fileRef = useRef()

  useEffect(() => {
    fetchDocs()
    clientesService.getAll().then(({ data }) => setClientes(data)).catch(() => {})
  }, [])

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const { data } = await documentosService.getAll()
      setDocs(data)
    } catch { setError('Error cargando documentos') }
    finally { setLoading(false) }
  }

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF'); return
    }
    setUploading(true); setIaResult(null); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await documentosService.upload(fd)
      setIaResult(data.ia)
      setDocs(prev => [data.documento, ...prev])
    } catch (err) {
      setError(err.response?.data?.error || 'Error subiendo documento')
    } finally { setUploading(false) }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await documentosService.remove(id)
      setDocs(prev => prev.filter(d => d.id !== id))
      if (preview?.id === id) setPreview(null)
      if (iaResult)            setIaResult(null)
    } catch { setError('Error eliminando documento') }
  }

  const handleSaveEdit = (updated) => {
    setDocs(prev => prev.map(d => d.id === updated.id ? updated : d))
    if (preview?.id === updated.id) setPreview(updated)
    setEditing(null)
  }

  const filtered = docs.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.nombre.toLowerCase().includes(q) ||
      (d.cliente_nombre || '').toLowerCase().includes(q) ||
      (d.proc_numero    || '').toLowerCase().includes(q)
    const matchTipo = filterTipo === 'Todos' || d.tipo === filterTipo
    return matchSearch && matchTipo
  })

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* Columna principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>
            Gestor Documental
          </div>
          <button onClick={() => fileRef.current.click()} style={btn(C.gold, { fontSize: 13, padding: '9px 18px' })}>
            <Upload size={15} /> Subir PDF
          </button>
        </div>

        {error && (
          <div style={{ color: C.red, background: C.red + '18', border: `1px solid ${C.red}44`,
            borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {error}
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => setError(null)} />
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => !uploading && fileRef.current.click()}
          style={{ border: `2px dashed ${drag ? C.gold : C.border}`, borderRadius: 12,
            padding: 32, textAlign: 'center', cursor: uploading ? 'wait' : 'pointer',
            marginBottom: 20, background: drag ? C.gold + '08' : 'transparent', transition: 'all 0.2s' }}>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          {uploading ? (
            <div style={{ color: C.gold }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>⚙</div>
              <div style={{ fontSize: 15 }}>IA analizando documento...</div>
              <div style={{ color: C.textM, fontSize: 13, marginTop: 4 }}>
                Extrayendo número de procedimiento, cliente y tipo
              </div>
            </div>
          ) : (
            <>
              <Upload size={28} color={C.textM} style={{ marginBottom: 10 }} />
              <div style={{ color: C.text, fontSize: 15 }}>Arrastra un PDF o haz clic para subir</div>
              <div style={{ color: C.textM, fontSize: 13, marginTop: 4 }}>
                La IA reconocerá automáticamente el procedimiento, cliente y tipo de documento
              </div>
            </>
          )}
        </div>

        {/* Resultado IA */}
        {iaResult && (
          <div style={{ ...card({ marginBottom: 20, position: 'relative' }), borderColor: C.green }}>
            <button onClick={() => setIaResult(null)} style={{ position: 'absolute', top: 12, right: 12,
              background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
              <X size={14} />
            </button>
            <div style={{ color: C.green, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <CheckCircle size={16} />
              Documento reconocido — confianza:
              <span style={{ color: confianzaC[iaResult.confianza] || C.gold }}>{iaResult.confianza}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 10 }}>
              {[
                ['PROCEDIMIENTO', iaResult.procedimiento, C.gold,  'monospace'],
                ['CLIENTE',       iaResult.cliente,       C.text,  'inherit'],
                ['TIPO',          iaResult.tipo,          C.text,  'inherit'],
              ].map(([k, v, col, ff]) => (
                <div key={k}>
                  <div style={{ color: C.textM, fontSize: 11, marginBottom: 4 }}>{k}</div>
                  <div style={{ color: col, fontSize: 14, fontFamily: ff }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {iaResult.observaciones && (
              <div style={{ color: C.textS, fontSize: 13, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                {iaResult.observaciones}
              </div>
            )}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color={C.textM} style={{ position: 'absolute', left: 12,
              top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, cliente o procedimiento..."
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '9px 12px 9px 34px', color: C.text,
                fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TIPOS.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  border: `1px solid ${filterTipo === t ? C.gold : C.border}`,
                  background: filterTipo === t ? C.gold + '22' : 'transparent',
                  color: filterTipo === t ? C.gold : C.textS }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div style={card({ padding: 0, overflow: 'hidden' })}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 70px 80px 72px',
            padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
            color: C.textM, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            <div>Documento</div>
            <div>Cliente / Procedimiento</div>
            <div>Tipo</div>
            <div>Tamaño</div>
            <div>Fecha</div>
            <div></div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>
              {search || filterTipo !== 'Todos'
                ? 'No se encontraron documentos con ese filtro'
                : 'No hay documentos. Sube el primero →'}
            </div>
          ) : filtered.map((d, i) => {
            const isActive = preview?.id === d.id
            return (
              <div key={d.id} onClick={() => setPreview(isActive ? null : d)}
                style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 70px 80px 72px',
                  padding: '12px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                  alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
                  background: isActive ? C.gold + '0D' : 'transparent',
                  borderLeft: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.cardHov }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={15} color={isActive ? C.gold : C.gold} style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ color: C.text, fontSize: 13, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.nombre}</div>
                  </div>
                </div>
                <div>
                  <div style={{ color: C.textS, fontSize: 12 }}>{d.cliente_nombre || '—'}</div>
                  {d.proc_numero && (
                    <div style={{ color: C.gold, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                      #{d.proc_numero}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: 11, color: C.gold, background: C.gold + '22',
                    padding: '2px 8px', borderRadius: 10 }}>{d.tipo}</span>
                </div>
                <div style={{ color: C.textM, fontSize: 12 }}>{d.tamanyo_kb} KB</div>
                <div style={{ color: C.textM, fontSize: 12 }}>
                  {new Date(d.created_at).toLocaleDateString('es-ES')}
                </div>
                {/* Acciones */}
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button title="Editar"
                    onClick={() => setEditing(d)}
                    style={{ background: 'none', border: 'none', color: C.textM,
                      cursor: 'pointer', padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                    <Pencil size={13} />
                  </button>
                  <button title="Previsualizar"
                    onClick={() => setPreview(isActive ? null : d)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                      borderRadius: 4, color: isActive ? C.gold : C.textM }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.textM }}>
                    <Eye size={13} />
                  </button>
                  <button title="Eliminar"
                    onClick={(e) => handleDelete(d.id, e)}
                    style={{ background: 'none', border: 'none', color: C.textM,
                      cursor: 'pointer', padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red}
                    onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ color: C.textM, fontSize: 12, marginTop: 10 }}>
          {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Panel preview lateral */}
      {preview && (
        <PreviewPanel
          doc={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Modal editar */}
      {editing && (
        <EditModal
          doc={editing}
          clientes={clientes}
          onSave={handleSaveEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}