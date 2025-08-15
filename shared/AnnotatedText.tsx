'use client'

import React, { useState, useMemo } from 'react'

interface Annotation {
  text: string
  startIndex: number
  endIndex: number
  criteria: string
  performance: 'excellent' | 'good' | 'needs_work' | 'poor'
  feedback: string
  suggestion?: string
}

interface AnnotatedTextProps {
  text: string
  annotations: Annotation[]
  selectedCriteria: string
  onHover?: (annotation: Annotation | null) => void
}

const AnnotatedText: React.FC<AnnotatedTextProps> = ({ 
  text, 
  annotations, 
  selectedCriteria,
  onHover 
}) => {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null)

  // Filter annotations based on selected criteria
  const filteredAnnotations = useMemo(() => {
    if (selectedCriteria === 'all') return annotations
    if (selectedCriteria === 'structure') {
      return annotations.filter(a => a.criteria === 'structure')
    }
    if (selectedCriteria === 'bands') {
      return annotations.filter(a => ['task_response', 'coherence_cohesion', 'lexical_resource', 'grammar_accuracy'].includes(a.criteria))
    }
    return annotations.filter(a => a.criteria === selectedCriteria)
  }, [annotations, selectedCriteria])

  // Create text segments with highlighting
  const textSegments = useMemo(() => {
    if (filteredAnnotations.length === 0) {
      return [{ text, isAnnotated: false, annotation: null }]
    }

    // Sort annotations by start index
    const sortedAnnotations = [...filteredAnnotations].sort((a, b) => a.startIndex - b.startIndex)
    
    const segments = []
    let currentIndex = 0

    sortedAnnotations.forEach(annotation => {
      // Add text before annotation
      if (currentIndex < annotation.startIndex) {
        segments.push({
          text: text.slice(currentIndex, annotation.startIndex),
          isAnnotated: false,
          annotation: null
        })
      }

      // Add annotated text
      segments.push({
        text: text.slice(annotation.startIndex, annotation.endIndex),
        isAnnotated: true,
        annotation
      })

      currentIndex = annotation.endIndex
    })

    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({
        text: text.slice(currentIndex),
        isAnnotated: false,
        annotation: null
      })
    }

    return segments
  }, [text, filteredAnnotations])

  const getPerformanceClass = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'highlight-excellent'
      case 'good': return 'highlight-good'
      case 'needs_work': return 'highlight-needs-work'
      case 'poor': return 'highlight-poor'
      default: return ''
    }
  }

  const handleMouseEnter = (annotation: Annotation) => {
    setHoveredAnnotation(annotation)
    onHover?.(annotation)
  }

  const handleMouseLeave = () => {
    setHoveredAnnotation(null)
    onHover?.(null)
  }

  return (
    <div className="annotated-text-container">
      <div className="essay-text">
        {textSegments.map((segment, index) => {
          if (!segment.isAnnotated) {
            return <span key={index}>{segment.text}</span>
          }

          return (
            <span
              key={index}
              className={`annotated-segment ${getPerformanceClass(segment.annotation.performance)}`}
              onMouseEnter={() => handleMouseEnter(segment.annotation)}
              onMouseLeave={handleMouseLeave}
              data-criteria={segment.annotation.criteria}
              data-performance={segment.annotation.performance}
            >
              {segment.text}
            </span>
          )
        })}
      </div>

      {/* Hover Popup */}
      {hoveredAnnotation && (
        <div className="annotation-popup">
          <div className="popup-header">
            <span className={`performance-badge ${hoveredAnnotation.performance}`}>
              {hoveredAnnotation.performance.replace('_', ' ')}
            </span>
            <span className="criteria-badge">
              {hoveredAnnotation.criteria.replace('_', ' ')}
            </span>
          </div>
          
          <div className="popup-content">
            <div className="original-text">
              "{hoveredAnnotation.text}"
            </div>
            
            <div className="feedback">
              <strong>Feedback:</strong> {hoveredAnnotation.feedback}
            </div>
            
            {hoveredAnnotation.suggestion && (
              <div className="suggestion">
                <strong>Suggestion:</strong> {hoveredAnnotation.suggestion}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .annotated-text-container {
          position: relative;
        }

        .annotated-segment {
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .annotated-segment:hover {
          opacity: 0.8;
        }

        .annotation-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          min-width: 300px;
          max-width: 400px;
          margin-bottom: var(--space-sm);
        }

        .popup-header {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .performance-badge {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .performance-badge.excellent {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .performance-badge.good {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .performance-badge.needs_work {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }

        .performance-badge.poor {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .criteria-badge {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
          background: var(--bg-muted);
          color: var(--color-secondary);
        }

        .popup-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .original-text {
          font-style: italic;
          color: var(--color-secondary);
          border-left: 3px solid var(--border-color);
          padding-left: var(--space-sm);
        }

        .feedback, .suggestion {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .feedback strong, .suggestion strong {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  )
}

export default AnnotatedText