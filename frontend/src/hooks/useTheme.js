import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('lexdesk_theme')
    return saved ? saved === 'dark' : true  // oscuro por defecto
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
    }
    localStorage.setItem('lexdesk_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => setIsDark(p => !p)

  return { isDark, toggle }
}