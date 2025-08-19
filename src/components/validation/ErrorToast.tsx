'use client'

import React, { useState, useEffect } from 'react'
import { ValidationError, ValidationWarning } from '@/services/ValidationService'

interface ErrorToastProps {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  autoHide?: boolean
  hideDelay?: number
  onDismiss?: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  className?: string
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  errors,
  warnings,
  autoHide = true,
  hideDelay = 5000,
  onDismiss,
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set())

  type ItemWithCategory = (ValidationError & { category: 'error' }) | (ValidationWarning & { category: 'warning' })
  
  const allItems: ItemWithCategory[] = [
    ...errors.map(e => ({ ...e, category: 'error' as const })),
    ...warnings.map(w => ({ ...w, category: 'warning' as const }))
  ]

  const visibleItems = allItems.filter(item => !dismissedItems.has(item.code))

  useEffect(() => {
    if (autoHide && visibleItems.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300)
      }, hideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, onDismiss, visibleItems.length])

  const dismissItem = (code: string) => {
    setDismissedItems(prev => new Set(Array.from(prev).concat(code)))
  }

  const dismissAll = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  if (!isVisible || visibleItems.length === 0) return null

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2'
  }

  const criticalErrors = visibleItems.filter(item => item.category === 'error' && 'severity' in item && item.severity === 'error')
  const minorIssues = visibleItems.filter(item => 
    (item.category === 'error' && 'severity' in item && item.severity !== 'error') || 
    item.category === 'warning'
  )

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm ${className}`}>
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {criticalErrors.length > 0 ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-red-700 text-sm">
                  {criticalErrors.length} Critical Issue{criticalErrors.length !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="font-semibold text-yellow-700 text-sm">
                  {minorIssues.length} Suggestion{minorIssues.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          <button
            onClick={dismissAll}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Critical Errors */}
          {criticalErrors.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              {criticalErrors.slice(0, 3).map((item, index) => (
                <ToastItem
                  key={`critical-${index}`}
                  item={item}
                  onDismiss={() => dismissItem(item.code)}
                  severity="error"
                />
              ))}
              {criticalErrors.length > 3 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{criticalErrors.length - 3} more critical issues
                </div>
              )}
            </div>
          )}

          {/* Minor Issues */}
          {minorIssues.length > 0 && (
            <div className="p-3">
              {minorIssues.slice(0, 2).map((item, index) => (
                <ToastItem
                  key={`minor-${index}`}
                  item={item}
                  onDismiss={() => dismissItem(item.code)}
                  severity="warning"
                />
              ))}
              {minorIssues.length > 2 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{minorIssues.length - 2} more suggestions
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!autoHide && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={dismissAll}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Dismiss All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ToastItemProps {
  item: (ValidationError & { category: 'error' }) | (ValidationWarning & { category: 'warning' })
  onDismiss: () => void
  severity: 'error' | 'warning'
}

const ToastItem: React.FC<ToastItemProps> = ({ item, onDismiss, severity }) => {
  const severityConfig = {
    error: {
      icon: '⚠️',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    warning: {
      icon: '💡',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    }
  }

  const config = severityConfig[severity]

  return (
    <div className={`mb-2 last:mb-0 p-2 rounded ${config.bgColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-sm">{config.icon}</span>
          <div className="flex-1">
            <p className={`text-xs ${config.textColor} leading-tight`}>
              {item.message}
            </p>
            {item.category === 'warning' && 'suggestion' in item && item.suggestion && (
              <p className="text-xs text-gray-600 mt-1">
                💬 {item.suggestion}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ErrorToast