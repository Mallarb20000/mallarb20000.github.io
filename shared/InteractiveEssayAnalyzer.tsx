'use client'

import React, { useState, useEffect, useMemo } from 'react'
import './InteractiveEssayAnalyzer.css'

// Types for comprehensive IELTS Writing Task 2 structure
interface SentenceAnalysis {
  sentenceIndex: number
  text: string
  structuralElement: StructuralElementType
  quality: 'excellent' | 'good' | 'needs_work' | 'poor' | 'missing'
  feedback: string
  tips: string[]
  startPosition: number
  endPosition: number
}

// IELTS Writing Task 2 essay types
type EssayType = 'opinion' | 'discussion' | 'advantage' | 'problemSolution' | 'directQuestion' | 'unknown'

interface EssayTypeAnalysis {
  type: EssayType
  confidence: number
  feedback: string
  structuralRequirements: string[]
  commonMistakes: string[]
}

type StructuralElementType = 
  | 'hook' | 'background' | 'thesis' | 'outline'                    // Introduction
  | 'topic_sentence_1' | 'explanation_1' | 'example_1' | 'analysis_1' | 'linking_1'  // Body 1
  | 'topic_sentence_2' | 'explanation_2' | 'example_2' | 'analysis_2' | 'linking_2'  // Body 2
  | 'restatement' | 'summary' | 'final_thought'                    // Conclusion
  | 'transition' | 'supporting' | 'other'                          // General

interface ParagraphAnalysis {
  paragraphIndex: number
  type: 'introduction' | 'body1' | 'body2' | 'conclusion' | 'other'
  sentences: SentenceAnalysis[]
  overallFeedback: string
  missingElements: StructuralElementType[]
  wordCount: number
  quality: 'excellent' | 'good' | 'needs_work' | 'poor'
}

type StructuralTips = {
  [key in StructuralElementType]: {
    description: string
    goodExamples: string[]
    badExamples: string[]
    improvementTips: string[]
  }
}

interface Props {
  essay: string
  prompt?: string // Add prompt for essay type detection
  onSentenceClick?: (sentence: SentenceAnalysis) => void
  isAnalyzing?: boolean
  showOnlyStructureOverview?: boolean // Only show structure overview section
  onHighlight?: (elementType: string, paragraphIndex?: number) => void // For highlighting specific elements
  disableInlineFeedback?: boolean // Disable inline feedback when using external popover
}

// IELTS Writing Task 2 Essay Type Detection Patterns
const ESSAY_TYPE_PATTERNS = {
  opinion: [
    /to what extent.*agree/i,
    /do you agree.*disagree/i,
    /your opinion/i,
    /what is your opinion/i,
    /agree or disagree/i
  ],
  discussion: [
    /discuss both views/i,
    /some people.*others/i,
    /different opinions/i,
    /discuss both sides/i,
    /some people think.*others believe/i
  ],
  advantage: [
    /advantages.*disadvantages/i,
    /benefits.*drawbacks/i,
    /positive.*negative/i,
    /pros.*cons/i,
    /outweigh/i
  ],
  problemSolution: [
    /problems.*solutions/i,
    /causes.*solutions/i,
    /issues.*address/i,
    /what.*problems/i,
    /how.*solve/i,
    /measures.*taken/i
  ],
  directQuestion: [
    /why.*how/i,
    /what.*why/i,
    /\?\s*.*\?/i, // Multiple questions
    /two.*questions/i
  ]
}

// Essay Type-Specific Requirements and Tips
const ESSAY_TYPE_REQUIREMENTS = {
  opinion: {
    structuralRequirements: [
      'Clear position statement in thesis (agree/disagree)',
      'Consistent stance maintained throughout essay',
      '2-3 body paragraphs supporting your position',
      'Personal examples and reasoning acceptable',
      'Strong conclusion restating your position'
    ],
    commonMistakes: [
      'Presenting both sides equally (should favor your position)',
      'Changing position mid-essay',
      'Using weak language like "maybe" or "perhaps"',
      'Not clearly stating opinion in thesis'
    ],
    feedback: 'Take a clear position (agree/disagree) and support it with strong arguments throughout.'
  },
  discussion: {
    structuralRequirements: [
      'Present both viewpoints fairly and thoroughly',
      'Usually include your own opinion (check prompt)',
      'Balanced paragraph structure for both sides',
      'Clear transitions between opposing views',
      'Objective tone when presenting both sides'
    ],
    commonMistakes: [
      'Only discussing one side of the argument',
      'Being too biased towards one viewpoint',
      'Forgetting to give your own opinion when asked',
      'Weak transitions between different viewpoints'
    ],
    feedback: 'Present both sides fairly, then give your own well-reasoned opinion.'
  },
  advantage: {
    structuralRequirements: [
      'Must discuss BOTH advantages AND disadvantages',
      'Balanced treatment of both sides required',
      'Can conclude which side outweighs the other',
      'Clear categorization of benefits and drawbacks',
      'Specific examples for each point'
    ],
    commonMistakes: [
      'Only focusing on advantages OR disadvantages',
      'Being heavily biased without justification',
      'Vague or generic advantages/disadvantages',
      'Not providing specific examples or evidence'
    ],
    feedback: 'Analyze both benefits and drawbacks equally with specific examples.'
  },
  problemSolution: {
    structuralRequirements: [
      'Clearly identify specific problems or causes',
      'Propose realistic and practical solutions',
      'Link problems to solutions clearly',
      'Consider implementation feasibility',
      'Address multiple aspects of the issue'
    ],
    commonMistakes: [
      'Vague or unrealistic solutions',
      'Not linking solutions to specific problems',
      'Only identifying problems without solutions',
      'Proposing solutions that are too general'
    ],
    feedback: 'Identify specific problems clearly, then propose realistic, practical solutions.'
  },
  directQuestion: {
    structuralRequirements: [
      'Answer ALL questions asked in the prompt',
      'Dedicate paragraphs to each specific question',
      'Use question order for essay structure',
      'Provide direct, clear responses',
      'Equal development for each question'
    ],
    commonMistakes: [
      'Ignoring one of the questions completely',
      'Unequal development of answers',
      'Not structuring essay around the questions',
      'Providing indirect or vague answers'
    ],
    feedback: 'Answer every question directly with detailed explanations and examples.'
  },
  unknown: {
    structuralRequirements: [
      'Follow general IELTS Writing Task 2 structure',
      'Clear introduction with thesis statement',
      'Well-developed body paragraphs',
      'Strong conclusion with summary'
    ],
    commonMistakes: [
      'Not identifying essay type correctly',
      'Using generic structure inappropriately'
    ],
    feedback: 'Unable to determine essay type. Ensure you understand the prompt requirements.'
  }
}

