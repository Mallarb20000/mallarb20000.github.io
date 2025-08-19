'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReportHeader } from './components/ReportHeader'
import { OverallAssessment } from './components/OverallAssessment'
import { CollapsibleSection } from './components/CollapsibleSection'
import { BandScores } from './components/BandScores'
import { EssayStructureAnalysis } from './components/EssayStructureAnalysis'
import { EssayDisplay } from './components/EssayDisplay'
import ThemeToggle from '../../../components/ThemeToggle'
import './report.css'

// Import jsPDF for PDF generation
declare global {
  interface Window {
    jsPDF: any;
    html2canvas: any;
  }
}

// --- TYPE DEFINITIONS ---
interface BandScore {
  score: number
  justification: string
}

interface StructuralElement {
  text: string
  score: 'good' | 'needs_work' | 'poor'
  feedback: string
  criteria?: Record<string, string>
}

interface EssaySection {
  sectionType: 'introduction' | 'body' | 'conclusion'
  overallScore: 'good' | 'needs_work' | 'poor'
  overallFeedback: string
  wordCount: number
  components: {
    [key: string]: StructuralElement
  }
}

interface Annotation {
  text: string
  startIndex: number
  endIndex: number
  type: 'good' | 'needs_work' | 'error'
  element: string
  message: string
  suggestion?: string
}

interface AnalysisResult {
  wordCount: number
  timestamp: string
  structuralAnalysis: {
    introduction?: EssaySection
    bodyParagraphs?: EssaySection[]
    conclusion?: EssaySection
    overallStructure: {
      score: string
      feedback: string
      paragraph_count: number
      logical_flow: string
    }
    // Legacy support for old format
    hook?: StructuralElement
    thesis?: StructuralElement
    topicSentences?: Array<{
      paragraph: number
      text: string
      score: string
      feedback: string
    }>
  }
  bandScores: {
    taskResponse: BandScore
    coherenceCohesion: BandScore
    lexicalResource: BandScore
    grammarAccuracy: BandScore
  }
  overallBand: number
  overallFeedback: string
  annotations: Annotation[]
  metadata: {
    analysisMethod: string
    confidence: number
  }
  prompt?: string
}

// --- COMPONENTS ---

