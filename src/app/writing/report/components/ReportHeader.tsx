'use client'

import React from 'react'
import { FileTextIcon, DownloadIcon, AlertTriangleIcon } from './Icons'

interface ReportHeaderProps {
  timestamp: string
  onDownloadTxt: () => void
  onDownloadPdf: () => void
  isPdfGenerating?: boolean
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  timestamp, 
  onDownloadTxt, 
  onDownloadPdf, 
  isPdfGenerating = false 
}) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">IELTS Writing Analysis Report</h1>
          <p className="text-slate-500 mt-1">
            Generated on {new Date(timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button 
            onClick={onDownloadTxt} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            <FileTextIcon className="w-4 h-4" />
            Download Text
          </button>
          <button 
            onClick={onDownloadPdf} 
            disabled={isPdfGenerating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            <DownloadIcon className="w-4 h-4" />
            {isPdfGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
      
      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg print:hidden" role="alert">
        <div className="flex">
          <div className="py-1">
            <AlertTriangleIcon className="w-6 h-6 text-amber-500 mr-4" />
          </div>
          <div>
            <p className="font-bold">Important</p>
            <p className="text-sm">Please download this report before refreshing or leaving the page as the data is not saved permanently.</p>
          </div>
        </div>
      </div>
    </header>
  )
}