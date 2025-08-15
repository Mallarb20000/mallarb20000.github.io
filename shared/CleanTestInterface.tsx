/**
 * =============================================================================
 * CLEAN TEST INTERFACE COMPONENT
 * =============================================================================
 * 
 * Minimal, modern design inspired by top IELTS apps
 * Focus on clarity and simplicity
 */

import React, { useState, useEffect } from 'react'
import { TestConfig } from '../../lib/types'
import { useTestFlow, usePushToTalk, useKeyboardShortcuts } from '../../lib/hooks'
import { audioRecorder } from '../../lib/services/AudioService'
import { ttsService } from '../../lib/services/TTSService'

export interface CleanTestInterfaceProps {
  config: TestConfig
  onComplete?: (results: any) => void
  onError?: (error: Error) => void
}

export const CleanTestInterface: React.FC<CleanTestInterfaceProps> = ({
  config,
  onComplete,
  onError
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  
  const {
    state,
    currentQuestion,
    recordingStatus,
    startTest,
    startRecording,
    stopRecording,
    nextQuestion,
    previousQuestion,
    submitTest,
    speakCurrentQuestion,
    stopSpeaking
  } = useTestFlow({ 
    config,
    onSubmissionComplete: onComplete,
    onError
  })

  // Use recording status from the hook - defined after useTestFlow
  const isRecording = recordingStatus?.isRecording || false

  // Force recording function that bypasses TTS checks
  const forceStartRecording = async () => {
    try {
      console.log('🚀 Force starting recording directly via AudioService...')
      // Stop TTS service directly
      ttsService.stop()
      // Start recording directly via AudioService
      await audioRecorder.startRecording()
      // Update state manually if needed
      // dispatch({ type: 'START_RECORDING' }) - we can't access dispatch directly
      console.log('✅ Direct recording started successfully')
      return true
    } catch (error) {
      console.error('❌ Force recording failed:', error)
      return false
    }
  }

  const forceStopRecording = async () => {
    try {
      console.log('🛑 Force stopping recording directly...')
      const result = await audioRecorder.stopRecording()
      console.log('✅ Direct recording stopped successfully')
      return result
    } catch (error) {
      console.error('❌ Force stop recording failed:', error)
      return null
    }
  }

  // Define handlers first
  const handleRecordToggle = async () => {
    console.log('🎙️ Record toggle clicked, isRecording:', isRecording)
    console.log('🔊 TTS state:', state.tts)
    
    // Check microphone permissions first
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      console.log('🎤 Microphone permission status:', permissionStatus.state)
      
      if (permissionStatus.state === 'denied') {
        alert('Microphone access is denied. Please enable microphone permissions in your browser settings.')
        return
      }
    } catch (permError) {
      console.warn('⚠️ Could not check microphone permissions:', permError)
    }

    try {
      if (isRecording) {
        console.log('🛑 Stopping recording...')
        // Try the hook method first, then direct method as fallback
        try {
          await stopRecording()
        } catch (hookError) {
          console.warn('⚠️ Hook stop failed, trying direct method...')
          await forceStopRecording()
        }
      } else {
        console.log('▶️ Starting recording...')
        
        // First try the normal hook method
        try {
          // Stop TTS first
          if (state.tts?.isSpeaking) {
            console.log('🛑 Stopping TTS...')
            stopSpeaking()
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          await startRecording()
          console.log('✅ Hook recording started successfully')
          
        } catch (hookError) {
          console.warn('⚠️ Hook recording failed, trying direct method...', hookError)
          // Fallback to direct AudioService method
          const success = await forceStartRecording()
          if (!success) {
            throw new Error('Both hook and direct recording methods failed')
          }
        }
      }
    } catch (error) {
      console.error('❌ Recording error:', error)
      alert(`Recording failed: ${error.message}`)
      onError?.(error as Error)
    }
  }

  const progress = Math.round(((state.testFlow.currentQuestionIndex + 1) / config.questions.length) * 100)
  const questionNumber = state.testFlow.currentQuestionIndex + 1
  const totalQuestions = config.questions.length

  // Keyboard shortcuts - using key codes that match the hook  
  // Note: Space is handled by usePushToTalk, not here
  useKeyboardShortcuts({
    'Enter': () => {
      console.log('⏎ Enter key pressed')
      if (questionNumber < totalQuestions) {
        nextQuestion()
      } else {
        submitTest()
      }
    },
    'ArrowLeft': () => {
      console.log('← Left arrow pressed')
      questionNumber > 1 && previousQuestion()
    },
    'ArrowRight': () => {
      console.log('→ Right arrow pressed') 
      questionNumber < totalQuestions && nextQuestion()
    },
    'KeyR': () => {
      console.log('🔊 R key pressed')
      speakCurrentQuestion()
    },
    'Escape': () => {
      console.log('⏨ Escape pressed')
      setShowSettings(false)
    }
  })

  // Push-to-talk functionality  
  usePushToTalk({
    enabled: true,
    key: 'Space',
    onPress: async () => {
      console.log('🎯 Push-to-talk PRESS detected, isRecording:', isRecording)
      console.log('🔊 TTS state on press:', state.tts)
      
      if (!isRecording) {
        // Stop any playing audio/TTS first
        if (state.tts?.isSpeaking) {
          console.log('🛑 Stopping TTS for push-to-talk...')
          stopSpeaking()
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        console.log('▶️ Starting push-to-talk recording...')
        await startRecording()
      }
    },
    onRelease: async () => {
      console.log('🎯 Push-to-talk RELEASE detected, isRecording:', isRecording)
      if (isRecording) {
        console.log('🛑 Stopping push-to-talk recording...')
        await stopRecording()
      }
    }
  })

  // Start test automatically when component mounts
  useEffect(() => {
    console.log('🚀 CleanTestInterface mounted, testStarted:', state.testFlow.testStarted)
    console.log('🎯 Current state:', state)
    console.log('🎤 Recording status:', recordingStatus)
    
    if (!state.testFlow.testStarted) {
      console.log('▶️ Starting test...')
      startTest()
    }
  }, [])

  // Debug recording status changes
  useEffect(() => {
    console.log('🔄 Recording status changed:', recordingStatus)
  }, [recordingStatus])

  // Debug current question changes  
  useEffect(() => {
    console.log('❓ Current question changed:', currentQuestion)
  }, [currentQuestion])

  if (!state.testFlow.testStarted || !currentQuestion) {
    return (
      <div className="clean-test-loading">
        <div className="loading-spinner"></div>
        <p>Preparing your test...</p>
      </div>
    )
  }

  return (
    <div className="clean-test-container">
      {/* Minimal Progress Bar */}
      <div className="clean-progress-bar">
        <div 
          className="clean-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Number - Subtle */}
      <div className="clean-question-number">
        Question {questionNumber} of {totalQuestions}
      </div>

      {/* Main Question Display */}
      <div className="clean-question-card">
        <div className="clean-question-icon">❓</div>
        <h2 className="clean-question-text">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Audio Status - Only show when relevant */}
      {(audioPlaying || state.tts?.isSpeaking) && (
        <div className="clean-audio-status">
          <div className="audio-wave-icon">🔊</div>
          <span>Playing question audio...</span>
          <button 
            className="stop-audio-button"
            onClick={() => {
              console.log('🛑 Manual audio stop clicked')
              stopSpeaking()
            }}
          >
            Stop Audio
          </button>
        </div>
      )}

      {/* Main Recording Button */}
      <div className="clean-record-section">
        <button 
          className={`clean-record-button ${isRecording ? 'recording' : ''}`}
          onClick={() => {
            console.log('🖱️ Button clicked!')
            handleRecordToggle()
          }}
          disabled={audioPlaying}
        >
          <div className="record-button-icon">
            {isRecording ? '⏹️' : '🎙️'}
          </div>
          <span className="record-button-text">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </span>
        </button>
        
        {/* Keyboard shortcut hint */}
        <div className="clean-shortcut-hint">
          Press <kbd>Space</kbd> to record
        </div>
        
        {/* Recording Status */}
        {isRecording && (
          <div className="clean-recording-status">
            <div className="recording-pulse"></div>
            <span>Recording...</span>
          </div>
        )}
      </div>

      {/* Simple Navigation */}
      <div className="clean-navigation">
        {questionNumber > 1 && (
          <button 
            className="clean-nav-button clean-nav-prev"
            onClick={previousQuestion}
          >
            ← Previous
          </button>
        )}
        
        <div className="clean-nav-spacer"></div>
        
        {questionNumber < totalQuestions ? (
          <button 
            className="clean-nav-button clean-nav-next"
            onClick={nextQuestion}
          >
            Next →
          </button>
        ) : (
          <button 
            className="clean-submit-button"
            onClick={() => submitTest()}
          >
            Submit Test
          </button>
        )}
      </div>

      {/* Settings Toggle - Hidden by default */}
      <button 
        className="clean-settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
      >
        ⚙️
      </button>

      {/* Collapsible Settings */}
      {showSettings && (
        <div className="clean-settings-panel">
          <div className="clean-settings-header">
            <h3>Test Settings</h3>
            <button onClick={() => setShowSettings(false)}>✕</button>
          </div>
          <div className="clean-settings-content">
            <label className="clean-setting-item">
              <input type="checkbox" />
              <span>Auto-advance questions</span>
            </label>
            <label className="clean-setting-item">
              <input type="checkbox" />
              <span>Play question audio</span>
            </label>
            <label className="clean-setting-item">
              <input type="checkbox" />
              <span>Keyboard shortcuts</span>
            </label>
          </div>
        </div>
      )}

      <style jsx>{`
        .clean-test-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--bg-primary);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .clean-progress-bar {
          width: 100%;
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .clean-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s ease;
        }

        .clean-question-number {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .clean-question-card {
          text-align: center;
          margin: 3rem 0;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .clean-question-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .clean-question-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .clean-audio-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin: 1rem 0;
          color: var(--text-secondary);
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .stop-audio-button {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          cursor: pointer;
          margin-left: 1rem;
        }

        .stop-audio-button:hover {
          background: #b91c1c;
        }

        .clean-record-section {
          text-align: center;
          margin: 3rem 0;
        }

        .clean-shortcut-hint {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .clean-shortcut-hint kbd {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 0.2rem 0.4rem;
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .clean-record-button {
          background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
          border: none;
          border-radius: 50px;
          padding: 1.5rem 3rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 auto;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255,107,107,0.3);
        }

        .clean-record-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255,107,107,0.4);
        }

        .clean-record-button.recording {
          background: linear-gradient(45deg, #dc2626, #ef4444);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .record-button-icon {
          font-size: 1.2rem;
        }

        .clean-recording-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #dc2626;
        }

        .recording-pulse {
          width: 8px;
          height: 8px;
          background: #dc2626;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .clean-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3rem;
        }

        .clean-nav-button, .clean-submit-button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clean-nav-button:hover, .clean-submit-button:hover {
          background: var(--bg-tertiary);
          transform: translateY(-1px);
        }

        .clean-submit-button {
          background: linear-gradient(45deg, #10b981, #34d399);
          color: white;
          border: none;
          font-weight: 600;
        }

        .clean-nav-spacer {
          flex: 1;
        }

        .clean-settings-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .clean-settings-panel {
          position: fixed;
          bottom: 5rem;
          right: 2rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          min-width: 250px;
        }

        .clean-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .clean-setting-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.75rem 0;
          cursor: pointer;
        }

        .clean-test-loading {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--bg-secondary);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}