// Comprehensive IELTS Writing Task 2 structural tips database
const STRUCTURAL_TIPS: StructuralTips = {
  // Introduction Elements
  hook: {
    description: "Opening sentence that captures reader's attention and introduces the topic",
    goodExamples: [
      "In today's rapidly evolving world, the question of university education has become increasingly complex.",
      "The debate over student freedom in higher education continues to divide educators and policymakers worldwide."
    ],
    badExamples: [
      "This essay will discuss university education.", // Too generic
      "Some people think this, others think that." // Lacks engagement
    ],
    improvementTips: [
      "Start with a relevant statistic, question, or thought-provoking statement",
      "Avoid announcing what your essay will do",
      "Connect to current events or universal human experiences",
      "Keep it concise but engaging (15-25 words)"
    ]
  },
  background: {
    description: "Provides context and background information about the topic",
    goodExamples: [
      "Universities traditionally offered students considerable freedom in choosing their courses, but recent economic pressures have led to calls for more practical, job-focused curricula.",
      "The rise of student debt and competitive job markets has intensified discussions about the purpose and direction of higher education."
    ],
    badExamples: [
      "Education is important.", // Too vague
      "Many students go to university every year." // Obvious, no context
    ],
    improvementTips: [
      "Provide specific context relevant to the question",
      "Explain why this topic is significant or timely",
      "Bridge between your hook and thesis",
      "Use 20-35 words for optimal length"
    ]
  },
  thesis: {
    description: "Clear statement of your position/opinion on the topic",
    goodExamples: [
      "While practical skills are undoubtedly important, I believe students should retain the freedom to pursue their passions, as this approach leads to greater innovation and personal fulfillment.",
      "Although both perspectives have merit, I argue that a balanced approach combining practical skills with individual choice produces the most well-rounded graduates."
    ],
    badExamples: [
      "I think both sides are right.", // Lacks clear position
      "This is a complex issue." // Avoids taking a stance
    ],
    improvementTips: [
      "Take a clear, defendable position",
      "Use confident language (I believe, I argue, I maintain)",
      "Preview your reasoning briefly",
      "Avoid sitting on the fence - choose a side"
    ]
  },
  outline: {
    description: "Brief preview of your main supporting arguments (optional but recommended)",
    goodExamples: [
      "This essay will examine the economic benefits of practical education before arguing for the importance of intellectual freedom in fostering creativity and critical thinking.",
      "I will first acknowledge the practical concerns raised by employers before demonstrating why diverse academic pursuits benefit both individuals and society."
    ],
    badExamples: [
      "I will discuss this topic.", // Too vague
      "There are many arguments on both sides." // Not specific
    ],
    improvementTips: [
      "Briefly mention your main arguments in order",
      "Use signposting language (first, then, finally)",
      "Keep it concise (one sentence)",
      "This element is optional - only include if it flows naturally"
    ]
  },

  // Body Paragraph 1 Elements
  topic_sentence_1: {
    description: "First main argument that clearly supports your thesis",
    goodExamples: [
      "Supporters of practical education argue that job-relevant skills provide students with immediate economic benefits upon graduation.",
      "The primary advantage of allowing students to choose freely is that it promotes genuine intellectual curiosity and deeper learning."
    ],
    badExamples: [
      "The first reason is important.", // Vague and weak
      "Some people think students should study practical subjects." // Restates obvious
    ],
    improvementTips: [
      "Clearly state your first main argument",
      "Connect directly to your thesis",
      "Use strong, specific language",
      "Avoid weak phrases like 'some people think'"
    ]
  },
  explanation_1: {
    description: "Develops and explains your first main argument in detail",
    goodExamples: [
      "When students focus on fields like engineering, medicine, or business, they acquire specific competencies that employers actively seek, leading to higher employment rates and starting salaries.",
      "Students who pursue subjects they genuinely enjoy tend to engage more deeply with the material, developing critical thinking skills that transfer across disciplines."
    ],
    badExamples: [
      "This is because it helps them get jobs.", // Too simple
      "It is good for students." // Lacks specific development
    ],
    improvementTips: [
      "Explain how/why your argument works",
      "Use specific, detailed language",
      "Show cause-and-effect relationships",
      "Develop the logic behind your claim"
    ]
  },
  example_1: {
    description: "Specific evidence, example, or illustration supporting your first argument",
    goodExamples: [
      "For instance, computer science graduates from Stanford University report average starting salaries of $120,000, significantly higher than liberal arts majors.",
      "Research by Harvard University found that students pursuing self-chosen majors showed 40% higher retention rates and achieved superior academic performance."
    ],
    badExamples: [
      "For example, many students find jobs.", // Too general
      "I know someone who studied engineering." // Personal anecdote without broader relevance
    ],
    improvementTips: [
      "Use specific, credible examples",
      "Include statistics, studies, or expert opinions when possible",
      "Avoid purely personal anecdotes",
      "Make sure examples directly support your argument"
    ]
  },
  analysis_1: {
    description: "Explains how your example supports your argument and connects to thesis",
    goodExamples: [
      "This data demonstrates that practical education provides tangible economic advantages, supporting the view that universities should guide students toward employable skills.",
      "These findings suggest that academic freedom not only benefits individual students but also produces graduates with the adaptable thinking skills that modern employers increasingly value."
    ],
    badExamples: [
      "This shows it is good.", // Weak analysis
      "Therefore, students should do this." // Lacks explanation of connection
    ],
    improvementTips: [
      "Explicitly explain how your example proves your point",
      "Connect back to your main thesis",
      "Use analytical language (demonstrates, suggests, indicates)",
      "Show broader implications of your evidence"
    ]
  },
  linking_1: {
    description: "Smoothly transitions to your next main argument",
    goodExamples: [
      "However, while economic considerations are important, they represent only one dimension of the university experience.",
      "Despite these practical advantages, focusing solely on job prospects may limit the broader benefits of higher education."
    ],
    badExamples: [
      "Now I will talk about the second point.", // Mechanical transition
      "Another thing is..." // Informal and weak
    ],
    improvementTips: [
      "Use sophisticated transition words (however, nevertheless, despite)",
      "Acknowledge the complexity of the issue",
      "Create smooth flow between paragraphs",
      "Avoid mechanical, obvious transitions"
    ]
  },

  // Body Paragraph 2 Elements (similar structure)
  topic_sentence_2: {
    description: "Second main argument supporting your thesis position",
    goodExamples: [
      "More importantly, unrestricted academic choice fosters the creativity and innovation essential for societal progress.",
      "Furthermore, practical education alone fails to develop the critical thinking skills necessary for long-term career success."
    ],
    badExamples: [
      "The second reason is also important.", // Weak and generic
      "Another point is that students need freedom." // Lacks sophistication
    ],
    improvementTips: [
      "Present your strongest argument second",
      "Use emphatic language (more importantly, crucially, fundamentally)",
      "Ensure this argument differs meaningfully from your first",
      "Connect clearly to your thesis"
    ]
  },
  explanation_2: {
    description: "Detailed development of your second main argument",
    goodExamples: [
      "History's greatest breakthroughs often emerged from interdisciplinary thinking, as individuals combined insights from seemingly unrelated fields to solve complex problems.",
      "The rapidly changing job market requires adaptable professionals who can think critically across disciplines, skills best developed through broad academic exploration."
    ],
    badExamples: [
      "This helps students learn better.", // Oversimplified
      "It is important for many reasons." // Vague, lacks development
    ],
    improvementTips: [
      "Develop this argument more thoroughly than the first",
      "Use sophisticated reasoning",
      "Consider long-term implications",
      "Show depth of understanding"
    ]
  },
  example_2: {
    description: "Different type of evidence supporting your second argument",
    goodExamples: [
      "Steve Jobs famously credited his calligraphy class with inspiring Apple's revolutionary approach to computer typography, demonstrating how 'impractical' subjects can drive innovation.",
      "LinkedIn's 2023 skills report identified creativity, critical thinking, and adaptability as the top three competencies desired by employers across all industries."
    ],
    badExamples: [
      "Many famous people studied different subjects.", // Too general
      "Some companies want creative workers." // Lacks specificity
    ],
    improvementTips: [
      "Use a different type of example than in paragraph 1",
      "Consider historical examples, case studies, or expert opinions",
      "Make the example memorable and specific",
      "Ensure clear relevance to your argument"
    ]
  },
  analysis_2: {
    description: "Explains how second example supports your position and thesis",
    goodExamples: [
      "Jobs' experience illustrates how diverse academic exposure creates unexpected connections that drive breakthrough innovations, suggesting that practical limitations may actually hinder economic progress.",
      "This trend indicates that employers increasingly recognize the limitations of narrowly trained graduates, validating the importance of academic breadth over immediate job skills."
    ],
    badExamples: [
      "This proves students need choice.", // Oversimplified conclusion
      "So universities should change." // Lacks analytical depth
    ],
    improvementTips: [
      "Make this analysis deeper than your first paragraph",
      "Consider counterarguments and address them",
      "Show sophisticated understanding of implications",
      "Strengthen your overall position"
    ]
  },
  linking_2: {
    description: "Transitions toward your conclusion",
    goodExamples: [
      "Given these considerations, the choice between practical and liberal education represents a false dichotomy that oversimplifies the complex purposes of higher learning.",
      "While both economic and intellectual factors merit consideration, the evidence strongly favors maintaining student autonomy in academic decisions."
    ],
    badExamples: [
      "In conclusion...", // Too abrupt
      "Finally, I will summarize." // Mechanical
    ],
    improvementTips: [
      "Signal movement toward conclusion subtly",
      "Begin synthesizing your arguments",
      "Avoid obvious conclusion markers",
      "Maintain sophisticated tone"
    ]
  },

  // Conclusion Elements
  restatement: {
    description: "Restates your thesis using different words",
    goodExamples: [
      "In summary, while practical considerations deserve attention, universities serve society best by preserving students' freedom to pursue diverse academic interests.",
      "Ultimately, the evidence supports maintaining academic choice over imposed practical restrictions in higher education."
    ],
    badExamples: [
      "As I said before, students should choose their subjects.", // Repetitive
      "This essay discussed university education." // Focuses on essay structure, not argument
    ],
    improvementTips: [
      "Paraphrase your thesis, don't repeat it exactly",
      "Use confident, conclusive language",
      "Reflect the development of your thinking",
      "Avoid phrases like 'as I said before'"
    ]
  },
  summary: {
    description: "Brief recap of your main supporting arguments",
    goodExamples: [
      "Academic freedom not only respects individual autonomy but also cultivates the innovative thinking and adaptability that modern economies require.",
      "The integration of personal passion with practical skills produces graduates who are both economically viable and intellectually capable."
    ],
    badExamples: [
      "I discussed two main points in this essay.", // Mechanical summary
      "There were many reasons supporting my opinion." // Vague
    ],
    improvementTips: [
      "Synthesize arguments rather than just listing them",
      "Show how arguments work together",
      "Use sophisticated language",
      "Emphasize the strength of your position"
    ]
  },
  final_thought: {
    description: "Broader implication, prediction, or call to action",
    goodExamples: [
      "As society faces increasingly complex challenges, universities that embrace intellectual diversity will prove most valuable in developing the creative problem-solvers of tomorrow.",
      "The institutions that resist the temptation to narrow their focus will ultimately produce graduates best equipped for an unpredictable future."
    ],
    badExamples: [
      "I hope universities will make good decisions.", // Weak and vague
      "This is an important topic for everyone." // States the obvious
    ],
    improvementTips: [
      "End with broader significance or future implications",
      "Use forward-looking language",
      "Connect to larger societal issues",
      "Leave reader with memorable final impression"
    ]
  },

  // General Elements
  transition: {
    description: "Smooth connections between ideas and paragraphs",
    goodExamples: [
      "However, despite these practical considerations...",
      "Building on this foundation, it becomes clear that..."
    ],
    badExamples: [
      "Next, I will discuss...", // Mechanical
      "Another point is..." // Weak
    ],
    improvementTips: [
      "Use sophisticated transitional phrases",
      "Show logical relationships between ideas",
      "Maintain flow throughout essay",
      "Vary transitional language"
    ]
  },
  supporting: {
    description: "Additional sentences that strengthen main arguments",
    goodExamples: [
      "This trend reflects broader changes in how employers value diverse skill sets.",
      "Such evidence challenges traditional assumptions about practical education."
    ],
    badExamples: [
      "This is also important.", // Vague
      "Students need to learn things." // Obvious
    ],
    improvementTips: [
      "Ensure each sentence adds value",
      "Use specific, sophisticated language",
      "Support main arguments clearly",
      "Avoid filler sentences"
    ]
  },
  other: {
    description: "General sentence that doesn't fit specific structural categories",
    goodExamples: [
      "Additional context or background information",
      "Qualifying statements or nuanced observations"
    ],
    badExamples: [
      "Generic or unclear statements",
      "Repetitive or unnecessary content"
    ],
    improvementTips: [
      "Ensure every sentence serves a purpose",
      "Consider if sentence could be more specific",
      "Evaluate if sentence strengthens your argument",
      "Revise vague or unclear statements"
    ]
  }
}

