'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  
  // Try to use theme context, fallback if not available
  let theme: 'light' | 'dark' = currentTheme
  let toggleTheme: () => void = () => {}
  let hasContext = false

  try {
    const context = useTheme()
    theme = context.theme
    toggleTheme = context.toggleTheme
    hasContext = true
  } catch (error) {
    // Fallback when context is not available
    console.log('Theme context not available, using fallback')
  }

  useEffect(() => {
    setMounted(true)
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setCurrentTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const handleToggle = () => {
    if (hasContext) {
      toggleTheme()
    } else {
      // Fallback toggle
      const newTheme = theme === 'light' ? 'dark' : 'light'
      setCurrentTheme(newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
      // Force a re-render to update the UI
      window.dispatchEvent(new Event('storage'))
    }
  }

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) {
    return <div className="theme-toggle-placeholder" style={{ width: '64px', height: '32px' }}></div>
  }

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="toggle-track">
        <div className="toggle-labels">
          <span className={`toggle-label ${theme === 'light' ? 'active' : ''}`}>Light</span>
          <span className={`toggle-label ${theme === 'dark' ? 'active' : ''}`}>Dark</span>
        </div>
        <div className={`toggle-thumb ${theme === 'dark' ? 'dark' : 'light'}`}></div>
      </div>
    </button>
  )
}