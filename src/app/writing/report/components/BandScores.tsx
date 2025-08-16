'use client'

import React from 'react'
import { BookOpenIcon, Edit3Icon, Link2Icon, TargetIcon } from './Icons'

interface BandScore {
  score: number
  justification: string
}

interface BandScoresProps {
  bandScores: {
    taskResponse: BandScore
    coherenceCohesion: BandScore
    lexicalResource: BandScore
    grammarAccuracy: BandScore
  }
}

const getBandColorClasses = (score: number): string => {
  if (score >= 7) return 'border-green-600 bg-green-50 text-green-700'
  if (score >= 5) return 'border-amber-600 bg-amber-50 text-amber-700'
  return 'border-red-600 bg-red-50 text-red-700'
}

const BandScoreCard: React.FC<{ 
  title: string
  score: number
  justification: string
  icon: React.ReactNode 
}> = ({ title, score, justification, icon }) => {
  const colorClasses = getBandColorClasses(score)

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.split(' ')[1]}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{title}</h4>
          <p className={`text-2xl font-bold ${colorClasses.split(' ')[2]}`}>Band {score}</p>
        </div>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">{justification}</p>
    </div>
  )
}

export const BandScores: React.FC<BandScoresProps> = ({ bandScores }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <BandScoreCard
        title="Task Response"
        score={bandScores.taskResponse.score}
        justification={bandScores.taskResponse.justification}
        icon={<TargetIcon className="w-6 h-6" />}
      />
      <BandScoreCard
        title="Coherence & Cohesion"
        score={bandScores.coherenceCohesion.score}
        justification={bandScores.coherenceCohesion.justification}
        icon={<Link2Icon className="w-6 h-6" />}
      />
      <BandScoreCard
        title="Lexical Resource"
        score={bandScores.lexicalResource.score}
        justification={bandScores.lexicalResource.justification}
        icon={<BookOpenIcon className="w-6 h-6" />}
      />
      <BandScoreCard
        title="Grammar & Accuracy"
        score={bandScores.grammarAccuracy.score}
        justification={bandScores.grammarAccuracy.justification}
        icon={<Edit3Icon className="w-6 h-6" />}
      />
    </div>
  )
}