const EssaySectionAnalysis: React.FC<{
  section: EssaySection | null
  sectionName: string
  expectedComponents: string[]
  improvementTips: Record<string, string[]>
}> = ({ section, sectionName, expectedComponents, improvementTips }) => {
  const getScoreClass = (score: string) => {
    switch (score) {
      case 'good': return 'score-good'
      case 'needs_work': return 'score-needs-work'
      case 'poor': return 'score-poor'
      default: return 'score-needs-work'
    }
  }

  if (!section) {
    return (
      <div className="essay-section-analysis">
        <div className="section-header">
          <h3>{sectionName}</h3>
          <span className="score-badge score-poor">Not Found</span>
        </div>
        <p className="section-feedback">
          {sectionName} section was not identified in the essay.
        </p>
      </div>
    )
  }

  return (
    <div className="essay-section-analysis">
      <div className="section-header">
        <h3>{sectionName}</h3>
        <span className={`score-badge ${getScoreClass(section.overallScore)}`}>
          {section.overallScore.replace('_', ' ')}
        </span>
      </div>
      
      <div className="section-stats">
        <span className="word-count">{section.wordCount} words</span>
      </div>
      
      <div className="section-feedback">
        <h4>Overall Assessment:</h4>
        <p>{section.overallFeedback}</p>
      </div>

      <div className="component-analysis">
        <h4>Component Analysis:</h4>
        {expectedComponents.map(componentKey => {
          const component = section.components[componentKey]
          const componentName = componentKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          
          return (
            <div key={componentKey} className="component-item">
              <div className="component-header">
                <span className="component-name">{componentName}</span>
                <span className={`component-score ${getScoreClass(component?.score || 'poor')}`}>
                  {component?.score ? component.score.replace('_', ' ') : 'Not Found'}
                </span>
              </div>
              
              {component?.text && (
                <div className="component-text">
                  <strong>Identified:</strong> "{component.text}"
                </div>
              )}
              
              <div className="component-feedback">
                {component?.feedback || `${componentName} was not clearly identified in this section.`}
              </div>
              
              {improvementTips[componentKey] && (
                <div className="component-tips">
                  <strong>Tips:</strong>
                  <ul>
                    {improvementTips[componentKey].map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}



export default function ReportPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [essayText, setEssayText] = useState<string>('')
  const [essayPrompt, setEssayPrompt] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  useEffect(() => {
    loadAnalysisFromStorage()
  }, [])

  const loadAnalysisFromStorage = () => {
    try {
      const storedAnalysis = sessionStorage.getItem('lastAnalysis')
      if (storedAnalysis) {
        const parsedData = JSON.parse(storedAnalysis)
        setAnalysisData(parsedData.analysis)
        setEssayText(parsedData.essay)
        setEssayPrompt(parsedData.prompt || 'Question not available')
        setLoading(false)
      } else {
        setError('No analysis data found. Please analyze an essay first.')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to load analysis data')
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!analysisData || !essayText || isPdfGenerating) return
    
    setIsPdfGenerating(true)
    
    try {
      // Create a comprehensive PDF content using the same format as text report
      const pdfContent = generateDetailedReportContent()
      
      // Create a temporary window with the content formatted for PDF
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        throw new Error('Could not open print window')
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>IELTS Writing Analysis Report</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              line-height: 1.4;
              color: #1e293b;
              background-color: #f8fafc;
              max-width: 800px;
              margin: 0 auto;
              padding: 15px;
              font-size: 13px;
            }
            h1 { 
              color: #0f172a; 
              text-align: center; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 0.75rem; 
              margin: 0 0 1.5rem 0;
              font-size: 1.8rem;
              font-weight: 700;
            }
            h2 { 
              color: #0f172a; 
              margin: 1.5rem 0 0.75rem 0; 
              font-size: 1.25rem;
              font-weight: 700;
              page-break-after: avoid;
            }
            h3 { 
              color: #1e293b; 
              margin: 0.75rem 0 0.25rem 0; 
              font-size: 1rem;
              font-weight: 700;
            }
            h4 { 
              color: #475569; 
              margin: 0.5rem 0 0.25rem 0; 
              font-size: 0.9rem;
              font-weight: 600;
            }
            p { 
              margin: 0.25rem 0;
              color: #475569;
              line-height: 1.5;
            }
            
            /* Overall Assessment Section */
            .score-section { 
              background: white; 
              padding: 1rem; 
              border-radius: 12px; 
              margin: 0.75rem 0; 
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
              border: 1px solid #e2e8f0;
              page-break-inside: avoid;
            }
            .overall-score { 
              font-size: 3rem; 
              font-weight: 700; 
              color: #16a34a; 
              text-align: center; 
              margin: 0.5rem 0;
              line-height: 1;
            }
            
            /* Band Scores Grid */
            .band-scores { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 0.75rem; 
              margin: 0.75rem 0; 
            }
            .band-score { 
              background: white; 
              padding: 1rem; 
              border-radius: 12px; 
              border: 1px solid #e2e8f0; 
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
              page-break-inside: avoid;
            }
            .band-score h3 { 
              margin: 0 0 0.5rem 0; 
              font-size: 0.9rem;
              color: #1e293b;
              font-weight: 700;
            }
            .band-score .score-display { 
              font-size: 1.5rem; 
              font-weight: 700; 
              margin: 0.5rem 0;
              padding: 0.5rem;
              border-radius: 8px;
              text-align: center;
            }
            .score-high { 
              background-color: #dcfce7; 
              color: #166534; 
              border: 1px solid #16a34a;
            }
            .score-medium { 
              background-color: #fef3c7; 
              color: #92400e; 
              border: 1px solid #d97706;
            }
            .score-low { 
              background-color: #fee2e2; 
              color: #991b1b; 
              border: 1px solid #dc2626;
            }
            .band-score p { 
              font-size: 0.85rem; 
              margin: 0.5rem 0 0 0;
              color: #475569;
            }
            
            /* Essay Content */
            .essay-content { 
              background: white; 
              padding: 1.25rem; 
              border-radius: 12px; 
              margin: 0.75rem 0; 
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            }
            
            /* Question Box */
            .question-box { 
              background: linear-gradient(135deg, #fef3c7, #fed7aa); 
              padding: 1.25rem; 
              border-radius: 12px; 
              border: 2px solid #f59e0b; 
              margin: 0.75rem 0; 
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .question-box h3 { 
              color: #92400e; 
              font-size: 1rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0 0 0.5rem 0;
            }
            .question-box p { 
              color: #1e293b;
              font-weight: 500;
              font-size: 1rem;
              line-height: 1.6;
            }
            
            /* Structure Analysis */
            .structure-score { 
              padding: 0.5rem;
              border-radius: 6px;
              text-align: center;
              font-weight: 600;
              font-size: 0.85rem;
              margin: 0.25rem 0;
            }
            .structure-good { 
              background-color: #dcfce7; 
              color: #166534; 
            }
            .structure-needs-work { 
              background-color: #fef3c7; 
              color: #92400e; 
            }
            .structure-poor { 
              background-color: #fee2e2; 
              color: #991b1b; 
            }
            
            /* Blockquotes */
            blockquote { 
              background: #f1f5f9; 
              padding: 0.75rem; 
              border-left: 4px solid #64748b; 
              margin: 0.5rem 0; 
              font-style: italic; 
              font-size: 0.9rem;
              border-radius: 0 6px 6px 0;
              color: #475569;
            }
            
            /* Lists */
            ul { 
              margin: 0.5rem 0; 
              padding-left: 1.5rem; 
            }
            li { 
              margin: 0.25rem 0; 
              font-size: 0.85rem;
              color: #475569;
            }
            
            /* Warning Notice */
            .warning-notice {
              background: linear-gradient(135deg, #fef3c7, #fed7aa);
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 1rem;
              margin: 1rem 0;
              display: flex;
              align-items: center;
              gap: 0.75rem;
            }
            .warning-notice-icon {
              font-size: 1.25rem;
            }
            .warning-notice-text {
              color: #92400e;
              font-size: 0.9rem;
              font-weight: 500;
            }
            
            hr { 
              margin: 1.5rem 0; 
              border: none; 
              border-top: 1px solid #e2e8f0; 
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 10px; 
                font-size: 11px;
                background-color: white;
              }
              .no-print { display: none; }
              h1 { font-size: 1.5rem; margin-bottom: 1rem; }
              h2 { font-size: 1.1rem; }
              .overall-score { font-size: 2.5rem; }
              .band-score .score-display { font-size: 1.2rem; }
              .score-section, .band-score, .essay-content, .question-box { 
                box-shadow: none; 
                border: 1px solid #e2e8f0;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print/Save as PDF</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
          ${pdfContent}
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF generation failed. Please use your browser\'s print function to save as PDF.')
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const downloadTxtReport = () => {
    if (!analysisData || !essayText) return

    const reportContent = generateReportContent()
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `IELTS_Writing_Report_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateDetailedReportContent = () => {
    const date = new Date(analysisData?.timestamp || Date.now()).toLocaleDateString()
    const overallBand = analysisData?.overallBand || 0
    const wordCount = analysisData?.wordCount || 0
    
    const getScoreClass = (score: number) => {
      if (score >= 7) return 'score-high'
      if (score >= 5) return 'score-medium'
      return 'score-low'
    }
    
    const getStructureScoreClass = (score: string) => {
      switch (score) {
        case 'good': return 'structure-good'
        case 'needs_work': return 'structure-needs-work'
        case 'poor': return 'structure-poor'
        default: return 'structure-needs-work'
      }
    }
    
    return `
      <h1>IELTS Writing Analysis Report</h1>
      <p style="text-align: center; color: #64748b; margin-bottom: 1rem; font-size: 0.9rem;">Generated on ${date}</p>
      
      <div class="score-section">
        <h2>Overall Assessment</h2>
        <div class="overall-score">Band ${overallBand}</div>
        <p><strong>Confidence:</strong> ${Math.round((analysisData?.metadata?.confidence || 0.5) * 100)}% | <strong>Words:</strong> ${wordCount}</p>
        <p><strong>Feedback:</strong> ${analysisData?.overallFeedback || 'No feedback available'}</p>
      </div>

      <h2>IELTS Band Scores</h2>
      <div class="band-scores">
        <div class="band-score">
          <h3>📝 Task Response</h3>
          <div class="score-display ${getScoreClass(analysisData?.bandScores?.taskResponse?.score || 0)}">Band ${analysisData?.bandScores?.taskResponse?.score || 0}</div>
          <p>${analysisData?.bandScores?.taskResponse?.justification || 'Not available'}</p>
        </div>
        <div class="band-score">
          <h3>🔗 Coherence & Cohesion</h3>
          <div class="score-display ${getScoreClass(analysisData?.bandScores?.coherenceCohesion?.score || 0)}">Band ${analysisData?.bandScores?.coherenceCohesion?.score || 0}</div>
          <p>${analysisData?.bandScores?.coherenceCohesion?.justification || 'Not available'}</p>
        </div>
        <div class="band-score">
          <h3>📚 Lexical Resource</h3>
          <div class="score-display ${getScoreClass(analysisData?.bandScores?.lexicalResource?.score || 0)}">Band ${analysisData?.bandScores?.lexicalResource?.score || 0}</div>
          <p>${analysisData?.bandScores?.lexicalResource?.justification || 'Not available'}</p>
        </div>
        <div class="band-score">
          <h3>✏️ Grammar & Accuracy</h3>
          <div class="score-display ${getScoreClass(analysisData?.bandScores?.grammarAccuracy?.score || 0)}">Band ${analysisData?.bandScores?.grammarAccuracy?.score || 0}</div>
          <p>${analysisData?.bandScores?.grammarAccuracy?.justification || 'Not available'}</p>
        </div>
      </div>

      <h2>Essay Structure Analysis</h2>
      <div class="band-scores">
        <div class="band-score">
          <h3>🎯 Hook Sentence</h3>
          <div class="structure-score ${getStructureScoreClass(analysisData?.structuralAnalysis?.hook?.score || 'needs_work')}">${analysisData?.structuralAnalysis?.hook?.score?.toUpperCase().replace('_', ' ') || 'NEEDS WORK'}</div>
          ${analysisData?.structuralAnalysis?.hook?.text ? `<blockquote>"${analysisData.structuralAnalysis.hook.text}"</blockquote>` : ''}
          <p>${analysisData?.structuralAnalysis?.hook?.feedback || 'No feedback available'}</p>
        </div>

        <div class="band-score">
          <h3>📝 Thesis Statement</h3>
          <div class="structure-score ${getStructureScoreClass(analysisData?.structuralAnalysis?.thesis?.score || 'needs_work')}">${analysisData?.structuralAnalysis?.thesis?.score?.toUpperCase().replace('_', ' ') || 'NEEDS WORK'}</div>
          ${analysisData?.structuralAnalysis?.thesis?.text ? `<blockquote>"${analysisData.structuralAnalysis.thesis.text}"</blockquote>` : ''}
          <p>${analysisData?.structuralAnalysis?.thesis?.feedback || 'No feedback available'}</p>
        </div>
      </div>

      <div class="band-score">
        <h4>💡 Key Improvement Tips</h4>
        <p><strong>Hook:</strong> Start with statistics/questions, avoid generic statements, relate to topic, keep concise.</p>
        <p><strong>Thesis:</strong> State position clearly, include 2-3 main points, make specific and arguable.</p>
      </div>

      <h2>Your Essay</h2>
      <div class="question-box">
        <h3>Essay Question</h3>
        <p>${essayPrompt}</p>
      </div>
      
      <div class="essay-content">
        <h3>Your Response (${wordCount} words)</h3>
        ${essayText.split('\n').map(paragraph => `<p>${paragraph.trim() || '&nbsp;'}</p>`).join('')}
      </div>

      <hr style="margin: 2rem 0;">
      <p style="text-align: center; color: #64748b; font-size: 0.875rem;">
        Generated with IELTS Writing Analyzer • Report Date: ${date}
      </p>
    `
  }

  const generateReportContent = () => {
    const date = new Date(analysisData?.timestamp || Date.now()).toLocaleDateString()
    const overallBand = analysisData?.overallBand || 0
    const wordCount = analysisData?.wordCount || 0
    
    return `
IELTS WRITING TASK 2 - ANALYSIS REPORT
Generated on: ${date}

===========================================
OVERALL ASSESSMENT
===========================================
Overall Band Score: ${overallBand}
Analysis Confidence: ${Math.round((analysisData?.metadata?.confidence || 0.5) * 100)}%

Overall Feedback:
${analysisData?.overallFeedback || 'No feedback available'}

===========================================
IELTS BAND SCORES
===========================================

📝 TASK RESPONSE: Band ${analysisData?.bandScores?.taskResponse?.score || 0}
${analysisData?.bandScores?.taskResponse?.justification || 'Not available'}

🔗 COHERENCE & COHESION: Band ${analysisData?.bandScores?.coherenceCohesion?.score || 0}
${analysisData?.bandScores?.coherenceCohesion?.justification || 'Not available'}

📚 LEXICAL RESOURCE: Band ${analysisData?.bandScores?.lexicalResource?.score || 0}
${analysisData?.bandScores?.lexicalResource?.justification || 'Not available'}

✏️ GRAMMAR & ACCURACY: Band ${analysisData?.bandScores?.grammarAccuracy?.score || 0}
${analysisData?.bandScores?.grammarAccuracy?.justification || 'Not available'}

===========================================
STRUCTURAL ANALYSIS
===========================================

HOOK SENTENCE: ${analysisData?.structuralAnalysis?.hook?.score?.toUpperCase().replace('_', ' ') || 'NEEDS WORK'}
Identified Text: "${analysisData?.structuralAnalysis?.hook?.text || 'Not identified'}"
Assessment: ${analysisData?.structuralAnalysis?.hook?.feedback || 'No feedback available'}

How to Improve:
• Start with a surprising statistic or thought-provoking question
• Avoid generic statements like 'In today's world...'
• Make sure your hook directly relates to the essay topic
• Keep it concise but engaging

THESIS STATEMENT: ${analysisData?.structuralAnalysis?.thesis?.score?.toUpperCase().replace('_', ' ') || 'NEEDS WORK'}
Identified Text: "${analysisData?.structuralAnalysis?.thesis?.text || 'Not identified'}"
Assessment: ${analysisData?.structuralAnalysis?.thesis?.feedback || 'No feedback available'}

How to Improve:
• Clearly state your position on the topic
• Include 2-3 main points you'll discuss
• Make it specific and arguable
• Place it at the end of your introduction paragraph

CONCLUSION: ${analysisData?.structuralAnalysis?.conclusion?.overallScore?.toUpperCase().replace('_', ' ') || 'NEEDS WORK'}
Assessment: ${analysisData?.structuralAnalysis?.conclusion?.overallFeedback || 'No feedback available'}

How to Improve:
• Restate your thesis in different words
• Summarize your main arguments briefly
• End with a recommendation or future implication
• Don't introduce new ideas in the conclusion

===========================================
YOUR ESSAY
===========================================

${essayText}

===========================================
END OF REPORT
===========================================

Generated with IELTS Writing Analyzer
Report Date: ${date}
    `.trim()
  }

  const getScoreClass = (score: string) => {
    switch (score) {
      case 'good': return 'score-good'
      case 'needs_work': return 'score-needs-work'
      case 'poor': return 'score-poor'
      default: return 'score-needs-work'
    }
  }

  const improvementTips = useMemo(() => ({
    // Introduction Section
    hook: [
      "Start with a surprising statistic or thought-provoking question",
      "Avoid generic statements like 'In today's world...'",
      "Make sure your hook directly relates to the essay topic",
      "Keep it concise but engaging"
    ],
    thesis: [
      "Clearly state your position on the topic",
      "Include 2-3 main points you'll discuss",
      "Make it specific and arguable",
      "Place it at the end of your introduction paragraph"
    ],
    // Body Section
    topicSentence: [
      "Start each paragraph with a clear topic sentence",
      "State the main idea of the paragraph clearly",
      "Connect it to your thesis statement",
      "Use transitional words to link paragraphs"
    ],
    support: [
      "Provide 2-3 supporting points for each main idea",
      "Use logical reasoning to develop your argument",
      "Include relevant facts, statistics, or expert opinions",
      "Ensure all support directly relates to your topic sentence"
    ],
    example: [
      "Give specific, concrete examples to illustrate your points",
      "Use real-world examples or case studies",
      "Personal examples can be effective if relevant",
      "Explain how your example supports your argument"
    ],
    linkToThesis: [
      "Explicitly connect paragraph content back to your thesis",
      "Use phrases like 'This demonstrates that...' or 'Therefore...'",
      "Show how each argument supports your overall position",
      "Maintain clear logical flow throughout the essay"
    ],
    // Conclusion Section
    summary: [
      "Restate your thesis in different words",
      "Briefly summarize your main arguments",
      "Don't introduce new ideas or information",
      "Keep it concise but comprehensive"
    ],
    recommendation: [
      "End with a recommendation or call to action",
      "Suggest future implications or consequences",
      "Provide a solution to the problem discussed",
      "Leave the reader with something to think about"
    ]
  }), [])

  if (loading) {
    return (
      <div className="report-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading your analysis report...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="report-page">
        <div className="error-container">
          <h2>Unable to Load Report</h2>
          <p>{error || 'No analysis data found'}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-gray-100 bg-slate-50 dark:bg-gray-900 min-h-screen">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <ReportHeader 
        timestamp={analysisData.timestamp} 
        onDownloadTxt={downloadTxtReport}
        onDownloadPdf={downloadPDF}
        isPdfGenerating={isPdfGenerating}
      />
      <div id="report-content" className="space-y-8">


        <OverallAssessment
          overallBand={analysisData.overallBand || 0}
          overallFeedback={analysisData.overallFeedback || 'No feedback available'}
          wordCount={analysisData.wordCount || 0}
          confidence={analysisData.metadata?.confidence || 0.5}
        />

        <CollapsibleSection title="IELTS Band Scores">
          <BandScores bandScores={analysisData.bandScores} />
        </CollapsibleSection>

        <CollapsibleSection title="Essay Structure Analysis" comingSoon={true}>
          <div className="essay-sections-grid">
            {/* Check if we have new format, otherwise convert from legacy */}
            {analysisData.structuralAnalysis?.introduction || analysisData.structuralAnalysis?.bodyParagraphs || analysisData.structuralAnalysis?.conclusion ? (
              <>
                <EssaySectionAnalysis
                  section={analysisData.structuralAnalysis?.introduction || null}
                  sectionName="Introduction"
                  expectedComponents={['hook', 'thesis']}
                  improvementTips={improvementTips}
                />
                
                {analysisData.structuralAnalysis?.bodyParagraphs?.map((bodyParagraph, index) => (
                  <EssaySectionAnalysis
                    key={`body-${index}`}
                    section={bodyParagraph}
                    sectionName={`Body Paragraph ${index + 1}`}
                    expectedComponents={['topicSentence', 'support', 'example', 'linkToThesis']}
                    improvementTips={improvementTips}
                  />
                )) || (
                  <EssaySectionAnalysis
                    section={null}
                    sectionName="Body Paragraphs"
                    expectedComponents={['topicSentence', 'support', 'example', 'linkToThesis']}
                    improvementTips={improvementTips}
                  />
                )}
                
                <EssaySectionAnalysis
                  section={analysisData.structuralAnalysis?.conclusion || null}
                  sectionName="Conclusion"
                  expectedComponents={['summary', 'recommendation']}
                  improvementTips={improvementTips}
                />
              </>
            ) : (
              /* Legacy format fallback */
              <EssayStructureAnalysis structuralAnalysis={analysisData.structuralAnalysis} />
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Your Essay">
          <EssayDisplay 
            prompt={essayPrompt} 
            essayText={essayText} 
            wordCount={analysisData.wordCount || 0}
          />
        </CollapsibleSection>

      </div>
    </main>
  )
}