// Left-Side Popover Component
const LeftSidePopover: React.FC<{
  subComponent: {
    id: string
    name: string
    sentence: string
    assessment: string
    quality: string
    improve: string
  }
  targetElement: HTMLElement
  onClose: () => void
}> = ({ subComponent, targetElement, onClose }) => {
  const [position, setPosition] = useState<{ top: number; left: number; arrowOffset: number } | null>(null)

  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      const popoverWidth = 360
      const popoverMargin = 16

      setPosition({
        top: rect.top,
        left: rect.left - popoverWidth - popoverMargin,
        arrowOffset: rect.height / 2
      })
    }
  }, [targetElement])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!targetElement.contains(target)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [targetElement, onClose])

  if (!position) return null

  return (
    <div 
      className="feedback-popover left-side-popover" 
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        position: 'fixed',
        zIndex: 1000
      }}
    >
      <div className="popover-arrow popover-arrow-right" style={{ top: `${position.arrowOffset}px` }}></div>
      <button className="popover-close-btn" onClick={onClose} aria-label="Close feedback">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      <div className="feedback-sentence">
        "{subComponent.sentence}"
      </div>
      <div className="feedback-item">
        <strong>Assessment:</strong> <span>{subComponent.assessment}</span>
      </div>
      <div className="feedback-item">
        <strong>Quality:</strong> <span>{subComponent.quality}</span>
      </div>
      <div className="feedback-item">
        <strong>Improve:</strong> <span className="improve-text">{subComponent.improve}</span>
      </div>
    </div>
  )
}

