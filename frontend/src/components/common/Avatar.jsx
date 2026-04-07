export const Avatar = ({ user: u, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: u.color + '22',
    border: `1.5px solid ${u.color}`, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: u.color, flexShrink: 0,
  }}>
    {u.short}
  </div>
)
