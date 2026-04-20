
import { useState, useEffect, useRef } from 'react'
import { Home, Users, FileText, Mail, Calendar, Globe, Receipt,
         LogOut, Sun, Moon, Bell, X, ChevronRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice.js'
import { Avatar } from '../common/Avatar.jsx'
import { dashboardService } from '../../services/dashboard.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const ITEMS = [
  { id: 'dashboard',   icon: Home,         label: 'Dashboard'   },
  { id: 'clientes',    icon: Users,        label: 'Clientes'    },
  { id: 'documentos',  icon: FileText,     label: 'Documentos'  },
  { id: 'correo',      icon: Mail,         label: 'Correo'      },
  { id: 'agenda',      icon: Calendar,     label: 'Agenda'      },
  { id: 'lexnet',      icon: Globe,        label: 'LexNet'      },
  { id: 'facturacion', icon: Receipt,      label: 'Facturación' },
  { id: 'whatsapp',    icon: WhatsAppIcon, label: 'WhatsApp'    },
]

const urgenciaConfig = (dias) => {
  if (dias === 0)  return { label: 'Hoy',      col: C.red,   bg: C.red   + '18', icon: '🔴' }
  if (dias === 1)  return { label: 'Mañana',   col: C.amber, bg: C.amber + '18', icon: '🟠' }
  if (dias <= 7)   return { label: `${dias}d`, col: C.amber, bg: C.amber + '11', icon: '🟡' }
  if (dias <= 30)  return { label: `${dias}d`, col: C.textS, bg: C.border + '44', icon: '📅' }
  return               { label: `${dias}d`, col: C.textM, bg: 'transparent',  icon: '📆' }
}

const diasHasta = (fecha) => {
  const hoy  = new Date(); hoy.setHours(0,0,0,0)
  const dest = new Date(fecha + 'T00:00:00')
  return Math.round((dest - hoy) / 86400000)
}

