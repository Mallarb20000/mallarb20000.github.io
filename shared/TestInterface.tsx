/**
 * =============================================================================
 * UNIFIED TEST INTERFACE COMPONENT
 * =============================================================================
 * 
 * Single configurable component that handles all IELTS test types
 * Replaces separate part1-drill, part3-drill, and quick-drill components
 */

import React, { useEffect, useState, useCallback } from 'react'
import { TestConfig } from '../../lib/types'
import { useTestFlow, useKeyboardShortcuts, usePushToTalk, useTestNavigation } from '../../lib/hooks'
import QuestionDisplay from './QuestionDisplay'
import Part2CueCard from './Part2CueCard'
import RecordingControls from './RecordingControls'
import SubmissionPanel from './SubmissionPanel'

export interface TestInterfaceProps {
  config: TestConfig
  onComplete?: (results: any) => void
  onError?: (error: Error) => void
  className?: string
  style?: React.CSSProperties
}

export const TestInterface: React.FC<TestInterfaceProps> = ({
  config,
  onComplete,
  onError,
  className,
  style
}) => {
  // Part 2 specific state for preparation phase
  const [isPreparationPhase, setIsPreparationPhase] = useState(config.type === 'part2')
  const [preparationComplete, setPreparationComplete] = useState(false)
  // Main test flow hook
  const {
    state,
    currentQuestion,
    canSubmit,
    recordingStatus,
    startTest,
    resetTest,
    nextQuestion,
    previousQuestion,
    startRecording,
    stopRecording,
    reRecordCurrentQuestion,
    setRecordingMode,
    speakCurrentQuestion,
    stopSpeaking,
    submitTest,
    setAutoSubmit,
    getProgressPercentage,
    canNavigateNext,
    canNavigatePrevious,
    isLastQuestion
  } = useTestFlow({
    config,
    onSubmissionComplete: onComplete,
    onError
  })

  // Keyboard shortcuts
  usePushToTalk({
    enabled: state.testFlow.testStarted,
    onPress: async () => {
      // Ensure TTS is stopped before starting recording to avoid guard blocks
      if (state.tts?.isSpeaking) {
        try {
          stopSpeaking()
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (e) {
          // ignore
        }
      }
      await startRecording()
    },
    onRelease: stopRecording
  })

  useTestNavigation({
    enabled: state.testFlow.testStarted,
    onNext: canNavigateNext() ? nextQuestion : undefined,
    onPrevious: canNavigatePrevious() ? previousQuestion : undefined,
    onSubmit: canSubmit ? submitTest : undefined,
    onReset: resetTest
  })

  // Auto-start test when component mounts
  useEffect(() => {
    console.log('TestInterface useEffect, testStarted:', state.testFlow.testStarted)
    if (!state.testFlow.testStarted) {
      console.log('Calling startTest...')
      startTest()
    }
  }, [state.testFlow.testStarted, startTest])

  // Part 2 preparation complete handler
  const handlePreparationComplete = () => {
    setPreparationComplete(true)
    setIsPreparationPhase(false)
  }

  // Reset preparation state when question changes in Part 2
  useEffect(() => {
    if (config.type === 'part2') {
      setIsPreparationPhase(true)
      setPreparationComplete(false)
    }
  }, [state.testFlow.currentQuestionIndex, config.type])

  // Debug state changes
  useEffect(() => {
    console.log('TestInterface state changed:', state)
  }, [state])

  // Test not started - show loading screen
  if (!state.testFlow.testStarted) {
    return (
      <div className={`test-interface-container ${className || ''}`} style={style}>
        <div className="test-loading-screen">
          <div className="test-loading-icon">⏳</div>
          <h2 className="test-loading-title">
            Starting {config.title}...
          </h2>
          <p className="test-loading-subtitle">
            Preparing your test environment
          </p>
        </div>
      </div>
    )
  }

  // Test in progress - show main interface
  return (
    <div className={`test-interface-container ${className || ''}`} style={style}>
      <div className="test-interface-card">
        
        {/* Header */}
        <div className="test-interface-header">
          <h1 className="test-interface-title">
            {config.title}
          </h1>
          <p className="test-interface-description">
            {config.description}
          </p>
        </div>

        {/* Question Display - Use Part2CueCard for Part 2, regular display for others */}
        {config.type === 'part2' ? (
          <Part2CueCard
            question={currentQuestion?.question || ''}
            questionNumber={state.testFlow.currentQuestionIndex + 1}
            totalQuestions={config.questions.length}
            progress={getProgressPercentage()}
            preparationTime={60} // 1 minute preparation
            onPreparationComplete={handlePreparationComplete}
            isPreparationPhase={isPreparationPhase}
          />
        ) : (
          <QuestionDisplay
            question={currentQuestion?.question || ''}
            questionNumber={state.testFlow.currentQuestionIndex + 1}
            totalQuestions={config.questions.length}
            progress={getProgressPercentage()}
            onPlayTTS={speakCurrentQuestion}
            onStopTTS={stopSpeaking}
            isSpeaking={state.tts.isSpeaking}
          />
        )}

        {/* Recording Controls - Disabled during Part 2 preparation phase */}
        <RecordingControls
          isRecording={recordingStatus.isRecording}
          canRecord={recordingStatus.canRecord && !(config.type === 'part2' && isPreparationPhase)}
          recordingMode={recordingStatus.recordingMode}
          onStartRecording={async () => {
            // Stop TTS first to guarantee recording can start
            if (state.tts?.isSpeaking) {
              try {
                stopSpeaking()
                await new Promise(resolve => setTimeout(resolve, 100))
              } catch (e) {
                // ignore
              }
            }
            await startRecording()
          }}
          onStopRecording={stopRecording}
          onModeChange={setRecordingMode}
        />
        
        {/* Part 2 Preparation Message */}
        {config.type === 'part2' && isPreparationPhase && (
          <div className="part2-preparation-notice">
            <div className="preparation-notice-content">
              <span>📝</span>
              <span>Complete your preparation first before recording</span>
            </div>
          </div>
        )}

        {/* Submission Panel */}
        <SubmissionPanel
          allQuestionsAnswered={state.testFlow.allQuestionsAnswered}
          isProcessing={state.submission.isProcessing}
          autoSubmit={state.testFlow.autoSubmit}
          onAutoSubmitChange={setAutoSubmit}
          currentQuestionIndex={state.testFlow.currentQuestionIndex}
          totalQuestions={config.questions.length}
          canNavigateNext={canNavigateNext()}
          canNavigatePrevious={canNavigatePrevious()}
          onNextQuestion={nextQuestion}
          onPreviousQuestion={previousQuestion}
          onSubmit={submitTest}
          onReset={resetTest}
          hasCurrentRecording={recordingStatus.hasRecording}
          onReRecord={reRecordCurrentQuestion}
          testName={config.type.toUpperCase()}
        />

        {/* Error Display */}
        {state.submission.error && (
          <div className="test-error-container">
            <div className="test-error-header">
              <span>❌</span>
              <span>Error</span>
            </div>
            <div className="test-error-message">
              {state.submission.error}
            </div>
            {state.submission.canRetry && (
              <button
                onClick={submitTest}
                className="btn-secondary-compact test-error-retry"
              >
                <span>🔄</span>
                <span>Retry Submission</span>
              </button>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="keyboard-shortcuts-help">
          <div className="keyboard-shortcuts-content">
            <strong>Keyboard Shortcuts:</strong> Space (record), Enter (submit), 
            ← → (navigate), R (replay question), Esc (reset)
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestInterface