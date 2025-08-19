'use client'

import React from 'react'

interface ProgressIndicatorProps {
  wordProgress: number
  timeProgress: number
  structureProgress: number
  taskType: 'task1' | 'task2'
  currentWords: number
  targetWords: number
  className?: string
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  wordProgress,
  timeProgress,
  structureProgress,
  taskType,
  currentWords,
  targetWords,
  className = ''
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 80) return 'bg-blue-500'
    if (progress >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-green-700'
    if (progress >= 80) return 'text-blue-700'
    if (progress >= 60) return 'text-yellow-700'
    return 'text-red-700'
  }

  const requirements = {
    task1: { minWords: 150, maxWords: 200, minParagraphs: 3 },
    task2: { minWords: 250, maxWords: 350, minParagraphs: 4 }
  }

  const req = requirements[taskType]

  return (
    <div className={`progress-indicator ${className}`}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Word Count Progress */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(wordProgress, 100) / 100)}`}
                className={getProgressColor(wordProgress).replace('bg-', 'text-')}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${getProgressTextColor(wordProgress)}`}>
                {Math.round(wordProgress)}%
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Words</div>
          <div className="text-xs text-gray-500">
            {currentWords} / {req.minWords}
            {currentWords > req.maxWords && (
              <span className="text-yellow-600"> (over {req.maxWords})</span>
            )}
          </div>
        </div>

        {/* Structure Progress */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(structureProgress, 100) / 100)}`}
                className={getProgressColor(structureProgress).replace('bg-', 'text-')}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${getProgressTextColor(structureProgress)}`}>
                {Math.round(structureProgress)}%
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Structure</div>
          <div className="text-xs text-gray-500">Min {req.minParagraphs} paragraphs</div>
        </div>

        {/* Time Progress */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(timeProgress, 100) / 100)}`}
                className={getProgressColor(timeProgress).replace('bg-', 'text-')}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${getProgressTextColor(timeProgress)}`}>
                {Math.round(timeProgress)}%
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">Progress</div>
          <div className="text-xs text-gray-500">
            Target: {taskType === 'task1' ? '20' : '40'} min
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className={`font-bold ${getProgressTextColor((wordProgress + structureProgress) / 2)}`}>
            {Math.round((wordProgress + structureProgress) / 2)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor((wordProgress + structureProgress) / 2)}`}
            style={{ width: `${Math.min((wordProgress + structureProgress) / 2, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-3 space-y-1">
        {wordProgress < 80 && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Need {Math.max(0, req.minWords - currentWords)} more words to reach minimum
          </div>
        )}
        
        {wordProgress >= 100 && currentWords <= req.maxWords && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Perfect word count! 
          </div>
        )}
        
        {currentWords > req.maxWords && (
          <div className="text-xs text-yellow-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Consider reducing by {currentWords - req.maxWords} words
          </div>
        )}
        
        {structureProgress >= 100 && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Good paragraph structure!
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressIndicator