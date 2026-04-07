import { C } from '../../theme/colors.js'

export const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: '#000000aa',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  }}>
    <div style={{ background: C.sidebar, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, minWidth: 480, maxWidth: 600, width: '90%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: C.text }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textS, cursor: 'pointer', fontSize: 20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
)
