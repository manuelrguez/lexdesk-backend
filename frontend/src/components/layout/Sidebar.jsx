import { useState, useEffect, useRef } from 'react'
import { Home, Users, FileText, Mail, Calendar, Globe, Receipt,
         LogOut, MessageSquare, Sun, Moon, Bell, X, ChevronRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/authSlice.js'
import { Avatar } from '../common/Avatar.jsx'
import { dashboardService } from '../../services/dashboard.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

const ITEMS = [
  { id: 'dashboard',   icon: Home,          label: 'Dashboard'   },
  { id: 'clientes',    icon: Users,         label: 'Clientes'    },
  { id: 'documentos',  icon: FileText,      label: 'Documentos'  },
  { id: 'correo',      icon: Mail,          label: 'Correo'      },
  { id: 'agenda',      icon: Calendar,      label: 'Agenda'      },
  { id: 'lexnet',      icon: Globe,         label: 'LexNet'      },
  { id: 'facturacion', icon: Receipt,       label: 'Facturación' },
  { id: 'whatsapp',    icon: MessageSquare, label: 'WhatsApp'    },
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

// ─── Panel de notificaciones ──────────────────────────────────────────────────
function NotifPanel({ eventos, onClose, onVerAgenda }) {
  const urgentes  = eventos.filter(e => diasHasta(e.fecha?.slice(0,10)) <= 30)
    .sort((a,b) => a.fecha.localeCompare(b.fecha))

  return (
    <div style={{ position: 'fixed', top: 0, left: 225, bottom: 0, width: 340,
      background: C.card, borderRight: `1px solid ${C.border}`,
      zIndex: 200, display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 18, color: C.text, fontWeight: 600 }}>
            Notificaciones
          </div>
          <div style={{ color: C.textM, fontSize: 12, marginTop: 2 }}>
            Plazos y eventos próximos
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none',
          color: C.textM, cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {urgentes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textM }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 14 }}>Sin eventos próximos</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>No hay plazos en los próximos 30 días</div>
          </div>
        ) : urgentes.map(ev => {
          const dias = diasHasta(ev.fecha?.slice(0,10))
          const u    = urgenciaConfig(dias)
          const tipoI = { juicio: '⚖', plazo: '⏰', señalamiento: '📋', reunion: '👥', otro: '📌' }
          return (
            <div key={ev.id} style={{ padding: '12px 14px', borderRadius: 10,
              background: u.bg, border: `1px solid ${u.col}33`,
              marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span>{tipoI[ev.tipo] || '📌'}</span>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{ev.titulo}</span>
                  </div>
                  {ev.proc_numero && (
                    <div style={{ color: C.gold, fontSize: 11, fontFamily: 'monospace', marginBottom: 4 }}>
                      #{ev.proc_numero}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: C.textM, fontSize: 12 }}>
                      {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      {ev.hora ? ` · ${ev.hora.slice(0,5)}h` : ''}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ fontSize: u.label === 'Hoy' || u.label === 'Mañana' ? 13 : 12,
                    color: u.col, fontWeight: 700 }}>
                    {u.icon} {u.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
        <button onClick={onVerAgenda}
          style={{ width: '100%', background: C.gold, color: '#07101E', border: 'none',
            borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700,
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Ver agenda completa <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const Sidebar = ({ active, setActive, isDark, onToggleTheme }) => {
  const dispatch = useDispatch()
  const user     = useSelector(s => s.auth.user)
  const [eventos,      setEventos]     = useState([])
  const [showNotifs,   setShowNotifs]  = useState(false)
  const intervalRef = useRef(null)

  const fetchEventos = async (currentUser) => {
    const uid = currentUser?.id || user?.id
    if (!uid) return
    try {
      const { data } = await dashboardService.getEventos()
      setEventos(data.filter(e =>
        e.user_id === uid ||
        (Array.isArray(e.user_ids) && e.user_ids.includes(uid))
      ))
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchEventos(user)
    intervalRef.current = setInterval(() => fetchEventos(user), 5 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [user?.id])

  // Contar eventos urgentes (≤ 7 días)
  const urgentes = eventos.filter(e => {
    const d = diasHasta(e.fecha?.slice(0,10))
    return d >= 0 && d <= 30
  })
  const hoyOManana = urgentes.filter(e => diasHasta(e.fecha?.slice(0,10)) <= 1)

  const handleVerAgenda = () => {
    setShowNotifs(false)
    setActive('agenda')
  }

  return (
    <>
      <div style={{
        width: 225, minHeight: '100vh', background: C.sidebar,
        borderRight: `1px solid ${C.border}`, display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 24, color: C.gold,
              fontWeight: 600, letterSpacing: 1 }}>
              ⚖ LexDesk
            </div>
            <div style={{ color: C.textM, fontSize: 10, marginTop: 1,
              letterSpacing: 2, textTransform: 'uppercase' }}>
              Pro Edition
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            {/* Botón notificaciones */}
            <button onClick={() => setShowNotifs(p => !p)}
              title="Notificaciones"
              style={{ position: 'relative', background: 'none',
                border: `1px solid ${showNotifs ? C.gold : C.border}`,
                borderRadius: 8, color: showNotifs ? C.gold : C.textS,
                cursor: 'pointer', padding: '5px 7px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
              onMouseLeave={e => { if (!showNotifs) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textS } }}>
              <Bell size={14} />
              {urgentes.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: hoyOManana.length > 0 ? C.red : C.amber,
                  color: '#fff', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${C.sidebar}`,
                }}>
                  {urgentes.length > 9 ? '9+' : urgentes.length}
                </span>
              )}
            </button>
            {/* Toggle tema */}
            <button onClick={onToggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.textS, cursor: 'pointer', padding: '5px 7px',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textS }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {ITEMS.map(({ id, icon: Icon, label }) => {
            const on = active === id
            return (
              <div key={id} onClick={() => setActive(id)} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '12px 20px',
                cursor: 'pointer', color: on ? C.gold : C.textS,
                background: on ? C.gold + '18' : 'transparent',
                borderLeft: `3px solid ${on ? C.gold : 'transparent'}`,
                fontSize: 15, fontWeight: on ? 600 : 400, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.border + '44' }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
                <Icon size={16} />{label}
                {/* Badge correos sin leer en Correo */}
                {id === 'agenda' && urgentes.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: hoyOManana.length > 0 ? C.red : C.amber,
                    color: '#fff', borderRadius: 10, fontSize: 10,
                    fontWeight: 700, padding: '1px 7px' }}>
                    {urgentes.length}
                  </span>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer usuario */}
        {user && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
            <div onClick={() => setActive('perfil')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                cursor: 'pointer', borderRadius: 8, padding: '6px 8px', margin: '0 -8px 12px',
                transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.border + '44'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={user} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
                  {user.name?.split(' ')[0]}
                </div>
                <div style={{ color: C.textM, fontSize: 12 }}>{user.role}</div>
              </div>
              <div style={{ color: C.textM, fontSize: 11 }}>✎</div>
            </div>
            <div onClick={() => dispatch(logout())} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: C.textM, fontSize: 13, cursor: 'pointer', transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = C.red}
              onMouseLeave={e => e.currentTarget.style.color = C.textM}>
              <LogOut size={13} /> Cerrar sesión
            </div>
          </div>
        )}
      </div>

      {/* Panel notificaciones */}
      {showNotifs && (
        <>
          {/* Overlay para cerrar al clicar fuera */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setShowNotifs(false)} />
          <NotifPanel
            eventos={eventos}
            onClose={() => setShowNotifs(false)}
            onVerAgenda={handleVerAgenda}
          />
        </>
      )}
    </>
  )
}