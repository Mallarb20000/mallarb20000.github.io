'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
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

const BandScoreCard: React.FC<{
  title: string
  score: number
  justification: string
  icon: React.ReactNode
}> = ({ title, score, justification, icon }) => {
  const getBandClass = (score: number) => {
    if (score >= 7) return 'band-high'
    if (score >= 5) return 'band-medium'
    return 'band-low'
  }

  return (
    <div className={`band-score-card ${getBandClass(score)}`}>
      <div className="score-header">
        <div className="score-icon">{icon}</div>
        <div className="score-info">
          <h3>{title}</h3>
          <div className="score-value">Band {score}</div>
        </div>
      </div>
      <p className="score-justification">{justification}</p>
    </div>
  )
}

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


const OverallSummary: React.FC<{
  overallBand: number
  overallFeedback: string
  wordCount: number
  confidence: number
}> = ({ overallBand, overallFeedback, wordCount, confidence }) => {
  const getBandDescription = (band: number) => {
    if (band >= 8) return "Excellent"
    if (band >= 7) return "Good"
    if (band >= 6) return "Competent"
    if (band >= 5) return "Modest"
    return "Limited"
  }

  return (
    <div className="overall-summary">
      <div className="summary-header">
        <h2>Overall Assessment</h2>
        <div className="overall-band">
          <span className="band-label">Overall Band Score</span>
          <span className="band-score">{overallBand}</span>
          <span className="band-description">{getBandDescription(overallBand)}</span>
        </div>
      </div>
      
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Word Count</span>
          <span className="stat-value">{wordCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Analysis Confidence</span>
          <span className="stat-value">{Math.round(confidence * 100)}%</span>
        </div>
      </div>
      
      <div className="summary-feedback">
        <h3>Overall Feedback</h3>
        <p>{overallFeedback}</p>
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
    <div className="report-page">
        <div className="top-notice">
          <div className="notice-content">
            <span className="notice-icon">⚠️</span>
            <span className="notice-text">
              <strong>Important:</strong> Please download this report before refreshing or leaving the page.
            </span>
          </div>
          <div className="top-download-buttons">
            <button 
              className="btn btn-download-pdf"
              onClick={downloadPDF}
              disabled={isPdfGenerating}
            >
              {isPdfGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  📄 Download PDF
                </>
              )}
            </button>
            <button 
              className="btn btn-download-txt"
              onClick={downloadTxtReport}
            >
              📝 Download Text
            </button>
          </div>
        </div>

        <div id="report-content" className="report-content">
          <div className="report-header">
            <h1>IELTS Writing Analysis Report</h1>
            <p className="report-date">
              Generated on {new Date(analysisData.timestamp).toLocaleDateString()}
            </p>
          </div>


        <OverallSummary
          overallBand={analysisData.overallBand || 0}
          overallFeedback={analysisData.overallFeedback || 'No feedback available'}
          wordCount={analysisData.wordCount || 0}
          confidence={analysisData.metadata?.confidence || 0.5}
        />

        <div className="band-scores-section">
          <h2>IELTS Band Scores</h2>
          <div className="band-scores-grid">
            <BandScoreCard
              title="Task Response"
              score={analysisData.bandScores?.taskResponse?.score || 0}
              justification={analysisData.bandScores?.taskResponse?.justification || 'Not available'}
              icon={<span>📝</span>}
            />
            <BandScoreCard
              title="Coherence & Cohesion"
              score={analysisData.bandScores?.coherenceCohesion?.score || 0}
              justification={analysisData.bandScores?.coherenceCohesion?.justification || 'Not available'}
              icon={<span>🔗</span>}
            />
            <BandScoreCard
              title="Lexical Resource"
              score={analysisData.bandScores?.lexicalResource?.score || 0}
              justification={analysisData.bandScores?.lexicalResource?.justification || 'Not available'}
              icon={<span>📚</span>}
            />
            <BandScoreCard
              title="Grammar & Accuracy"
              score={analysisData.bandScores?.grammarAccuracy?.score || 0}
              justification={analysisData.bandScores?.grammarAccuracy?.justification || 'Not available'}
              icon={<span>✏️</span>}
            />
          </div>
        </div>

        <div className="structural-analysis-section">
          <h2>Essay Structure Analysis</h2>
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
              <div className="legacy-structural-analysis">
                <div className="structural-feedback-grid">
                  <div className="structural-feedback">
                    <div className="feedback-header">
                      <h3>Hook Sentence</h3>
                      <span className={`score-badge ${getScoreClass(analysisData.structuralAnalysis?.hook?.score || 'needs_work')}`}>
                        {(analysisData.structuralAnalysis?.hook?.score || 'needs_work').replace('_', ' ')}
                      </span>
                    </div>
                    
                    {analysisData.structuralAnalysis?.hook?.text && (
                      <div className="identified-text">
                        <h4>Identified Text:</h4>
                        <blockquote>"{analysisData.structuralAnalysis.hook.text}"</blockquote>
                      </div>
                    )}
                    
                    <div className="feedback-content">
                      <h4>Assessment:</h4>
                      <p>{analysisData.structuralAnalysis?.hook?.feedback || 'No feedback available'}</p>
                    </div>
                    
                    <div className="improvement-tips">
                      <h4>How to Improve:</h4>
                      <ul>
                        {improvementTips.hook.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="structural-feedback">
                    <div className="feedback-header">
                      <h3>Thesis Statement</h3>
                      <span className={`score-badge ${getScoreClass(analysisData.structuralAnalysis?.thesis?.score || 'needs_work')}`}>
                        {(analysisData.structuralAnalysis?.thesis?.score || 'needs_work').replace('_', ' ')}
                      </span>
                    </div>
                    
                    {analysisData.structuralAnalysis?.thesis?.text && (
                      <div className="identified-text">
                        <h4>Identified Text:</h4>
                        <blockquote>"{analysisData.structuralAnalysis.thesis.text}"</blockquote>
                      </div>
                    )}
                    
                    <div className="feedback-content">
                      <h4>Assessment:</h4>
                      <p>{analysisData.structuralAnalysis?.thesis?.feedback || 'No feedback available'}</p>
                    </div>
                    
                    <div className="improvement-tips">
                      <h4>How to Improve:</h4>
                      <ul>
                        {improvementTips.thesis.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {analysisData.structuralAnalysis?.topicSentences && analysisData.structuralAnalysis.topicSentences.length > 0 && (
                    <div className="structural-feedback">
                      <div className="feedback-header">
                        <h3>Topic Sentences</h3>
                        <span className="score-badge score-needs-work">Identified</span>
                      </div>
                      
                      <div className="topic-sentences-list">
                        {analysisData.structuralAnalysis.topicSentences.map((ts, index) => (
                          <div key={index} className="topic-sentence-item">
                            <strong>Paragraph {ts.paragraph}:</strong> "{ts.text}"
                            <p className="ts-feedback">{ts.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="essay-display-section">
          <h2>Your Essay</h2>
          <div className="essay-text-display">
            <div className="essay-question-inline">
              <p className="essay-paragraph"><strong>Question:</strong> {essayPrompt}</p>
            </div>
            <p><strong>Word Count:</strong> {analysisData.wordCount || 0} words</p>
            <div className="essay-content">
              {essayText.split('\n').map((paragraph, index) => (
                <p key={index} className="essay-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            ← Back to Writing
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
          <button 
            className="btn btn-download-pdf"
            onClick={downloadPDF}
            disabled={isPdfGenerating}
          >
            {isPdfGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              '📄 Download PDF'
            )}
          </button>
          <button 
            className="btn btn-download-txt"
            onClick={downloadTxtReport}
          >
            📝 Download Text
          </button>
        </div>
      </div>
    </div>
  )
}
