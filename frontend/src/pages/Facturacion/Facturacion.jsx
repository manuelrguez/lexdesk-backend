import { useState, useEffect } from 'react'
import { Plus, X, Pencil, Trash2, TrendingUp, CheckCircle, Clock, CreditCard, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { facturacionService } from '../../services/facturacion.service.js'
import { clientesService }    from '../../services/clientes.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

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

const ESTADOS    = ['Emitida', 'Pendiente', 'Pagada']
const estadoCol  = { Pagada: C.gold, Pendiente: C.gold, Emitida: C.gold }
const fmt        = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €'

function FacturaModal({ factura, clientes, onSave, onClose }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    cliente_id: factura?.cliente_id || '',
    concepto:   factura?.concepto   || '',
    base:       factura?.base       || '',
    estado:     factura?.estado     || 'Emitida',
    fecha:      factura?.fecha?.slice(0,10) || new Date().toISOString().slice(0,10),
  })
  const set     = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const baseNum = parseFloat(form.base) || 0
  const ivaNum  = parseFloat((baseNum * 0.21).toFixed(2))
  const total   = parseFloat((baseNum + ivaNum).toFixed(2))

  const handleSave = async () => {
    if (!form.concepto || !form.base) return
    setSaving(true)
    try {
      const { data } = factura
        ? await facturacionService.update(factura.id, form)
        : await facturacionService.create(form)
      onSave(data, !!factura)
    } catch { /* silencioso */ } finally { setSaving(false) }
  }

  const Lbl = ({ children }) => (
    <label style={{ color: C.textS, fontSize: 13, display: 'block', marginBottom: 5, marginTop: 14 }}>{children}</label>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card({ width: 480, padding: 28 }), position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
          <X size={18} />
        </button>
        <div style={{ fontFamily: font.display, fontSize: 22, color: C.text, marginBottom: 20 }}>
          {factura ? 'Editar factura' : 'Nueva factura'}
        </div>

        <Lbl>Cliente</Lbl>
        <select value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)} style={inputStyle}>
          <option value="">— Sin asignar —</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <Lbl>Concepto *</Lbl>
        <textarea value={form.concepto} onChange={e => set('concepto', e.target.value)}
          placeholder="Ej: Honorarios dirección letrada Ene-Mar 2025"
          rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Lbl>Base imponible (€) *</Lbl>
            <input type="number" min="0" step="0.01" value={form.base}
              onChange={e => set('base', e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <Lbl>Fecha</Lbl>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={inputStyle} />
          </div>
        </div>

        <Lbl>Estado</Lbl>
        <div style={{ display: 'flex', gap: 8 }}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => set('estado', e)}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: `1px solid ${form.estado === e ? estadoCol[e] : C.border}`,
                background: form.estado === e ? estadoCol[e] + '22' : 'transparent',
                color: form.estado === e ? estadoCol[e] : C.textS }}>
              {e}
            </button>
          ))}
        </div>

        {baseNum > 0 && (
          <div style={{ marginTop: 16, padding: '14px 16px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
            {[['Base imponible', fmt(baseNum)], ['IVA (21%)', fmt(ivaNum)]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: C.textM, fontSize: 13 }}>{k}</span>
                <span style={{ color: C.textS, fontSize: 13 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              <span style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>Total</span>
              <span style={{ color: C.gold, fontSize: 17, fontWeight: 700 }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btn(C.border, { color: C.textS })}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.concepto || !form.base}
            style={btn(C.gold, { opacity: (!form.concepto || !form.base) ? 0.5 : 1 })}>
            {saving ? 'Guardando...' : factura ? 'Guardar cambios' : 'Crear factura'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const Facturacion = () => {
  const [facturas,  setFacturas]  = useState([])
  const [clientes,  setClientes]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [filterEst, setFilterEst] = useState('Todos')
  const [error,     setError]     = useState(null)

  useEffect(() => {
    fetchFacturas()
    clientesService.getAll().then(({ data }) => setClientes(data)).catch(() => {})
  }, [])

  const fetchFacturas = async () => {
    setLoading(true)
    try { const { data } = await facturacionService.getAll(); setFacturas(data) }
    catch { setError('Error cargando facturas') } finally { setLoading(false) }
  }

  const handleSave    = (f, isEdit) => { setFacturas(prev => isEdit ? prev.map(x => x.id === f.id ? f : x) : [f, ...prev]); setModal(false); setEditing(null) }
  const handleEstado  = async (id, estado) => { try { await facturacionService.updateEstado(id, estado); setFacturas(prev => prev.map(f => f.id === id ? { ...f, estado } : f)) } catch { setError('Error actualizando estado') } }
  const handleDelete  = async (id) => { if (!confirm('¿Eliminar esta factura?')) return; try { await facturacionService.remove(id); setFacturas(prev => prev.filter(f => f.id !== id)) } catch { setError('Error eliminando factura') } }

  const handleExportPDF = async (id, numero, clienteNombre) => {
    try {
      const { data } = await facturacionService.exportPDF(id)
      const blob = new Blob([data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href  = url
      const clienteSafe = (clienteNombre || 'SinCliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_')
      link.setAttribute('download', `Factura_${numero}_${clienteSafe}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch { setError('Error generando PDF') }
  }

  const totFact = facturas.reduce((a, f) => a + Number(f.total), 0)
  const totCob  = facturas.filter(f => f.estado === 'Pagada').reduce((a, f) => a + Number(f.total), 0)
  const totPend = facturas.filter(f => f.estado !== 'Pagada').reduce((a, f) => a + Number(f.total), 0)
  const totIva  = facturas.reduce((a, f) => a + Number(f.iva), 0)

  const chartData = (() => {
    const m = {}
    facturas.forEach(f => {
      const mes = f.fecha?.slice(0,7); if (!mes) return
      if (!m[mes]) m[mes] = { mes: mes.slice(5,7) + '/' + mes.slice(2,4), fact: 0, cob: 0 }
      m[mes].fact += Number(f.total)
      if (f.estado === 'Pagada') m[mes].cob += Number(f.total)
    })
    return Object.values(m).sort((a,b) => a.mes.localeCompare(b.mes)).slice(-6)
  })()

  const filtered = facturas.filter(f => filterEst === 'Todos' || f.estado === filterEst)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600 }}>Facturación</div>
        <button onClick={() => setModal(true)} style={btn(C.gold)}>
          <Plus size={15} /> Nueva factura
        </button>
      </div>

      {error && (
        <div style={{ color: C.red, background: C.red + '18', border: `1px solid ${C.red}44`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 14,
          display: 'flex', justifyContent: 'space-between' }}>
          {error} <X size={14} style={{ cursor: 'pointer' }} onClick={() => setError(null)} />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { icon: TrendingUp,  label: 'Total facturado',   val: fmt(totFact), col: C.gold   },
          { icon: CheckCircle, label: 'Cobrado',            val: fmt(totCob),  col: C.gold  },
          { icon: Clock,       label: 'Pendiente de cobro', val: fmt(totPend), col: C.gold  },
          { icon: CreditCard,  label: 'IVA repercutido',    val: fmt(totIva),  col: C.gold },
        ].map(({ icon: Icon, label, val, col }) => (
          <div key={label} style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: C.textS, fontSize: 13, marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: font.display, fontSize: 24, color: C.text, fontWeight: 600 }}>{val}</div>
              </div>
              <div style={{ background: col + '22', borderRadius: 10, padding: 10, height: 'fit-content' }}>
                <Icon size={18} color={col} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Tabla — flex:1 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {['Todos', ...ESTADOS].map(e => (
              <button key={e} onClick={() => setFilterEst(e)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${filterEst === e ? (estadoCol[e] || C.gold) : C.border}`,
                  background: filterEst === e ? (estadoCol[e] || C.gold) + '22' : 'transparent',
                  color: filterEst === e ? (estadoCol[e] || C.gold) : C.textS }}>
                {e}{e !== 'Todos' && <span style={{ marginLeft: 6, opacity: 0.7 }}>({facturas.filter(f => f.estado === e).length})</span>}
              </button>
            ))}
          </div>

          <div style={card({ padding: 0, overflow: 'hidden' })}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 130px 100px 100px 70px',
              padding: '11px 20px', borderBottom: `1px solid ${C.border}`,
              color: C.textM, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              <div>Número</div><div>Cliente / Concepto</div><div>Total</div><div>Fecha</div><div>Estado</div><div></div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>Cargando...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.textS }}>
                No hay facturas{filterEst !== 'Todos' ? ` con estado "${filterEst}"` : ''}
              </div>
            ) : filtered.map((f, i) => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 130px 100px 100px 70px',
                padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.cardHov}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ color: C.gold, fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{f.numero}</div>
                <div>
                  <div style={{ color: C.text, fontSize: 14 }}>{f.cliente_nombre || '—'}</div>
                  <div style={{ color: C.textM, fontSize: 12, marginTop: 3 }}>{f.concepto}</div>
                </div>
                <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{fmt(f.total)}</div>
                <div style={{ color: C.textM, fontSize: 13 }}>
                  {f.fecha ? new Date(f.fecha).toLocaleDateString('es-ES') : '—'}
                </div>
                <div>
                  <select value={f.estado} onChange={e => handleEstado(f.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ background: estadoCol[f.estado] + '22', color: estadoCol[f.estado],
                      border: `1px solid ${estadoCol[f.estado]}44`, borderRadius: 20,
                      padding: '4px 10px', fontSize: 12, cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button onClick={() => handleExportPDF(f.id, f.numero, f.cliente_nombre)}
                    title="Descargar PDF"
                    style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                    <Download size={14} />
                  </button>
                  <button onClick={() => setEditing(f)}
                    style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(f.id)}
                    style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer', padding: 5 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red}
                    onMouseLeave={e => e.currentTarget.style.color = C.textM}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ color: C.textM, fontSize: 13, marginTop: 10 }}>
            {filtered.length} factura{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Panel derecho — más ancho */}
        <div style={{ width: 360, flexShrink: 0 }}>
          <div style={card({ marginBottom: 16 })}>
            <div style={{ color: C.textS, fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Facturación mensual
            </div>
            {chartData.length === 0 ? (
              <div style={{ color: C.textM, fontSize: 14, textAlign: 'center', padding: 20 }}>Sin datos</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={chartData} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: C.textM, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.textM, fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: C.text }} formatter={v => [fmt(v)]} />
                    <Bar dataKey="fact" fill={C.gold}  radius={[4,4,0,0]} name="Facturado" />
                    <Bar dataKey="cob"  fill={C.gold} radius={[4,4,0,0]} name="Cobrado"   />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
                  {[[C.gold,'Facturado'],[C.gold,'Cobrado']].map(([col,lab]) => (
                    <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
                      <span style={{ color: C.textM, fontSize: 12 }}>{lab}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              Resumen fiscal
            </div>
            {[
              ['Base imponible',       facturas.reduce((a,f) => a + Number(f.base), 0), C.textS, false],
              ['IVA repercutido (21%)', totIva,  C.textS, false],
              ['Total facturado',       totFact, C.gold,  true],
              ['Cobrado',               totCob,  C.gold, false],
              ['Pendiente',             totPend, C.gold, false],
            ].map(([k, v, col, big], i) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderTop: i === 2 ? `1px solid ${C.border}` : 'none', marginTop: i === 2 ? 4 : 0 }}>
                <span style={{ color: big ? C.text : C.textM, fontSize: big ? 14 : 13, fontWeight: big ? 600 : 400 }}>{k}</span>
                <span style={{ color: col, fontSize: big ? 16 : 14, fontWeight: big ? 700 : 400 }}>{fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal   && <FacturaModal clientes={clientes} onSave={handleSave} onClose={() => setModal(false)} />}
      {editing && <FacturaModal factura={editing} clientes={clientes} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  )
}