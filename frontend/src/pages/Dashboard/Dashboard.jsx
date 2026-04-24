import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Users, FileText, Mail, Calendar, RefreshCw, ChevronRight } from 'lucide-react'
import { dashboardService } from '../../services/dashboard.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'
import { useTranslation } from 'react-i18next'

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, ...extra,
})
const fmt = (n) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €'
const tipoI = { juicio: '⚖', plazo: '⏰', señalamiento: '📋', reunion: '👥', otro: '📌' }
const estadoCol = { Pagada: C.gold, Pendiente: C.amber, Emitida: C.gold }

const Stat = ({ icon: Icon, label, val, sub, col, loading }) => (
  <div style={card({ flex: 1 })}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ color: C.textS, fontSize: 15, marginBottom: 10 }}>{label}</div>
        <div style={{ fontFamily: font.display, fontSize: 42, color: C.text, fontWeight: 600, lineHeight: 1 }}>
          {loading ? '—' : val}
        </div>
        {sub && <div style={{ color: C.textM, fontSize: 14, marginTop: 8 }}>{sub}</div>}
      </div>
      <div style={{ background: col + '22', borderRadius: 10, padding: 12, height: 'fit-content' }}>
        <Icon size={22} color={col} />
      </div>
    </div>
  </div>
)

