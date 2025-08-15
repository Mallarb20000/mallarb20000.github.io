'use client'

import React from 'react'
import Link from 'next/link'

interface ModernPageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  className?: string
}

export default function ModernPageLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true,
  backUrl = '/',
  className = ''
}: ModernPageLayoutProps) {
  return (
    <div className={`modern-page-layout compact-layout ${className}`}>
      <div className="modern-page-container">
        {/* Header */}
        {(title || subtitle || showBackButton) && (
          <div className="modern-page-header">
            {showBackButton && (
              <div className="modern-page-back">
                <Link href={backUrl} className="modern-back-button">
                  <span className="modern-back-icon">←</span>
                  <span>Back to Home</span>
                </Link>
              </div>
            )}
            
            {(title || subtitle) && (
              <div className="modern-page-title-section">
                {title && (
                  <h1 className="modern-page-title">{title}</h1>
                )}
                {subtitle && (
                  <p className="modern-page-subtitle">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="modern-page-content">
          {children}
        </div>
      </div>
    </div>
  )
}