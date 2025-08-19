'use client'

import React, { useState } from 'react'
import { ChevronDownIcon } from './Icons'
import styles from './CollapsibleSection.module.css'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  comingSoon?: boolean
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = true,
  comingSoon = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = `section-content-${title.replace(/\s+/g, '-')}`

  return (
    <div className={`${styles.collapsibleSection} bg-white rounded-xl border border-slate-200 shadow-sm relative dark:bg-gray-800 dark:border-gray-700`}>
      {comingSoon && (
        <div className={`${styles.comingSoonOverlay} absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl dark:bg-gray-800 dark:bg-opacity-95`}>
          <div className="text-center p-8">
            <div className={`${styles.comingSoonIcon} mb-4 flex justify-center`}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 dark:text-gray-500">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <h3 className={`${styles.comingSoonTitle} text-xl font-semibold text-slate-800 mb-2 dark:text-gray-100`}>{title}</h3>
            <p className={`${styles.comingSoonText} text-lg font-medium text-slate-600 mb-3 dark:text-gray-300`}>Coming Soon</p>
            <p className={`${styles.comingSoonDescription} text-sm text-slate-500 max-w-sm dark:text-gray-400`}>This feature is being enhanced to provide even more detailed analysis.</p>
          </div>
        </div>
      )}
      
      <h2 className={`${styles.sectionTitle} text-2xl font-bold text-slate-900 dark:text-gray-100`}>
        <button
          onClick={() => !comingSoon && setIsOpen(!isOpen)}
          className={`${styles.sectionButton} w-full flex justify-between items-center p-6 text-left transition-colors dark:hover:bg-gray-700 ${
            comingSoon ? 'cursor-not-allowed' : 'hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          } ${
            isOpen && !comingSoon ? 'rounded-t-xl' : 'rounded-xl'
          }`}
          aria-expanded={!comingSoon && isOpen}
          aria-controls={contentId}
          disabled={comingSoon}
        >
          <span>{title}</span>
          <ChevronDownIcon
            className={`w-6 h-6 text-slate-500 dark:text-gray-400 transition-transform duration-300 shrink-0 ${
              isOpen && !comingSoon ? 'rotate-180' : ''
            } ${
              comingSoon ? 'opacity-50' : ''
            }`}
          />
        </button>
      </h2>
      <div
        id={contentId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen && !comingSoon ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`${styles.sectionContent} p-6 border-t border-slate-200 dark:border-gray-700 dark:bg-gray-800`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}