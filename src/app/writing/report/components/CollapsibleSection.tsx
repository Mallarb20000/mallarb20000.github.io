'use client'

import React, { useState } from 'react'
import { ChevronDownIcon } from './Icons'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = `section-content-${title.replace(/\s+/g, '-')}`

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
            isOpen ? 'rounded-t-xl' : 'rounded-xl'
          }`}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span>{title}</span>
          <ChevronDownIcon
            className={`w-6 h-6 text-slate-500 transition-transform duration-300 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h2>
      <div
        id={contentId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 border-t border-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}