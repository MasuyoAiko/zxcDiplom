import { useTheme } from '../context/ThemeContext'

function SunIcon() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM11 2h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM5.99 4.58l1.06 1.06-2.12 2.12L3.87 6.7 5.99 4.58Zm12.37 12.37 1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12ZM18.01 4.58l2.12 2.12-1.06 1.06-2.12-2.12 1.06-1.06ZM5.62 17.96l2.12 2.12-1.06 1.06-2.12-2.12 1.06-1.06Z"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10 7a7 7 0 0 0 10 10 9 9 0 1 1-10-10Zm2 2a7 7 0 0 1 7 7 5 5 0 0 0-7-7Z"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
