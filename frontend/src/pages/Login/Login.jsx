import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../store/authSlice.js'
import { authService } from '../../services/auth.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

const USERS_HINT = [
  { email: 'maria@lexdesk.es',  name: 'María García',     role: 'Abogada Senior', color: C.gold,   short: 'MG' },
  { email: 'carlos@lexdesk.es', name: 'Carlos Rodríguez', role: 'Abogado',        color: C.blue,   short: 'CR' },
  { email: 'ana@lexdesk.es',    name: 'Ana Martínez',     role: 'Procuradora',    color: C.purple, short: 'AM' },
]

const inputStyle = {
  width: '100%', background: 'var(--card)', border: `1px solid ${C.border}`,
  borderRadius: 8, color: 'var(--text)', padding: '10px 14px',
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
}

export const Login = () => {
  const dispatch  = useDispatch()
  const [mode,    setMode]    = useState('perfiles')  // 'perfiles' | 'form'
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

  const handleProfileClick = (u) => {
    if (loading) return
    setEmail(u.email)
    setMode('form')
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!email || !pass) return
    doLogin(email, pass)
  }

  const selectedUser = USERS_HINT.find(u => u.email === email)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: font.body }}>

      {/* Logo */}
      <div style={{ marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: C.gold, letterSpacing: 4, marginBottom: 10, textTransform: 'uppercase' }}>
          Despacho Jurídico
        </div>
        <div style={{ fontFamily: font.display, fontSize: 52, color: 'var(--text)', fontWeight: 600, letterSpacing: 2 }}>
          <span style={{ color: C.gold }}>⚖</span> LexDesk Pro
        </div>
        <div style={{ color: 'var(--textM)', fontSize: 14, marginTop: 6, letterSpacing: 1 }}>
          Sistema de Gestión Legal Integral con IA
        </div>
      </div>

      <div style={{ width: 1, height: 32, background: C.border, margin: '24px 0' }} />

      {error && (
        <div style={{ color: C.red, background: C.red + '18', border: `1px solid ${C.red}44`,
          borderRadius: 8, padding: '10px 20px', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Modo perfiles */}
      {mode === 'perfiles' && (
        <>
          <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
            {USERS_HINT.map(u => (
              <div key={u.email}
                onClick={() => handleProfileClick(u)}
                onMouseEnter={() => setHovered(u.email)}
                onMouseLeave={() => setHovered(null)}
                style={{ background: 'var(--card)',
                  border: `1px solid ${hovered === u.email ? u.color : C.border}`,
                  borderRadius: 12, padding: '32px 36px', textAlign: 'center',
                  cursor: 'pointer', minWidth: 190,
                  boxShadow: hovered === u.email ? `0 0 20px ${u.color}30` : 'none',
                  transform: hovered === u.email ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%',
                  background: u.color + '22', border: `1.5px solid ${u.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: u.color, margin: '0 auto' }}>
                  {u.short}
                </div>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 17, marginTop: 16 }}>{u.name}</div>
                <div style={{ color: C.textS, fontSize: 13, marginTop: 4 }}>{u.role}</div>
                <div style={{ marginTop: 16, color: u.color, fontSize: 12 }}>Acceder →</div>
              </div>
            ))}
          </div>
          <div style={{ color: 'var(--textM)', fontSize: 12, marginBottom: 16 }}>
            Seleccione su perfil para acceder al sistema
          </div>
          <button onClick={() => setMode('form')}
            style={{ background: 'none', border: 'none', color: C.textS,
              cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
            Iniciar sesión con email y contraseña
          </button>
        </>
      )}

      {/* Modo formulario */}
      {mode === 'form' && (
        <div style={{ background: 'var(--card)', border: `1px solid ${C.border}`,
          borderRadius: 14, padding: '36px 40px', width: 380 }}>

          {selectedUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 28, padding: '14px 16px', background: 'var(--bg)',
              borderRadius: 10, border: `1px solid ${selectedUser.color}44` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%',
                background: selectedUser.color + '22', border: `1.5px solid ${selectedUser.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: selectedUser.color }}>
                {selectedUser.short}
              </div>
              <div>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 15 }}>{selectedUser.name}</div>
                <div style={{ color: C.textS, fontSize: 13 }}>{selectedUser.role}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.textS, fontSize: 13, marginBottom: 6 }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@lexdesk.es" style={inputStyle} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: C.textS, fontSize: 13, marginBottom: 6 }}>
                Contraseña
              </label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" style={inputStyle} required autoFocus />
            </div>
            <button type="submit" disabled={loading || !email || !pass}
              style={{ width: '100%', background: loading ? C.textM : C.gold,
                color: '#07101E', border: 'none', borderRadius: 8, padding: '12px',
                cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 15,
                marginBottom: 14 }}>
              {loading ? 'Accediendo...' : 'Iniciar sesión'}
            </button>
          </form>

          <button onClick={() => { setMode('perfiles'); setEmail(''); setPass(''); setError(null) }}
            style={{ width: '100%', background: 'none', border: 'none',
              color: C.textS, cursor: 'pointer', fontSize: 13 }}>
            ← Volver a perfiles
          </button>
        </div>
      )}
    </div>
  )
}