export default function InteractiveEssayAnalyzer({ essay, prompt, onSentenceClick, isAnalyzing = false, showOnlyStructureOverview = false, onHighlight, disableInlineFeedback = false }: Props) {
  const [selectedSentence, setSelectedSentence] = useState<SentenceAnalysis | null>(null)
  const [paragraphAnalyses, setParagraphAnalyses] = useState<ParagraphAnalysis[]>([])
  const [hoveredSentence, setHoveredSentence] = useState<number | null>(null)
  const [essayTypeAnalysis, setEssayTypeAnalysis] = useState<EssayTypeAnalysis | null>(null)
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null)
  const [highlightedParagraph, setHighlightedParagraph] = useState<number | null>(null)
  const [expandedParagraph, setExpandedParagraph] = useState<number | null>(null)
  const [selectedStructuralElement, setSelectedStructuralElement] = useState<string | null>(null)
  const [popoverData, setPopoverData] = useState<{
    element: HTMLElement
    subComponent: {
      id: string
      name: string
      sentence: string
      assessment: string
      quality: string
      improve: string
    }
  } | null>(null)

  // Parse essay into sentences and analyze structure
  const analysisResults = useMemo(() => {
    if (!essay.trim()) return { sentences: [], paragraphs: [] }
    
    return analyzeEssayStructure(essay)
  }, [essay])

  // Analyze essay type when prompt or essay changes
  useEffect(() => {
    if (prompt || essay.trim()) {
      const typeAnalysis = detectEssayType(prompt || '', essay)
      setEssayTypeAnalysis(typeAnalysis)
    }
  }, [prompt, essay])

  // Handle sentence click
  const handleSentenceClick = (sentence: SentenceAnalysis) => {
    setSelectedSentence(sentence)
    onSentenceClick?.(sentence)
  }

  // Render interactive essay with clickable sentences
  const renderInteractiveEssay = () => {
    if (!essay.trim()) {
      return (
        <div className="interactive-placeholder">
          <p>Start writing your essay to see interactive structural analysis...</p>
        </div>
      )
    }

    return (
      <div className="interactive-essay-container">
        {analysisResults.paragraphs.map((paragraph, paragraphIndex) => (
          <div 
            key={paragraphIndex} 
            className={`interactive-paragraph ${paragraph.type} ${highlightedParagraph === paragraphIndex ? 'highlighted-paragraph' : ''}`}
          >
            <p className="paragraph-text">
              {paragraph.sentences.map((sentence, sentenceIndex) => (
                <span
                  key={`${paragraphIndex}-${sentenceIndex}`}
                  className={`interactive-sentence ${sentence.structuralElement} quality-${sentence.quality} ${
                    selectedSentence?.sentenceIndex === sentence.sentenceIndex ? 'selected' : ''
                  } ${
                    hoveredSentence === sentence.sentenceIndex ? 'hovered' : ''
                  } ${
                    highlightedElement === sentence.structuralElement ? 'highlighted-element' : ''
                  } ${
                    selectedStructuralElement === sentence.structuralElement ? 'selected-element' : ''
                  }`}
                  onClick={() => handleSentenceClick(sentence)}
                  onMouseEnter={() => setHoveredSentence(sentence.sentenceIndex)}
                  onMouseLeave={() => setHoveredSentence(null)}
                  title={`${sentence.structuralElement.replace(/_/g, ' ').toUpperCase()}: Click for detailed analysis`}
                >
                  {sentence.text}{sentenceIndex < paragraph.sentences.length - 1 ? '. ' : '.'}
                  <span className={`quality-indicator quality-${sentence.quality}`}>
                    {sentence.quality === 'excellent' ? '✨' : 
                     sentence.quality === 'good' ? '✅' : 
                     sentence.quality === 'needs_work' ? '⚠️' : 
                     sentence.quality === 'poor' ? '❌' : '❓'}
                  </span>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`interactive-essay-analyzer ${showOnlyStructureOverview ? 'structure-only' : ''}`}>
      {/* Interactive Essay Display - Only show when NOT in structure-only mode */}
      {!showOnlyStructureOverview && (
        <div className="interactive-essay-section">
          {isAnalyzing ? (
            <div className="analysis-loading">
              <div className="loading-spinner"></div>
              <p>Analyzing essay structure...</p>
            </div>
          ) : (
            renderInteractiveEssay()
          )}
        </div>
      )}

      {/* Hierarchical Structure Analysis */}
      <div className="structure-overview">
        <h3>Essay Structure Analysis</h3>
        
        {/* Essay Type Analysis - Compact */}
        {essayTypeAnalysis && (
          <div className="essay-type-analysis compact">
            <div className={`essay-type-card compact ${essayTypeAnalysis.type}`}>
              <div className="essay-type-header">
                <span className="essay-type-label">
                  {essayTypeAnalysis.type.charAt(0).toUpperCase() + essayTypeAnalysis.type.slice(1)}
                </span>
              </div>
              <p className="essay-type-feedback compact">{essayTypeAnalysis.feedback}</p>
            </div>
          </div>
        )}
        
        {/* Hierarchical Paragraph Breakdown */}
        <div className="hierarchical-structure">
          {analysisResults.paragraphs.map((paragraph, paragraphIndex) => (
            <div key={paragraphIndex} className="paragraph-section">
              
              {/* Paragraph Header - Clickable */}
              <button
                className={`paragraph-toggle ${paragraph.type} ${expandedParagraph === paragraphIndex ? 'expanded' : ''} ${highlightedParagraph === paragraphIndex ? 'highlighted' : ''}`}
                onClick={() => {
                  // Toggle paragraph expansion
                  setExpandedParagraph(expandedParagraph === paragraphIndex ? null : paragraphIndex)
                  // Highlight paragraph in text
                  setHighlightedParagraph(highlightedParagraph === paragraphIndex ? null : paragraphIndex)
                  setHighlightedElement(null)
                  setSelectedStructuralElement(null)
                  
                  // Scroll to paragraph if highlighting
                  if (highlightedParagraph !== paragraphIndex) {
                    setTimeout(() => {
                      const paragraphElement = document.querySelector(`.interactive-paragraph:nth-child(${paragraphIndex + 1})`)
                      if (paragraphElement) {
                        paragraphElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }, 100)
                  }
                }}
              >
                <div className="paragraph-info">
                  <div className="paragraph-title">
                    {paragraph.type === 'introduction' ? 'Introduction' : 
                     paragraph.type === 'body1' ? 'Body Paragraph 1' : 
                     paragraph.type === 'body2' ? 'Body Paragraph 2' : 
                     paragraph.type === 'conclusion' ? 'Conclusion' : 'Other'}
                  </div>
                  <div className="paragraph-meta">
                    {paragraph.wordCount} words • {paragraph.sentences.length} sentences
                  </div>
                </div>
                
                <div className="paragraph-quality">
                  <span className={`paragraph-quality-badge quality-${paragraph.quality}`}>
                    {paragraph.quality === 'excellent' ? 'Excellent' : 
                     paragraph.quality === 'good' ? 'Good' : 
                     paragraph.quality === 'needs_work' ? 'Needs Work' : 'Poor'}
                  </span>
                  <span className="expand-icon">
                    {expandedParagraph === paragraphIndex ? '−' : '+'}
                  </span>
                </div>
              </button>

              {/* Expanded Paragraph Content */}
              {expandedParagraph === paragraphIndex && (
                <div className="paragraph-elements">
                  
                  {/* Group sentences by structural element */}
                  {getUniqueStructuralElements(paragraph.sentences).map((elementType) => {
                    const elementSentences = paragraph.sentences.filter(s => s.structuralElement === elementType)
                    const elementQuality = getAverageQuality(elementSentences)
                    
                    return (
                      <button
                        key={elementType}
                        className={`element-toggle ${selectedStructuralElement === elementType ? 'selected' : ''}`}
                        onClick={(e) => {
                          // Highlight this element type in the text
                          setHighlightedElement(elementType)
                          setSelectedStructuralElement(selectedStructuralElement === elementType ? null : elementType)
                          
                          // Set selected sentence for inline feedback (but don't trigger modal)
                          if (elementSentences.length > 0) {
                            setSelectedSentence(elementSentences[0])
                            
                            // Show popover on the left side of the clicked element
                            setPopoverData({
                              element: e.currentTarget as HTMLElement,
                              subComponent: {
                                id: elementType,
                                name: formatElementName(elementType),
                                sentence: elementSentences[0].text,
                                assessment: elementSentences[0].quality === 'excellent' ? 'Excellent' : 
                                         elementSentences[0].quality === 'good' ? 'Good' : 
                                         elementSentences[0].quality === 'needs_work' ? 'Needs improvement' : 'Poor',
                                quality: elementSentences[0].feedback,
                                improve: elementSentences[0].tips.length > 0 ? elementSentences[0].tips[0] : 'Keep practicing this element.'
                              }
                            })
                            
                            // Scroll to the highlighted sentence
                            setTimeout(() => {
                              const sentenceElement = document.querySelector(`.interactive-sentence.${elementType}`)
                              if (sentenceElement) {
                                sentenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }
                            }, 100)
                          }
                        }}
                      >
                        <span className="element-title">
                          {formatElementName(elementType)}
                        </span>
                        <span className={`element-quality quality-${elementQuality}`}>
                          {elementQuality === 'excellent' ? 'Excellent' : 
                           elementQuality === 'good' ? 'Good' : 
                           elementQuality === 'needs_work' ? 'Needs Work' : 'Poor'}
                        </span>
                        {elementSentences.length > 1 && (
                          <span className="element-count">({elementSentences.length})</span>
                        )}
                      </button>
                    )
                  })}

                  {/* Inline Feedback for Selected Element */}
                  {!disableInlineFeedback && selectedStructuralElement && selectedSentence && selectedSentence.structuralElement === selectedStructuralElement && (
                    <div className="inline-feedback">
                      <div className="selected-element-info">
                        <h4>{formatElementName(selectedStructuralElement)}</h4>
                        <p className="selected-text">"{selectedSentence.text}"</p>
                      </div>
                      
                      <div className="simple-feedback-inline">
                        <div className="feedback-point-inline assessment">
                          <strong>Assessment:</strong> {selectedSentence.quality === 'excellent' ? 'Excellent' : 
                             selectedSentence.quality === 'good' ? 'Good' : 
                             selectedSentence.quality === 'needs_work' ? 'Needs improvement' : 'Poor'}
                        </div>
                        
                        <div className="feedback-point-inline quality">
                          <strong>Quality:</strong> {selectedSentence.feedback}
                        </div>
                        
                        <div className="feedback-point-inline improvement">
                          <strong>Improve:</strong> {selectedSentence.tips.length > 0 ? selectedSentence.tips[0] : 'Keep practicing this element.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Missing Elements */}
                  {paragraph.missingElements.length > 0 && (
                    <div className="missing-elements-compact">
                      <strong>Missing:</strong>
                      {paragraph.missingElements.map((element, idx) => (
                        <span key={idx} className="missing-element">
                          {formatElementName(element)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Left-Side Popover */}
      {popoverData && (
        <LeftSidePopover
          subComponent={popoverData.subComponent}
          targetElement={popoverData.element}
          onClose={() => setPopoverData(null)}
        />
      )}
    </div>
  )
}

// Enhanced essay structure analysis function
function analyzeEssayStructure(essay: string): { sentences: SentenceAnalysis[], paragraphs: ParagraphAnalysis[] } {
  // Split essay into paragraphs
  const paragraphs = essay.split('\n\n').filter(p => p.trim())
  
  // Split into sentences
  const allSentences: SentenceAnalysis[] = []
  const paragraphAnalyses: ParagraphAnalysis[] = []
  
  let currentPosition = 0
  
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim())
    const paragraphSentences: SentenceAnalysis[] = []
    
    sentences.forEach((sentence, sentenceIndex) => {
      const trimmed = sentence.trim()
      if (!trimmed) return
      
      const startPos = currentPosition
      const endPos = startPos + trimmed.length
      
      // Determine structural element based on position and content
      const structuralElement = determineStructuralElement(
        paragraphIndex, 
        sentenceIndex, 
        paragraphs.length, 
        sentences.length,
        trimmed
      )
      
      // Analyze quality (we'll pass essay type when available)
      const { quality, feedback, tips } = analyzeSentenceQuality(structuralElement, trimmed)
      
      const sentenceAnalysis: SentenceAnalysis = {
        sentenceIndex: allSentences.length,
        text: trimmed,
        structuralElement,
        quality,
        feedback,
        tips,
        startPosition: startPos,
        endPosition: endPos
      }
      
      paragraphSentences.push(sentenceAnalysis)
      allSentences.push(sentenceAnalysis)
      currentPosition = endPos + 2 // Account for punctuation and space
    })
    
    // Analyze paragraph structure
    const paragraphType = determineParagraphType(paragraphIndex, paragraphs.length)
    const missingElements = findMissingElements(paragraphType, paragraphSentences)
    const wordCount = paragraph.split(/\s+/).length
    const paragraphQuality = assessParagraphQuality(paragraphType, paragraphSentences, wordCount)
    
    paragraphAnalyses.push({
      paragraphIndex,
      type: paragraphType,
      sentences: paragraphSentences,
      overallFeedback: generateParagraphFeedback(paragraphType, paragraphSentences, wordCount),
      missingElements,
      wordCount,
      quality: paragraphQuality
    })
  })
  
  return { sentences: allSentences, paragraphs: paragraphAnalyses }
}

// Helper functions for structural analysis
function determineStructuralElement(
  paragraphIndex: number, 
  sentenceIndex: number, 
  totalParagraphs: number, 
  totalSentencesInParagraph: number,
  sentenceText: string
): StructuralElementType {
  
  // Introduction (first paragraph)
  if (paragraphIndex === 0) {
    if (sentenceIndex === 0) return 'hook'
    if (sentenceIndex === 1) return 'background'
    if (sentenceIndex === totalSentencesInParagraph - 1) return 'thesis'
    if (sentenceIndex === totalSentencesInParagraph - 2 && totalSentencesInParagraph > 3) return 'outline'
    return 'background'
  }
  
  // Conclusion (last paragraph)
  if (paragraphIndex === totalParagraphs - 1) {
    if (sentenceIndex === 0) return 'restatement'
    if (sentenceIndex === totalSentencesInParagraph - 1) return 'final_thought'
    return 'summary'
  }
  
  // Body paragraphs
  const bodyParagraphNumber = paragraphIndex // 1 for second paragraph, 2 for third, etc.
  
  if (bodyParagraphNumber === 1) {
    if (sentenceIndex === 0) return 'topic_sentence_1'
    if (sentenceIndex === 1) return 'explanation_1'
    if (sentenceIndex === 2) return 'example_1'
    if (sentenceIndex === totalSentencesInParagraph - 2) return 'analysis_1'
    if (sentenceIndex === totalSentencesInParagraph - 1) return 'linking_1'
    return 'explanation_1' // Default for middle sentences
  }
  
  if (bodyParagraphNumber === 2) {
    if (sentenceIndex === 0) return 'topic_sentence_2'
    if (sentenceIndex === 1) return 'explanation_2'
    if (sentenceIndex === 2) return 'example_2'
    if (sentenceIndex === totalSentencesInParagraph - 2) return 'analysis_2'
    if (sentenceIndex === totalSentencesInParagraph - 1) return 'linking_2'
    return 'explanation_2' // Default for middle sentences
  }
  
  return 'other'
}

function determineParagraphType(paragraphIndex: number, totalParagraphs: number): 'introduction' | 'body1' | 'body2' | 'conclusion' | 'other' {
  if (paragraphIndex === 0) return 'introduction'
  if (paragraphIndex === totalParagraphs - 1) return 'conclusion'
  if (paragraphIndex === 1) return 'body1'
  if (paragraphIndex === 2) return 'body2'
  return 'other'
}

function analyzeSentenceQuality(element: StructuralElementType, text: string, essayType?: EssayType): {
  quality: 'excellent' | 'good' | 'needs_work' | 'poor'
  feedback: string
  tips: string[]
} {
  const tips = STRUCTURAL_TIPS[element]
  if (!tips) {
    return {
      quality: 'needs_work',
      feedback: 'This sentence needs structural analysis.',
      tips: ['Consider the role of this sentence in your essay structure.']
    }
  }
  
  // Clean the text for analysis
  const cleanText = text.trim().toLowerCase()
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  
  // Check for academic language markers
  const hasStrongVerbs = /\b(demonstrates?|illustrates?|reveals?|suggests?|indicates?|proves?|shows?|argues?|maintains?|contends?)\b/i.test(text)
  const hasWeakPhrases = /\b(some people think|many people|it is good|this is important|in conclusion|i think maybe|kind of|sort of)\b/i.test(text)
  const hasVagueWords = /\b(things|stuff|good|bad|nice|awesome|amazing|very|really|quite|pretty)\b/i.test(text)
  
  let quality: 'excellent' | 'good' | 'needs_work' | 'poor'
  let feedback: string
  let improvementTips: string[] = []
  
  // Element-specific analysis
  if (element === 'hook') {
    if (wordCount < 8) {
      quality = 'poor'
      feedback = 'Hook sentence is too short and likely lacks impact.'
      improvementTips = ['Expand with more engaging content', 'Add specific context or statistics']
    } else if (hasWeakPhrases || text.toLowerCase().includes('this essay will')) {
      quality = 'needs_work'
      feedback = 'Hook is too generic and doesn\'t capture reader attention effectively.'
      improvementTips = ['Avoid announcing essay structure', 'Start with a thought-provoking statement']
    } else if (wordCount > 30) {
      quality = 'needs_work'
      feedback = 'Hook sentence is too long and may lose reader focus.'
      improvementTips = ['Keep hook concise but engaging (15-25 words)']
    } else {
      quality = hasStrongVerbs ? 'excellent' : 'good'
      feedback = quality === 'excellent' ? 'Strong, engaging hook that effectively introduces the topic.' : 'Good hook with room for more impact.'
    }
  } else if (element === 'thesis') {
    const hasPosition = /\b(I believe|I argue|I maintain|I contend|should|must|ought)\b/i.test(text)
    const hasBothSides = /\b(both.*and|while.*however|although.*nevertheless|despite.*but)\b/i.test(text)
    const hasAdvantageLanguage = /\b(advantages.*outweigh|benefits.*drawbacks|positive.*negative)\b/i.test(text)
    const hasProblemSolutionLanguage = /\b(main.*problems?|key.*solutions?|address.*issues?)\b/i.test(text)
    
    // Essay type-specific thesis validation
    if (essayType === 'opinion' && !hasPosition) {
      quality = 'poor'
      feedback = 'Opinion essay thesis must clearly state your position (agree/disagree).'
      improvementTips = ['Use strong position language: I believe, I argue', 'Take a clear stance on the issue']
    } else if (essayType === 'discussion' && !hasBothSides && !hasPosition) {
      quality = 'needs_work'
      feedback = 'Discussion essay thesis should acknowledge both viewpoints and/or state your position.'
      improvementTips = ['Acknowledge both sides briefly', 'State your own opinion if required']
    } else if (essayType === 'advantage' && !hasAdvantageLanguage) {
      quality = 'needs_work'
      feedback = 'Advantage/disadvantage thesis should address both benefits and drawbacks.'
      improvementTips = ['Mention both advantages and disadvantages', 'Consider which side outweighs the other']
    } else if (essayType === 'problemSolution' && !hasProblemSolutionLanguage) {
      quality = 'needs_work'
      feedback = 'Problem-solution thesis should preview both problems and solutions to be discussed.'
      improvementTips = ['Outline main problems', 'Preview solution approaches']
    } else if (!hasPosition && essayType !== 'directQuestion') {
      quality = 'poor'
      feedback = 'Thesis doesn\'t clearly state your position on the topic.'
      improvementTips = ['Use confident language (I believe, I argue)', 'Take a clear stance']
    } else if (hasStrongVerbs && wordCount > 15 && wordCount < 40) {
      quality = 'excellent'
      feedback = 'Clear, well-positioned thesis statement that effectively previews your argument.'
    } else {
      quality = 'good'
      feedback = 'Thesis states a position but could be more specific or confident.'
      improvementTips = ['Use more confident language', 'Be more specific about your reasoning']
    }
  }
  // Add more element-specific analysis...
  else {
    // Generic quality assessment with more specific feedback
    if (hasWeakPhrases || hasVagueWords) {
      quality = 'needs_work'
      if (hasWeakPhrases) {
        feedback = `Avoid weak academic phrases. This ${element.replace(/_/g, ' ')} should use more confident, specific language.`
        improvementTips = ['Replace "some people think" with specific research or evidence', 'Use confident academic language']
      } else {
        feedback = `Replace vague words with more precise academic vocabulary in this ${element.replace(/_/g, ' ')}.`
        improvementTips = ['Use specific, academic vocabulary', 'Avoid informal language like "good", "bad", "things"']
      }
    } else if (hasStrongVerbs && wordCount >= 10 && wordCount <= 30) {
      quality = 'excellent'
      feedback = `Strong ${element.replace(/_/g, ' ')} with clear academic language and appropriate length.`
      improvementTips = []
    } else if (hasStrongVerbs || wordCount >= 8) {
      quality = 'good'
      if (wordCount > 40) {
        feedback = `Good ${element.replace(/_/g, ' ')} but could be more concise for better impact.`
        improvementTips = ['Try to express the same idea in fewer words', 'Break into two sentences if necessary']
      } else {
        feedback = `Solid ${element.replace(/_/g, ' ')} that serves its structural purpose well.`
        improvementTips = []
      }
    } else {
      quality = 'needs_work'
      feedback = `This ${element.replace(/_/g, ' ')} is too brief and lacks development.`
      improvementTips = ['Add more specific details or explanation', 'Expand the idea with examples or evidence']
    }
  }
  
  // Combine specific tips with general improvement suggestions
  const generalTips = tips.improvementTips.slice(0, 2) // Take first 2 general tips
  const finalTips = improvementTips.length > 0 ? improvementTips : generalTips
  
  return { quality, feedback, tips: finalTips }
}

function findMissingElements(paragraphType: string, sentences: SentenceAnalysis[]): StructuralElementType[] {
  const missing: StructuralElementType[] = []
  const presentElements = new Set(sentences.map(s => s.structuralElement))
  
  if (paragraphType === 'introduction') {
    if (!presentElements.has('hook')) missing.push('hook')
    if (!presentElements.has('background')) missing.push('background')
    if (!presentElements.has('thesis')) missing.push('thesis')
  } else if (paragraphType === 'body1') {
    if (!presentElements.has('topic_sentence_1')) missing.push('topic_sentence_1')
    if (!presentElements.has('example_1')) missing.push('example_1')
  } else if (paragraphType === 'body2') {
    if (!presentElements.has('topic_sentence_2')) missing.push('topic_sentence_2')
    if (!presentElements.has('example_2')) missing.push('example_2')
  } else if (paragraphType === 'conclusion') {
    if (!presentElements.has('restatement')) missing.push('restatement')
    if (!presentElements.has('final_thought')) missing.push('final_thought')
  }
  
  return missing
}

function assessParagraphQuality(
  paragraphType: string, 
  sentences: SentenceAnalysis[], 
  wordCount: number
): 'excellent' | 'good' | 'needs_work' | 'poor' {
  const averageQuality = sentences.reduce((acc, sentence) => {
    const qualityScore = sentence.quality === 'excellent' ? 4 : 
                        sentence.quality === 'good' ? 3 : 
                        sentence.quality === 'needs_work' ? 2 : 1
    return acc + qualityScore
  }, 0) / sentences.length
  
  // Check word count appropriateness
  let wordCountScore = 3 // default good
  if (paragraphType === 'introduction' && (wordCount < 50 || wordCount > 80)) {
    wordCountScore = 2
  } else if ((paragraphType === 'body1' || paragraphType === 'body2') && (wordCount < 80 || wordCount > 150)) {
    wordCountScore = 2
  } else if (paragraphType === 'conclusion' && (wordCount < 40 || wordCount > 70)) {
    wordCountScore = 2
  }
  
  const finalScore = (averageQuality + wordCountScore) / 2
  
  if (finalScore >= 3.5) return 'excellent'
  if (finalScore >= 2.5) return 'good'
  if (finalScore >= 1.5) return 'needs_work'
  return 'poor'
}

function generateParagraphFeedback(paragraphType: string, sentences: SentenceAnalysis[], wordCount: number): string {
  const wordCountFeedback = 
    paragraphType === 'introduction' ? (wordCount < 50 ? 'Too brief for introduction' : wordCount > 80 ? 'Too long for introduction' : 'Good length') :
    (paragraphType === 'body1' || paragraphType === 'body2') ? (wordCount < 80 ? 'Underdeveloped body paragraph' : wordCount > 150 ? 'Too lengthy, may lose focus' : 'Well-developed paragraph') :
    paragraphType === 'conclusion' ? (wordCount < 40 ? 'Too brief for conclusion' : wordCount > 70 ? 'Too long for conclusion' : 'Good length') :
    'Check paragraph development'
    
  const structuralFeedback = sentences.some(s => s.quality === 'excellent') ? 'Strong structural elements present' :
                            sentences.every(s => s.quality === 'good' || s.quality === 'excellent') ? 'Good overall structure' :
                            'Some structural elements need improvement'
  
  return `${wordCountFeedback}. ${structuralFeedback}.`
}

// Essay Type Detection Function
function detectEssayType(prompt: string, essay: string): EssayTypeAnalysis {
  const combinedText = `${prompt} ${essay}`.toLowerCase()
  const scores: Record<EssayType, number> = {
    opinion: 0,
    discussion: 0,
    advantage: 0,
    problemSolution: 0,
    directQuestion: 0,
    unknown: 0
  }

  // Check patterns against combined text
  Object.entries(ESSAY_TYPE_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(combinedText)) {
        scores[type as EssayType] += 1
      }
    })
  })

  // Find the type with highest score
  let detectedType: EssayType = 'unknown'
  let maxScore = 0
  let confidence = 0

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score
      detectedType = type as EssayType
    }
  })

  // Calculate confidence based on score and text length
  const totalPatterns = Object.values(ESSAY_TYPE_PATTERNS).flat().length
  confidence = Math.min(maxScore / 3, 1) // Normalize confidence

  // If no clear match, try to infer from essay content
  if (detectedType === 'unknown' && essay.trim()) {
    if (essay.toLowerCase().includes('in my opinion') || essay.toLowerCase().includes('i believe')) {
      detectedType = 'opinion'
      confidence = 0.6
    } else if (essay.toLowerCase().includes('on one hand') || essay.toLowerCase().includes('on the other hand')) {
      detectedType = 'discussion'
      confidence = 0.6
    }
  }

  const requirements = ESSAY_TYPE_REQUIREMENTS[detectedType]
  
  return {
    type: detectedType,
    confidence,
    feedback: requirements.feedback,
    structuralRequirements: requirements.structuralRequirements,
    commonMistakes: requirements.commonMistakes
  }
}

// Word Count and Timing Recommendations by Essay Type
function getWordCountRecommendations(essayType: EssayType): {
  minWords: number
  maxWords: number
  recommendedTime: string
  structuralAdvice: string[]
} {
  const recommendations = {
    opinion: {
      minWords: 250,
      maxWords: 300,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Introduction: 50-60 words',
        'Body paragraph 1: 80-100 words',
        'Body paragraph 2: 80-100 words', 
        'Conclusion: 40-50 words'
      ]
    },
    discussion: {
      minWords: 250,
      maxWords: 320,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Introduction: 50-60 words',
        'Body paragraph 1 (First view): 70-90 words',
        'Body paragraph 2 (Second view): 70-90 words',
        'Body paragraph 3 (Own opinion): 60-80 words',
        'Conclusion: 40-50 words'
      ]
    },
    advantage: {
      minWords: 250,
      maxWords: 310,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Introduction: 50-60 words',
        'Body paragraph 1 (Advantages): 80-100 words',
        'Body paragraph 2 (Disadvantages): 80-100 words',
        'Conclusion: 40-50 words'
      ]
    },
    problemSolution: {
      minWords: 250,
      maxWords: 320,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Introduction: 50-60 words',
        'Body paragraph 1 (Problems): 80-100 words',
        'Body paragraph 2 (Solutions): 80-100 words',
        'Conclusion: 40-50 words'
      ]
    },
    directQuestion: {
      minWords: 250,
      maxWords: 300,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Introduction: 40-50 words',
        'Body paragraph 1 (Question 1): 90-110 words',
        'Body paragraph 2 (Question 2): 90-110 words',
        'Conclusion: 30-40 words'
      ]
    },
    unknown: {
      minWords: 250,
      maxWords: 300,
      recommendedTime: '35-40 minutes',
      structuralAdvice: [
        'Follow standard IELTS structure',
        'Ensure minimum 250 words',
        'Allow time for planning and checking'
      ]
    }
  }
  
  return recommendations[essayType]
}

// Helper functions for hierarchical dropdown system
function getUniqueStructuralElements(sentences: SentenceAnalysis[]): StructuralElementType[] {
  const uniqueElements = new Set<StructuralElementType>()
  sentences.forEach(sentence => {
    uniqueElements.add(sentence.structuralElement)
  })
  return Array.from(uniqueElements).sort((a, b) => {
    // Sort by logical order: hook, background, thesis, etc.
    const order: StructuralElementType[] = [
      'hook', 'background', 'thesis', 'outline',
      'topic_sentence_1', 'explanation_1', 'example_1', 'analysis_1', 'linking_1',
      'topic_sentence_2', 'explanation_2', 'example_2', 'analysis_2', 'linking_2',
      'restatement', 'summary', 'final_thought',
      'transition', 'supporting', 'other'
    ]
    return order.indexOf(a) - order.indexOf(b)
  })
}

function getAverageQuality(sentences: SentenceAnalysis[]): 'excellent' | 'good' | 'needs_work' | 'poor' {
  if (sentences.length === 0) return 'poor'
  
  const qualityScores = sentences.map(sentence => {
    switch (sentence.quality) {
      case 'excellent': return 4
      case 'good': return 3
      case 'needs_work': return 2
      case 'poor': return 1
      case 'missing': return 0
      default: return 1
    }
  })
  
  const averageScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
  
  if (averageScore >= 3.5) return 'excellent'
  if (averageScore >= 2.5) return 'good'
  if (averageScore >= 1.5) return 'needs_work'
  return 'poor'
}

function formatElementName(elementType: StructuralElementType): string {
  const formatMap: Record<StructuralElementType, string> = {
    'hook': 'Hook Sentence',
    'background': 'Background Information',
    'thesis': 'Thesis Statement', 
    'outline': 'Essay Outline',
    'topic_sentence_1': 'Topic Sentence (Para 1)',
    'explanation_1': 'Explanation (Para 1)',
    'example_1': 'Example/Evidence (Para 1)',
    'analysis_1': 'Analysis (Para 1)',
    'linking_1': 'Linking Sentence (Para 1)',
    'topic_sentence_2': 'Topic Sentence (Para 2)',
    'explanation_2': 'Explanation (Para 2)',
    'example_2': 'Example/Evidence (Para 2)',
    'analysis_2': 'Analysis (Para 2)',
    'linking_2': 'Linking Sentence (Para 2)',
    'restatement': 'Thesis Restatement',
    'summary': 'Summary of Arguments',
    'final_thought': 'Final Thought/Prediction',
    'transition': 'Transition Sentence',
    'supporting': 'Supporting Detail',
    'other': 'Other Element'
  }
  
  return formatMap[elementType] || elementType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}