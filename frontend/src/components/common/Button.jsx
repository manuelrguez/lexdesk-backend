import { C } from '../../theme/colors.js'

export const Button = ({ children, color = C.gold, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    background: color, color: '#07101E', border: 'none', borderRadius: 8,
    padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 6, ...style,
  }}>
    {children}
  </button>
)
