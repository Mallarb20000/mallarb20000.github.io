'use client'

import React, { useState, useEffect, useRef } from 'react'
import { validationService, ValidationResult } from '@/services/ValidationService'
import { ValidationDisplay } from './ValidationDisplay'
import { ProgressIndicator } from './ProgressIndicator'

interface RealTimeValidatorProps {
  text: string
  taskType: 'task1' | 'task2'
  onValidationChange?: (result: ValidationResult) => void
  showProgress?: boolean
  showDetails?: boolean
  debounceMs?: number
  className?: string
}

export const RealTimeValidator: React.FC<RealTimeValidatorProps> = ({
  text,
  taskType,
  onValidationChange,
  showProgress = true,
  showDetails = true,
  debounceMs = 500,
  className = ''
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const callbackId = useRef<string>(`validator-${Math.random()}`)

  useEffect(() => {
    setIsValidating(true)
    
    validationService.validateRealTime(
      text,
      taskType,
      callbackId.current,
      (result: ValidationResult) => {
        setValidationResult(result)
        setIsValidating(false)
        onValidationChange?.(result)
      },
      debounceMs
    )

    return () => {
      validationService.clearRealTimeValidation(callbackId.current)
    }
  }, [text, taskType, onValidationChange, debounceMs])

  const progress = validationResult 
    ? validationService.getProgressIndicator(text, taskType)
    : { wordProgress: 0, timeProgress: 0, structureProgress: 0 }

  const wordCount = validationService.getWordCount(text)
  const requirements = {
    task1: { minWords: 150, maxWords: 200 },
    task2: { minWords: 250, maxWords: 350 }
  }
  const targetWords = requirements[taskType].minWords

  return (
    <div className={`real-time-validator ${className}`}>
      {/* Validation Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isValidating 
              ? 'bg-yellow-400 animate-pulse' 
              : validationResult?.isValid 
                ? 'bg-green-400' 
                : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isValidating 
              ? 'Validating...' 
              : validationResult?.isValid 
                ? 'All requirements met' 
                : 'Issues found'
            }
          </span>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span>{validationService.getParagraphCount(text)} paragraphs</span>
          {validationResult && (
            <span className="font-medium">
              Band {validationResult.metadata.estimatedBandScore}
            </span>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {showProgress && (
        <div className="mb-6">
          <ProgressIndicator
            wordProgress={progress.wordProgress}
            timeProgress={progress.timeProgress}
            structureProgress={progress.structureProgress}
            taskType={taskType}
            currentWords={wordCount}
            targetWords={targetWords}
          />
        </div>
      )}

      {/* Validation Details */}
      {showDetails && validationResult && (
        <ValidationDisplay
          validation={validationResult}
          showMetadata={true}
          compact={false}
        />
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Analyzing your essay...</span>
        </div>
      )}
    </div>
  )
}

export default RealTimeValidator