import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/authSlice.js'
import { authService } from '../../services/auth.service.js'
import { C } from '../../theme/colors.js'
import { font } from '../../theme/typography.js'

const card = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 24, ...extra,
})
const inputStyle = {
  width: '100%', background: 'var(--bg)', border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, padding: '9px 12px',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const btn = (col = C.gold, extra = {}) => ({
  background: col, color: col === C.gold ? '#07101E' : '#fff',
  border: 'none', borderRadius: 8, padding: '9px 20px',
  cursor: 'pointer', fontWeight: 700, fontSize: 13,
  display: 'flex', alignItems: 'center', gap: 6, ...extra,
})

const COLORS = [
  { val: '#E5BC55', label: 'Dorado'  },
  { val: '#3A80C2', label: 'Azul'    },
  { val: '#7A62D2', label: 'Púrpura' },
  { val: '#3BAD78', label: 'Verde'   },
  { val: '#C44848', label: 'Rojo'    },
  { val: '#C88020', label: 'Ámbar'   },
]

const Lbl = ({ children }) => (
  <label style={{ display: 'block', color: C.textS, fontSize: 13, marginBottom: 5, marginTop: 16 }}>
    {children}
  </label>
)

export const Perfil = () => {
  const dispatch = useDispatch()
  const user     = useSelector(s => s.auth.user)

  const [form,    setForm]    = useState({ name: '', email: '', color: C.gold, short: '' })
  const [saving,  setSaving]  = useState(false)
  const [msgInfo, setMsgInfo] = useState(null)

  const [passForm,    setPassForm]    = useState({ current_password: '', new_password: '', confirm: '' })
  const [savingPass,  setSavingPass]  = useState(false)
  const [msgPass,     setMsgPass]     = useState(null)

  useEffect(() => {
    authService.getProfile().then(({ data }) => {
      setForm({ name: data.name, email: data.email, color: data.color, short: data.short })
    }).catch(() => {})
  }, [])

  const handleSaveInfo = async () => {
    setSaving(true); setMsgInfo(null)
    try {
      const { data } = await authService.updateProfile(form)
      // Actualizar Redux con los nuevos datos
      dispatch(login({ user: { ...user, ...data }, token: JSON.parse(localStorage.getItem('lexdesk_auth')).token }))
      setMsgInfo({ ok: true, text: 'Perfil actualizado correctamente' })
    } catch (err) {
      setMsgInfo({ ok: false, text: err.response?.data?.error || 'Error guardando perfil' })
    } finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    setMsgPass(null)
    if (passForm.new_password !== passForm.confirm)
      return setMsgPass({ ok: false, text: 'Las contraseñas no coinciden' })
    if (passForm.new_password.length < 6)
      return setMsgPass({ ok: false, text: 'La contraseña debe tener al menos 6 caracteres' })

    setSavingPass(true)
    try {
      await authService.changePassword({
        current_password: passForm.current_password,
        new_password:     passForm.new_password,
      })
      setMsgPass({ ok: true, text: 'Contraseña cambiada correctamente' })
      setPassForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      setMsgPass({ ok: false, text: err.response?.data?.error || 'Error cambiando contraseña' })
    } finally { setSavingPass(false) }
  }

  const set     = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setPass = (k, v) => setPassForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ fontFamily: font.display, fontSize: 28, color: C.text, fontWeight: 600, marginBottom: 24 }}>
        Mi perfil
      </div>

      {/* Avatar preview */}
      <div style={{ ...card(), marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%',
          background: form.color + '22', border: `2px solid ${form.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700, color: form.color, flexShrink: 0 }}>
          {form.short || '?'}
        </div>
        <div>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>{form.name || '—'}</div>
          <div style={{ color: C.textS, fontSize: 14, marginTop: 2 }}>{user?.role}</div>
          <div style={{ color: C.textM, fontSize: 13, marginTop: 2 }}>{form.email}</div>
        </div>
      </div>

      {/* Datos personales */}
      <div style={{ ...card(), marginBottom: 20 }}>
        <div style={{ color: C.textS, fontSize: 12, textTransform: 'uppercase',
          letterSpacing: 1, marginBottom: 4 }}>
          Información personal
        </div>

        <Lbl>Nombre completo</Lbl>
        <input value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Nombre Apellido" style={inputStyle} />

        <Lbl>Email</Lbl>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="usuario@lexdesk.es" style={inputStyle} />

        <Lbl>Iniciales (se muestran en el avatar)</Lbl>
        <input value={form.short} onChange={e => set('short', e.target.value.slice(0,3).toUpperCase())}
          placeholder="MG" maxLength={3}
          style={{ ...inputStyle, width: 80, textTransform: 'uppercase', textAlign: 'center', fontWeight: 700 }} />

        <Lbl>Color de identificación</Lbl>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {COLORS.map(c => (
            <button key={c.val} onClick={() => set('color', c.val)}
              title={c.label}
              style={{ width: 36, height: 36, borderRadius: '50%', background: c.val,
                border: form.color === c.val ? `3px solid ${C.text}` : '3px solid transparent',
                cursor: 'pointer', transition: 'border 0.15s' }} />
          ))}
        </div>

        {msgInfo && (
          <div style={{ marginTop: 14, color: msgInfo.ok ? C.green : C.red,
            background: (msgInfo.ok ? C.green : C.red) + '18',
            border: `1px solid ${(msgInfo.ok ? C.green : C.red)}44`,
            borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
            {msgInfo.text}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSaveInfo} disabled={saving}
            style={btn(C.gold)}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div style={card()}>
        <div style={{ color: C.textS, fontSize: 12, textTransform: 'uppercase',
          letterSpacing: 1, marginBottom: 4 }}>
          Cambiar contraseña
        </div>

        <Lbl>Contraseña actual</Lbl>
        <input type="password" value={passForm.current_password}
          onChange={e => setPass('current_password', e.target.value)}
          placeholder="••••••••" style={inputStyle} />

        <Lbl>Nueva contraseña</Lbl>
        <input type="password" value={passForm.new_password}
          onChange={e => setPass('new_password', e.target.value)}
          placeholder="Mínimo 6 caracteres" style={inputStyle} />

        <Lbl>Confirmar nueva contraseña</Lbl>
        <input type="password" value={passForm.confirm}
          onChange={e => setPass('confirm', e.target.value)}
          placeholder="Repite la contraseña" style={inputStyle} />

        {msgPass && (
          <div style={{ marginTop: 14, color: msgPass.ok ? C.green : C.red,
            background: (msgPass.ok ? C.green : C.red) + '18',
            border: `1px solid ${(msgPass.ok ? C.green : C.red)}44`,
            borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
            {msgPass.text}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleChangePassword} disabled={savingPass}
            style={btn(C.blue)}>
            {savingPass ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </div>
    </div>
  )
}