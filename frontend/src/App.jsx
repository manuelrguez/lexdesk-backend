import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from './hooks/useTheme.js'
import { Sidebar }     from './components/layout/Sidebar.jsx'
import { Login }       from './pages/Login/Login.jsx'
import { Dashboard }   from './pages/Dashboard/Dashboard.jsx'
import { Clientes }    from './pages/Clientes/Clientes.jsx'
import { Documentos }  from './pages/Documentos/Documentos.jsx'
import { Correo }      from './pages/Correo/Correo.jsx'
import { Agenda }      from './pages/Agenda/Agenda.jsx'
import { LexNet }      from './pages/LexNet/LexNet.jsx'
import { Facturacion } from './pages/Facturacion/Facturacion.jsx'
import { WhatsApp }    from './pages/WhatsApp/WhatsApp.jsx'
import { Perfil } from './pages/Perfil/Perfil.jsx'

export default function App() {
  const user = useSelector(s => s.auth.user)
  const [active, setActive] = useState('dashboard')
  const { isDark, toggle }  = useTheme()

  // Al hacer logout, resetear siempre a dashboard
  useEffect(() => {
    if (!user) setActive('dashboard')
  }, [user])

  if (!user) return <Login />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar active={active} setActive={setActive} isDark={isDark} onToggleTheme={toggle} />
      <main style={{ marginLeft: 225, flex: 1, padding: '28px 32px' }}>
        {active === 'dashboard'   && <Dashboard   setActive={setActive} />}
        {active === 'clientes'    && <Clientes />}
        {active === 'documentos'  && <Documentos />}
        {active === 'correo'      && <Correo />}
        {active === 'agenda'      && <Agenda />}
        {active === 'lexnet'      && <LexNet />}
        {active === 'facturacion' && <Facturacion />}
        {active === 'whatsapp'    && <WhatsApp />}
        {active === 'perfil' && <Perfil />}
      </main>
    </div>
  )
}