export const Dashboard = ({ setActive }) => {
  const user = useSelector(s => s.auth.user)
  const { t } = useTranslation()
  const [stats,      setStats]      = useState(null)
  const [eventos,    setEventos]    = useState([])
  const [actividad,  setActividad]  = useState({ facturas: [], documentos: [] })
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [s, e, a] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getEventos(),
        dashboardService.getActividad(),
      ])
      setStats(s.data); setEventos(e.data); setActividad(a.data)
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const diasHasta = (fecha) => {
    const hoy  = new Date(); hoy.setHours(0,0,0,0)
    const dest = new Date(fecha + 'T00:00:00')
    const diff = Math.round((dest - hoy) / 86400000)
    if (diff === 0) return { label: t('dashboard.hoy'),    col: C.red   }
    if (diff === 1) return { label: t('dashboard.manana'), col: C.amber }
    if (diff <= 7)  return { label: `${diff}d`, col: C.amber }
    return { label: `${diff}d`, col: C.textM }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 36, color: C.text, fontWeight: 600 }}>
            {t('dashboard.bienvenido')} <span style={{ color: C.gold }}>{user?.name?.split(' ')[0]}</span>
          </div>
          <div style={{ color: C.textS, fontSize: 16, marginTop: 5, textTransform: 'capitalize' }}>
            {today} · {user?.role}
          </div>
        </div>
        <button onClick={() => fetchAll(true)} disabled={refreshing}
          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
            color: C.textS, cursor: 'pointer', padding: '8px 16px', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {t('dashboard.actualizar')}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <Stat icon={Users}    label={t('dashboard.clientesActivos')}    loading={loading}
          val={stats?.clientes} col={C.gold}
          sub={t('dashboard.procedimientosActivos', { n: stats?.procedimientos || 0 })} />
        <Stat icon={FileText} label={t('dashboard.documentosArchivados')} loading={loading}
          val={stats?.documentos} col={C.gold} sub={t('dashboard.gestorDocumental')} />
        <Stat icon={Mail}     label={t('dashboard.correosSinLeer')}     loading={loading}
          val={stats?.correos_sin_leer ?? '—'} col={C.gold}
          sub={stats?.correos_sin_leer === null ? t('dashboard.imapNoDisponible') : t('dashboard.bandejaEntrada')} />
        <Stat icon={Calendar} label={t('dashboard.eventosProximos')}   loading={loading}
          val={stats?.eventos_proximos} col={C.gold} sub={t('dashboard.proximos30dias')} />
      </div>

      {/* Fila principal */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {/* Próximos eventos */}
        <div style={card({ flex: 2 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ color: C.textS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('dashboard.proximosSeñalamientos')}
            </div>
            <button onClick={() => setActive('agenda')}
              style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer',
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('dashboard.verAgenda')} <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: C.textM, fontSize: 15, padding: '20px 0' }}>{t('dashboard.cargando')}</div>
          ) : eventos.length === 0 ? (
            <div style={{ color: C.textM, fontSize: 15, padding: '20px 0', textAlign: 'center' }}>
              {t('dashboard.noEventos30dias')}
            </div>
          ) : eventos.map((ev, i) => {
            const dias = diasHasta(ev.fecha?.slice(0,10))
            return (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 0', borderBottom: i < eventos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: C.gold + '22', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18 }}>
                  {tipoI[ev.tipo] || '📌'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: 16, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.titulo}
                  </div>
                  <div style={{ color: C.textM, fontSize: 14, marginTop: 3 }}>
                    {ev.proc_numero ? `Proc. ${ev.proc_numero} · ` : ''}{ev.hora?.slice(0,5)}h
                    {ev.user_name && (
                      <span style={{ color: ev.user_color, marginLeft: 8 }}>
                        · {ev.user_name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: C.gold, fontSize: 14, fontWeight: 600 }}>
                    {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ color: dias.col, fontSize: 13, marginTop: 2, fontWeight: 600 }}>
                    {dias.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Columna derecha */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card(), borderLeft: `3px solid ${C.gold}` }}>
            <div style={{ color: C.textS, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('dashboard.pendienteCobro')}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 30, color: C.gold, fontWeight: 600 }}>
              {loading ? '—' : fmt(stats?.pendiente_cobro || 0)}
            </div>
            <button onClick={() => setActive('facturacion')}
              style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer',
                fontSize: 14, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
              {t('dashboard.verFacturas')} <ChevronRight size={13} />
            </button>
          </div>

          <div style={card()}>
            <div style={{ color: C.textS, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('dashboard.accesosRapidos')}
            </div>
            {[
              { label: t('dashboard.nuevoCliente'),   mod: 'clientes'    },
              { label: t('dashboard.subirDocumento'), mod: 'documentos'  },
              { label: t('dashboard.verCorreo'),      mod: 'correo'      },
              { label: t('dashboard.nuevaFactura'),   mod: 'facturacion' },
            ].map(({ label, mod }) => (
              <div key={mod} onClick={() => setActive(mod)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 7,
                  border: `1px solid ${C.border}`, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.gold + '0D' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent' }}>
                <span style={{ color: C.text, fontSize: 15 }}>{label}</span>
                <ChevronRight size={15} color={C.gold} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Últimas facturas */}
        <div style={card({ flex: 1 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: C.textS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('dashboard.ultimasFacturas')}
            </div>
            <button onClick={() => setActive('facturacion')}
              style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer',
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('dashboard.verTodas')} <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: C.textM, fontSize: 15 }}>{t('dashboard.cargando')}</div>
          ) : actividad.facturas.length === 0 ? (
            <div style={{ color: C.textM, fontSize: 15, textAlign: 'center', padding: 16 }}>{t('dashboard.sinFacturas')}</div>
          ) : actividad.facturas.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: i < actividad.facturas.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div>
                <div style={{ color: C.gold, fontSize: 14, fontFamily: 'monospace' }}>{f.numero}</div>
                <div style={{ color: C.textM, fontSize: 13, marginTop: 2 }}>{f.cliente_nombre || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{fmt(f.total)}</div>
                <span style={{ fontSize: 12, color: estadoCol[f.estado],
                  background: estadoCol[f.estado] + '22', padding: '2px 8px', borderRadius: 8 }}>
                  {f.estado}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Documentos recientes */}
        <div style={card({ flex: 1 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: C.textS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('dashboard.documentosRecientes')}
            </div>
            <button onClick={() => setActive('documentos')}
              style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer',
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              {t('dashboard.verTodos')} <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: C.textM, fontSize: 15 }}>{t('dashboard.cargando')}</div>
          ) : actividad.documentos.length === 0 ? (
            <div style={{ color: C.textM, fontSize: 15, textAlign: 'center', padding: 16 }}>{t('dashboard.sinDocumentos')}</div>
          ) : actividad.documentos.map((d, i) => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: i < actividad.documentos.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div style={{ color: C.text, fontSize: 15, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</div>
                <div style={{ color: C.textM, fontSize: 13, marginTop: 2 }}>{d.cliente_nombre || '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: C.gold, background: C.gold + '22',
                  padding: '2px 8px', borderRadius: 8 }}>{d.tipo}</span>
                <div style={{ color: C.textM, fontSize: 13, marginTop: 4 }}>
                  {new Date(d.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado del sistema */}
        <div style={card({ flex: 1 })}>
          <div style={{ color: C.textS, fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('dashboard.estadoSistema')}
          </div>
          {[
            { label: t('dashboard.baseDatos'), ok: true, note: t('dashboard.postgresConectado') },
            { label: t('dashboard.correoImap'), ok: stats?.correos_sin_leer !== null, note: stats?.correos_sin_leer !== null ? t('dashboard.gmailConectado') : t('dashboard.noDisponible') },
            { label: t('dashboard.lexnet'), ok: false, note: t('dashboard.pendienteCredenciales') },
            { label: t('dashboard.whatsappBot'), ok: true, note: t('dashboard.twilioActivo') },
          ].map(({ label, ok, note }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ color: C.text, fontSize: 15 }}>{label}</div>
                <div style={{ color: C.textM, fontSize: 13 }}>{note}</div>
              </div>
              <span style={{ fontSize: 13, color: ok ? C.gold : C.amber,
                background: (ok ? C.gold : C.amber) + '22',
                padding: '3px 10px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                {ok ? t('dashboard.activo') : t('dashboard.pendiente')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}