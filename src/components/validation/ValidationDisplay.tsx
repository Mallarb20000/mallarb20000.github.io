'use client'

import React from 'react'
import { ValidationResult, ValidationError, ValidationWarning } from '@/services/ValidationService'

interface ValidationDisplayProps {
  validation: ValidationResult | null
  showMetadata?: boolean
  compact?: boolean
  className?: string
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validation,
  showMetadata = true,
  compact = false,
  className = ''
}) => {
  if (!validation) return null

  const { errors, warnings, metadata } = validation

  const criticalErrors = errors.filter(e => e.severity === 'error')
  const minorErrors = errors.filter(e => e.severity === 'warning')

  return (
    <div className={`validation-display ${className}`}>
      {/* Critical Errors */}
      {criticalErrors.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h4 className="font-semibold text-red-700">
              Issues to Fix ({criticalErrors.length})
            </h4>
          </div>
          <div className="space-y-2">
            {criticalErrors.map((error, index) => (
              <ErrorItem key={`error-${index}`} error={error} compact={compact} />
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {minorErrors.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <h4 className="font-semibold text-yellow-700">
              Minor Issues ({minorErrors.length})
            </h4>
          </div>
          <div className="space-y-2">
            {minorErrors.map((error, index) => (
              <ErrorItem key={`warning-${index}`} error={error} compact={compact} />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {warnings.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h4 className="font-semibold text-blue-700">
              Suggestions ({warnings.length})
            </h4>
          </div>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <WarningItem key={`suggestion-${index}`} warning={warning} compact={compact} />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {showMetadata && !compact && (
        <ValidationMetadata metadata={metadata} />
      )}

      {/* Success State */}
      {criticalErrors.length === 0 && minorErrors.length === 0 && warnings.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">
            Great! Your essay meets all requirements.
          </span>
        </div>
      )}
    </div>
  )
}

interface ErrorItemProps {
  error: ValidationError
  compact: boolean
}

const ErrorItem: React.FC<ErrorItemProps> = ({ error, compact }) => {
  const severityColors = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  return (
    <div className={`p-3 rounded-lg border ${severityColors[error.severity]}`}>
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 ${iconColors[error.severity]}`}>
          {error.severity === 'error' && '⚠️'}
          {error.severity === 'warning' && '⚡'}
          {error.severity === 'info' && 'ℹ️'}
        </div>
        <div className="flex-1">
          <p className={compact ? 'text-sm' : 'text-base'}>
            {error.message}
          </p>
          {!compact && error.field && (
            <p className="text-xs mt-1 opacity-75">
              Field: {error.field}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface WarningItemProps {
  warning: ValidationWarning
  compact: boolean
}

const WarningItem: React.FC<WarningItemProps> = ({ warning, compact }) => {
  return (
    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
      <div className="flex items-start gap-2">
        <div className="text-blue-500 mt-0.5">💡</div>
        <div className="flex-1">
          <p className={`text-blue-800 ${compact ? 'text-sm' : 'text-base'}`}>
            {warning.message}
          </p>
          {!compact && warning.suggestion && (
            <p className="text-blue-700 text-sm mt-1 font-medium">
              💬 {warning.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ValidationMetadataProps {
  metadata: ValidationResult['metadata']
}

const ValidationMetadata: React.FC<ValidationMetadataProps> = ({ metadata }) => {
  const getBandScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6.5) return 'text-blue-600'
    if (score >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'text-green-600'
      case 'intermediate': return 'text-blue-600'
      default: return 'text-yellow-600'
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-3">Essay Analysis</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{metadata.wordCount}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{metadata.paragraphCount}</div>
          <div className="text-sm text-gray-600">Paragraphs</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{metadata.sentenceCount}</div>
          <div className="text-sm text-gray-600">Sentences</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getBandScoreColor(metadata.estimatedBandScore)}`}>
            {metadata.estimatedBandScore}
          </div>
          <div className="text-sm text-gray-600">Est. Band</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Average words per sentence:</span>
          <span className="font-medium">{metadata.averageWordsPerSentence.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Readability score:</span>
          <span className="font-medium">{metadata.readabilityScore.toFixed(0)}/100</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Complexity level:</span>
          <span className={`font-medium capitalize ${getComplexityColor(metadata.complexityLevel)}`}>
            {metadata.complexityLevel}
          </span>
        </div>
        
        {metadata.timeToComplete && (
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated time:</span>
            <span className="font-medium">{metadata.timeToComplete} minutes</span>
          </div>
        )}
      </div>
    </div>
  )
}