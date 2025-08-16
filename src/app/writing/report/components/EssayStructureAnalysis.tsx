'use client'

import React from 'react'
import { CheckCircleIcon } from './Icons'

interface StructuralElement {
  text: string
  score: 'good' | 'needs_work' | 'poor'
  feedback: string
}

interface EssayStructureAnalysisProps {
  structuralAnalysis: {
    hook?: StructuralElement
    thesis?: StructuralElement
  }
}

const getScoreBadgeClasses = (score: 'good' | 'needs_work' | 'poor'): string => {
  switch (score) {
    case 'good':
      return 'bg-green-100 text-green-800'
    case 'needs_work':
      return 'bg-amber-100 text-amber-800'
    case 'poor':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const improvementTips = {
  hook: [
    "Start with a surprising statistic or thought-provoking question.",
    "Avoid generic statements like 'In today's world...'.",
    "Make sure your hook directly relates to the essay topic.",
    "Keep it concise but engaging."
  ],
  thesis: [
    "Clearly state your position on the topic.",
    "Include 2-3 main points you'll discuss.",
    "Make it specific and arguable.",
    "Place it at the end of your introduction paragraph."
  ]
}

const AnalysisCard: React.FC<{ 
  title: string
  element: StructuralElement | undefined
  tips: string[] 
}> = ({ title, element, tips }) => {
  if (!element) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-slate-800">{title}</h4>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Not Found
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {title} was not clearly identified in your essay.
        </p>
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">How to Improve:</p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start text-sm text-slate-600">
                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const badgeClasses = getScoreBadgeClasses(element.score)
  const scoreText = element.score.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-slate-800">{title}</h4>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeClasses}`}>
          {scoreText}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-600 mb-2">Identified Text:</p>
        <blockquote className="border-l-4 border-slate-200 pl-4 py-2 bg-slate-50 rounded-r-md text-slate-700 italic">
          "{element.text}"
        </blockquote>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-600 mb-2">Assessment:</p>
        <p className="text-sm text-slate-600 leading-relaxed">{element.feedback}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">How to Improve:</p>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start text-sm text-slate-600">
              <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const EssayStructureAnalysis: React.FC<EssayStructureAnalysisProps> = ({ structuralAnalysis }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AnalysisCard title="Hook Sentence" element={structuralAnalysis.hook} tips={improvementTips.hook} />
      <AnalysisCard title="Thesis Statement" element={structuralAnalysis.thesis} tips={improvementTips.thesis} />
    </div>
  )
}