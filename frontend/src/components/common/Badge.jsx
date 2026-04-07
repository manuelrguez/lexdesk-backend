export const Badge = ({ label, color }) => (
  <span style={{ fontSize: 11, color, background: color + '22', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
    {label}
  </span>
)
