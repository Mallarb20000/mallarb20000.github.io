'use client'

import React from 'react'

interface EssayDisplayProps {
  prompt: string
  essayText: string
  wordCount: number
}

export const EssayDisplay: React.FC<EssayDisplayProps> = ({ prompt, essayText, wordCount }) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg mb-3 uppercase tracking-wide">
          Essay Question
        </h3>
        <p className="text-lg leading-relaxed text-slate-800 dark:text-gray-200 font-medium text-justify">
          {prompt}
        </p>
      </div>
      
      <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-gray-300">
          <strong>Word Count:</strong> {wordCount} words
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4">Your Essay</h4>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {essayText.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-slate-700 dark:text-gray-300 leading-relaxed text-justify">
              {paragraph.trim() || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}