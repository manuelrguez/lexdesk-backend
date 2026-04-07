import { C } from '../../theme/colors.js'

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 20, ...style,
  }}>
    {children}
  </div>
)
