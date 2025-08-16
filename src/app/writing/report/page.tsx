'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReportHeader } from './components/ReportHeader'
import { OverallAssessment } from './components/OverallAssessment'
import { CollapsibleSection } from './components/CollapsibleSection'
import { BandScores } from './components/BandScores'
import { EssayStructureAnalysis } from './components/EssayStructureAnalysis'
import { EssayDisplay } from './components/EssayDisplay'
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
      // Try using window.print() as a fallback for now
      alert('PDF generation is being prepared. For now, please use the "Print Report" button and save as PDF from your browser\'s print dialog.')
      window.print()
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF generation failed. Please use the "Print Report" button and save as PDF from your browser\'s print dialog.')
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
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-800 bg-slate-50 min-h-screen">
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

        <CollapsibleSection title="Essay Structure Analysis">
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
      
      <div className="mt-8 flex flex-wrap gap-4 justify-center print:hidden">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={() => window.history.back()}
        >
          ← Back to Writing
        </button>
        <button 
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={() => window.print()}
        >
          🖨️ Print Report
        </button>
      </div>
    </main>
  )
}
