import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../store/authSlice.js'
import { authService } from '../../services/auth.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'
import { useTheme } from '../../hooks/useTheme.js'

const USERS_HINT = [
  { email: 'maria@lexdesk.es',  name: 'María García',     role: 'Abogada Senior', color: C.gold,   short: 'MG' },
  { email: 'carlos@lexdesk.es', name: 'Carlos Rodríguez', role: 'Abogado',        color: C.blue,   short: 'CR' },
  { email: 'ana@lexdesk.es',    name: 'Ana Martínez',     role: 'Procuradora',    color: C.purple, short: 'AM' },
]

const inputStyle = {
  width: '100%', background: 'var(--card)', border: `1px solid var(--border)`,
  borderRadius: 8, color: 'var(--text)', padding: '10px 14px',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
  transition: 'border-color 0.2s',
}

export const Login = () => {
  const dispatch  = useDispatch()
  const { isDark } = useTheme()
  //const isDark = theme === 'dark'
  const [mode,    setMode]    = useState('perfiles')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [hovered, setHovered] = useState(null)

  const doLogin = async (loginEmail, loginPass) => {
    setLoading(true); setError(null)
    try {
      const { data } = await authService.login(loginEmail, loginPass)
      dispatch(login({ user: data.user, token: data.token }))
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally { setLoading(false) }
  }

  const handleProfileClick = (u) => { if (loading) return; setEmail(u.email); setMode('form') }
  const handleFormSubmit   = (e) => { e.preventDefault(); if (!email || !pass) return; doLogin(email, pass) }
  const selectedUser = USERS_HINT.find(u => u.email === email)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.body }}>

      {/* Logo */}
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <img src={isDark ? "/logo-herion.png" : "/logo-dark-herion.png"} alt="Herion" style={{ height: 42, objectFit: 'contain' }} />
        </div>
        <div style={{ color: C.gold, fontSize: 11, letterSpacing: 6,
          textTransform: 'uppercase', marginBottom: 8 }}>
          Law
        </div>
        <div style={{ color: 'var(--textM)', fontSize: 13, letterSpacing: 0.3 }}>
          Sistema de Gestión Legal Integral con IA
        </div>
      </div>

      <div style={{ width: 40, height: 1, background: C.border, margin: '20px 0' }} />

      {error && (
        <div style={{ color: C.red, background: C.red + '15', border: `1px solid ${C.red}33`,
          borderRadius: 8, padding: '10px 20px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Modo perfiles */}
      {mode === 'perfiles' && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {USERS_HINT.map(u => (
              <div key={u.email}
                onClick={() => handleProfileClick(u)}
                onMouseEnter={() => setHovered(u.email)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${hovered === u.email ? C.gold : 'var(--border)'}`,
                  borderRadius: 10, padding: '28px 32px', textAlign: 'center',
                  cursor: 'pointer', minWidth: 180,
                  boxShadow: hovered === u.email ? `0 0 20px ${C.gold}33, 0 0 40px ${C.gold}15` : 'none',
                  transform: hovered === u.email ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.2s'
                }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: C.gold + '18', border: `1.5px solid ${C.gold}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: C.gold, margin: '0 auto',
                  boxShadow: hovered === u.email ? `0 0 14px ${C.gold}55` : 'none',
                  transition: 'all 0.2s'
                }}>
                  {u.short}
                </div>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 15, marginTop: 14 }}>{u.name}</div>
                <div style={{ color: 'var(--textS)', fontSize: 12, marginTop: 3 }}>{u.role}</div>
                <div style={{ marginTop: 14, color: C.gold, fontSize: 12 }}>Acceder →</div>
              </div>
            ))}
          </div>
          <div style={{ color: 'var(--textM)', fontSize: 12, marginBottom: 12 }}>
            Seleccione su perfil para acceder al sistema
          </div>
          <button onClick={() => setMode('form')}
            style={{ background: 'none', border: 'none', color: 'var(--textS)',
              cursor: 'pointer', fontSize: 12, textDecoration: 'underline',
              fontFamily: font.body }}>
            Iniciar sesión con email y contraseña
          </button>
        </>
      )}

      {/* Modo formulario */}
      {mode === 'form' && (
        <div style={{ background: 'var(--card)', border: `1px solid var(--border)`,
          borderRadius: 12, padding: '32px 36px', width: 360 }}>

          {selectedUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 24, padding: '12px 14px', background: 'var(--bg)',
              borderRadius: 8, border: `1px solid ${C.gold}33` }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%',
                background: C.gold + '18', border: `1.5px solid ${C.gold}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: C.gold }}>
                {selectedUser.short}
              </div>
              <div>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>{selectedUser.name}</div>
                <div style={{ color: 'var(--textS)', fontSize: 12 }}>{selectedUser.role}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'var(--textS)', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@lexdesk.es" style={inputStyle} required
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: 'var(--textS)', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
                Contraseña
              </label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" style={inputStyle} required autoFocus
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <button type="submit" disabled={loading || !email || !pass}
              style={{
                width: '100%',
                background: loading ? 'var(--textM)' : C.gold,
                color: '#0d0d0d', border: 'none', borderRadius: 8, padding: '11px',
                cursor: loading ? 'wait' : 'pointer', fontWeight: 600, fontSize: 14,
                marginBottom: 12, transition: 'all 0.2s', fontFamily: font.body,
                boxShadow: !loading ? `0 0 16px ${C.gold}55` : 'none'
              }}>
              {loading ? 'Accediendo...' : 'Iniciar sesión'}
            </button>
          </form>

          <button onClick={() => { setMode('perfiles'); setEmail(''); setPass(''); setError(null) }}
            style={{ width: '100%', background: 'none', border: 'none',
              color: 'var(--textS)', cursor: 'pointer', fontSize: 12,
              fontFamily: font.body }}>
            ← Volver a perfiles
          </button>
        </div>
      )}
    </div>
  )
}