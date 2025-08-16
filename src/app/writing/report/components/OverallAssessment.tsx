'use client'

import React from 'react'

interface OverallAssessmentProps {
  overallBand: number
  overallFeedback: string
  wordCount: number
  confidence: number
}

const getBandDescription = (band: number) => {
  if (band >= 8) return "Excellent"
  if (band >= 7) return "Good"
  if (band >= 6) return "Competent"
  if (band >= 5) return "Modest"
  return "Limited"
}

const getBandColor = (band: number) => {
  if (band >= 7) return 'text-green-600'
  if (band >= 5) return 'text-amber-600'
  return 'text-red-600'
}

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-50 p-4 rounded-lg text-center">
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
)

export const OverallAssessment: React.FC<OverallAssessmentProps> = ({ 
  overallBand, 
  overallFeedback, 
  wordCount, 
  confidence 
}) => {
  const bandColor = getBandColor(overallBand)
  const bandDescription = getBandDescription(overallBand)

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Overall Assessment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-slate-50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-6xl font-bold ${bandColor}`}>{overallBand}</span>
                  <p className={`text-sm font-semibold ${bandColor}`}>{bandDescription}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Overall Feedback</h3>
            <p className="text-slate-600 leading-relaxed">{overallFeedback}</p>
          </div>
        </div>
        <div className="space-y-4">
          <StatBox label="Word Count" value={wordCount} />
          <StatBox label="Analysis Confidence" value={`${Math.round(confidence * 100)}%`} />
        </div>
      </div>
    </section>
  )
}