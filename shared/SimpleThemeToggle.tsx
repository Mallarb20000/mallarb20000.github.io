'use client'

import { useState, useEffect } from 'react'

export default function SimpleThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const initialTheme = storedTheme || systemPreference
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    } catch (error) {
      setTheme('light')
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="theme-toggle">
        <div className="theme-toggle-track">
          <div className="theme-toggle-thumb">
            <span className="theme-toggle-icon">☀️</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${theme === 'dark' ? 'theme-toggle-thumb-dark' : ''}`}>
          <span className="theme-toggle-icon">
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </div>
      </div>
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </button>
  )
}