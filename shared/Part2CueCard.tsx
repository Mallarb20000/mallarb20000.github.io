/**
 * =============================================================================
 * PART 2 CUE CARD COMPONENT - COMPACT DESIGN
 * =============================================================================
 * 
 * Specialized display for IELTS Part 2 cue card with preparation timer
 * Features side-by-side layout to minimize scrolling
 */

import React, { useState, useEffect } from 'react'

export interface Part2CueCardProps {
  question: string
  questionNumber: number
  totalQuestions: number
  progress: number
  preparationTime?: number // in seconds, default 60
  onPreparationComplete?: () => void
  isPreparationPhase: boolean
}

export const Part2CueCard: React.FC<Part2CueCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  progress,
  preparationTime = 60,
  onPreparationComplete,
  isPreparationPhase
}) => {
  const [timeRemaining, setTimeRemaining] = useState(preparationTime)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Start preparation timer
  const startPreparation = () => {
    setIsTimerRunning(true)
    setTimeRemaining(preparationTime)
  }

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          onPreparationComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning, timeRemaining, onPreparationComplete])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Parse cue card content
  const parseCueCard = (text: string) => {
    const parts = text.split('You should say:')
    const topic = parts[0].trim()
    const points = parts[1]?.split(',').map(point => point.trim()) || []
    
    return { topic, points }
  }

  const { topic, points } = parseCueCard(question)

  return (
    <div>
      {/* Progress Bar - Compact */}
      {totalQuestions > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              Question {questionNumber} of {totalQuestions}
            </span>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div style={{ 
            background: '#e5e7eb', 
            borderRadius: '8px', 
            height: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Main Container - Side by side layout for no scrolling */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '16px'
      }}>
        
        {/* Cue Card Display */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(245, 158, 11, 0.15)',
          position: 'relative',
          height: 'fit-content'
        }}>
          {/* Cue Card Header */}
          <div style={{
            background: '#f59e0b',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            position: 'absolute',
            top: '-8px',
            left: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            📝 IELTS Part 2 - Cue Card
          </div>

          {/* Topic */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ 
              margin: '0 0 10px 0',
              color: '#92400e',
              fontSize: '17px',
              fontWeight: 'bold'
            }}>
              Topic:
            </h3>
            <p style={{ 
              fontSize: '15px', 
              lineHeight: '1.4',
              margin: 0,
              color: '#451a03',
              fontWeight: '500'
            }}>
              {topic}
            </p>
          </div>

          {/* Points to Cover */}
          {points.length > 0 && (
            <div>
              <h4 style={{
                margin: '0 0 10px 0',
                color: '#92400e',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                You should say:
              </h4>
              <ul style={{
                margin: 0,
                padding: '0 0 0 16px',
                color: '#451a03'
              }}>
                {points.map((point, index) => (
                  <li key={index} style={{
                    fontSize: '14px',
                    lineHeight: '1.4',
                    marginBottom: '4px',
                    fontWeight: '400'
                  }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Preparation Timer Section - Compact */}
        <div style={{
          background: isPreparationPhase ? '#f0f9ff' : '#f0fdf4',
          border: `2px solid ${isPreparationPhase ? '#0ea5e9' : '#10b981'}`,
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          {!isTimerRunning && timeRemaining === preparationTime ? (
            // Initial state - not started
            <div>
              <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>⏰</div>
              <h4 style={{ 
                margin: '0 0 6px 0',
                color: '#374151',
                fontSize: '15px'
              }}>
                Preparation: {formatTime(preparationTime)}
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: '0 0 10px 0',
                fontSize: '12px'
              }}>
                Read & make notes
              </p>
              <button
                onClick={startPreparation}
                style={{
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)',
                  width: '100%'
                }}
              >
                ⏰ Start Prep
              </button>
            </div>
          ) : isTimerRunning ? (
            // Timer running - Large countdown
            <div>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '6px', 
                color: '#0ea5e9', 
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                {formatTime(timeRemaining)}
              </div>
              <h4 style={{ 
                margin: '0 0 6px 0',
                color: '#0ea5e9',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Time Left
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: '0 0 8px 0',
                fontSize: '12px'
              }}>
                Prepare your answer...
              </p>
              <div style={{
                background: '#e0f2fe',
                height: '4px',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#0ea5e9',
                  height: '100%',
                  width: `${((preparationTime - timeRemaining) / preparationTime) * 100}%`,
                  transition: 'width 1s linear'
                }} />
              </div>
            </div>
          ) : (
            // Preparation complete - Ready to record
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#10b981' }}>✅</div>
              <h4 style={{ 
                margin: '0 0 6px 0',
                color: '#10b981',
                fontSize: '15px',
                fontWeight: 'bold'
              }}>
                Ready!
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: 0,
                fontSize: '12px'
              }}>
                Record 1-2 minutes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compact Instructions Row */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '12px',
        color: '#475569'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <span>📖 Read during prep</span>
          <span>📝 Make notes</span>
          <span>⏱️ Speak 1-2 min</span>
          <span>✓ Cover all points</span>
        </div>
      </div>
    </div>
  )
}

export default Part2CueCard