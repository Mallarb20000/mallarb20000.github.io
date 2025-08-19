'use client';

import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration and initial theme setup
  useEffect(() => {
    setMounted(true);
    
    // Get initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    
    // Apply theme immediately
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const theme = dark ? 'dark' : 'light';
    
    // Apply all possible theme selectors immediately
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = dark ? 'dark-mode' : 'light-mode';
    
    // Add class to html element
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Force immediate style update
    document.documentElement.style.setProperty('--bg-primary', dark ? '#1a1b23' : '#ffffff');
    document.documentElement.style.setProperty('--color-primary', dark ? '#ffffff' : '#1a1a1a');
    
    // Debug logging
    console.log('Theme applied:', {
      theme,
      isDark: dark,
      documentElement: {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        classList: Array.from(document.documentElement.classList),
        bodyClassName: document.body.className
      }
    });
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Save to localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    // Apply theme immediately
    applyTheme(newIsDark);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  return (
    <button 
      className="theme-toggle-button relative"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="toggle-track">
        <div className="toggle-labels">
          <span className={`toggle-label ${!isDark ? 'active' : ''}`}>Light</span>
          <span className={`toggle-label ${isDark ? 'active' : ''}`}>Dark</span>
        </div>
        <div className={`toggle-thumb ${isDark ? 'dark' : 'light'}`}></div>
      </div>
      
      {/* Debug indicator */}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}