function NotifPanel({ eventos, onClose, onVerAgenda }) {
  const urgentes = eventos.filter(e => diasHasta(e.fecha?.slice(0,10)) <= 30)
    .sort((a,b) => a.fecha.localeCompare(b.fecha))

  return (
    <div style={{ position: 'fixed', top: 0, left: 225, bottom: 0, width: 340,
      background: C.card, borderRight: `1px solid ${C.border}`,
      zIndex: 200, display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0,0,0,0.5)' }}>

      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: font.body, fontSize: 15, color: C.text, fontWeight: 600 }}>
            Notificaciones
          </div>
          <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>
            Plazos y eventos próximos
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textM, cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {urgentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textM }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 14 }}>Sin eventos próximos</div>
          </div>
        ) : urgentes.map(ev => {
          const dias = diasHasta(ev.fecha?.slice(0,10))
          const u    = urgenciaConfig(dias)
          const tipoI = { juicio: '⚖', plazo: '⏰', señalamiento: '📋', reunion: '👥', otro: '📌' }
          return (
            <div key={ev.id} style={{ padding: '12px 14px', borderRadius: 8,
              background: u.bg, border: `1px solid ${u.col}33`, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span>{tipoI[ev.tipo] || '📌'}</span>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{ev.titulo}</span>
                  </div>
                  {ev.proc_numero && (
                    <div style={{ color: C.gold, fontSize: 11, fontFamily: font.mono, marginBottom: 4 }}>
                      #{ev.proc_numero}
                    </div>
                  )}
                  <span style={{ color: C.textM, fontSize: 12 }}>
                    {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {ev.hora ? ` · ${ev.hora.slice(0,5)}h` : ''}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: u.col, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                  {u.icon} {u.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
        <button onClick={onVerAgenda}
          style={{ width: '100%', background: C.gold, color: '#0d0d0d', border: 'none',
            borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600,
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: `0 0 12px ${C.gold}55` }}>
          Ver agenda completa <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export const Sidebar = ({ active, setActive, isDark, onToggleTheme }) => {
  const dispatch = useDispatch()
  const user     = useSelector(s => s.auth.user)
  const [eventos,    setEventos]    = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const intervalRef = useRef(null)

  const fetchEventos = async (currentUser) => {
    const uid = currentUser?.id || user?.id
    if (!uid) return
    try {
      const { data } = await dashboardService.getEventos()
      setEventos(data.filter(e =>
        e.user_id === uid || (Array.isArray(e.user_ids) && e.user_ids.includes(uid))
      ))
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchEventos(user)
    intervalRef.current = setInterval(() => fetchEventos(user), 5 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [user?.id])

  const urgentes   = eventos.filter(e => { const d = diasHasta(e.fecha?.slice(0,10)); return d >= 0 && d <= 30 })
  const hoyOManana = urgentes.filter(e => diasHasta(e.fecha?.slice(0,10)) <= 1)
  const handleVerAgenda = () => { setShowNotifs(false); setActive('agenda') }

  return (
    <>
      <div style={{
        width: 225, minHeight: '100vh', background: C.sidebar,
        borderRight: `1px solid ${C.border}`, display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <img src={isDark ? "/logo-herion.png" : "/logo-dark-herion.png"} alt="Herion" style={{ height: 22, objectFit: 'contain', objectPosition: 'left' }} />
            <div style={{ color: C.gold, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', paddingLeft: 2 }}>
              Law
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <button onClick={() => setShowNotifs(p => !p)} title="Notificaciones"
              style={{ position: 'relative', background: 'none',
                border: `1px solid ${showNotifs ? C.gold : C.border}`,
                borderRadius: 6, color: showNotifs ? C.gold : C.textS,
                cursor: 'pointer', padding: '5px 6px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; e.currentTarget.style.boxShadow = `0 0 8px ${C.gold}44` }}
              onMouseLeave={e => { if (!showNotifs) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textS; e.currentTarget.style.boxShadow = 'none' } }}>
              <Bell size={13} />
              {urgentes.length > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5,
                  background: hoyOManana.length > 0 ? C.red : C.amber,
                  color: '#fff', borderRadius: '50%', width: 15, height: 15,
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${C.sidebar}` }}>
                  {urgentes.length > 9 ? '9+' : urgentes.length}
                </span>
              )}
            </button>
            <button onClick={onToggleTheme}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6,
                color: C.textS, cursor: 'pointer', padding: '5px 6px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; e.currentTarget.style.boxShadow = `0 0 8px ${C.gold}44` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textS; e.currentTarget.style.boxShadow = 'none' }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {ITEMS.map(({ id, icon: Icon, label }) => {
            const on = active === id
            return (
              <div key={id} onClick={() => setActive(id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                cursor: 'pointer',
                color: on ? C.gold : C.textS,
                background: on ? C.gold + '15' : 'transparent',
                borderLeft: `2px solid ${on ? C.gold : 'transparent'}`,
                fontSize: 13, fontWeight: on ? 500 : 400,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.background = C.border + '55'; e.currentTarget.style.color = C.text } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textS } }}>
                <Icon size={15} />
                {label}
                {id === 'agenda' && urgentes.length > 0 && (
                  <span style={{ marginLeft: 'auto',
                    background: hoyOManana.length > 0 ? C.red : C.amber,
                    color: '#fff', borderRadius: 10, fontSize: 10,
                    fontWeight: 600, padding: '1px 6px' }}>
                    {urgentes.length}
                  </span>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer usuario */}
        {user && (
          <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
            <div onClick={() => setActive('perfil')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                cursor: 'pointer', borderRadius: 6, padding: '6px 8px', margin: '0 -8px 10px',
                transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.border + '55'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={user} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>
                  {user.name?.split(' ')[0]}
                </div>
                <div style={{ color: C.textM, fontSize: 11 }}>{user.role}</div>
              </div>
              <div style={{ color: C.textM, fontSize: 11 }}>✎</div>
            </div>
            <div onClick={() => dispatch(logout())}
              style={{ display: 'flex', alignItems: 'center', gap: 8,
                color: C.textM, fontSize: 12, cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.red}
              onMouseLeave={e => e.currentTarget.style.color = C.textM}>
              <LogOut size={13} /> Cerrar sesión
            </div>
          </div>
        )}
      </div>

      {showNotifs && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifs(false)} />
          <NotifPanel eventos={eventos} onClose={() => setShowNotifs(false)} onVerAgenda={handleVerAgenda} />
        </>
      )}
    </>
  )
}