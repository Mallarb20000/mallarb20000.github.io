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
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-amber-800 text-lg mb-3 uppercase tracking-wide">
          Essay Question
        </h3>
        <p className="text-lg leading-relaxed text-slate-800 font-medium text-justify">
          {prompt}
        </p>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg">
        <p className="text-sm text-slate-600">
          <strong>Word Count:</strong> {wordCount} words
        </p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Your Essay</h4>
        <div className="prose prose-slate max-w-none">
          {essayText.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-slate-700 leading-relaxed text-justify">
              {paragraph.trim() || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}