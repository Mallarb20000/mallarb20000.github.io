/**
 * =============================================================================
 * STREAMING PROGRESS COMPONENT
 * =============================================================================
 * 
 * Progress indicator for streaming AI analysis
 * Shows real-time progress updates during submission
 */

import React from 'react'
import { ProgressUpdate } from '../../lib/services/StreamingSubmissionService'

export interface StreamingProgressProps {
  progress: ProgressUpdate
  isVisible: boolean
  className?: string
}

export default function StreamingProgress({ 
  progress, 
  isVisible, 
  className = '' 
}: StreamingProgressProps) {
  if (!isVisible) return null

  return (
    <div className={`streaming-progress ${className}`}>
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="progress-info">
        <div className="progress-message">
          {progress.message}
        </div>
        <div className="progress-percentage">
          {progress.percentage}%
        </div>
      </div>
      
      {/* Step Counter */}
      <div className="progress-steps">
        Step {progress.step} of {progress.total}
      </div>

      <style jsx>{`
        .streaming-progress {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          min-width: 320px;
          z-index: 1000;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background-color: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-message {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .progress-percentage {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
        }

        .progress-steps {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .streaming-progress {
            background: #1f2937;
            border-color: #374151;
          }

          .progress-bar-container {
            background-color: #374151;
          }

          .progress-message {
            color: #f9fafb;
          }

          .progress-steps {
            color: #9ca3af;
          }
        }

        /* Animation for progress bar */
        .progress-bar-fill {
          position: relative;
          overflow: hidden;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background-image: linear-gradient(
            -45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          );
          background-size: 50px 50px;
          animation: move 2s linear infinite;
        }

        @keyframes move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }
      `}</style>
    </div>
  )
}

// Alternative minimal version for inline use
export function InlineStreamingProgress({ 
  progress, 
  isVisible, 
  className = '' 
}: StreamingProgressProps) {
  if (!isVisible) return null

  return (
    <div className={`inline-progress ${className}`}>
      <div className="inline-progress-bar">
        <div 
          className="inline-progress-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="inline-progress-text">
        {progress.message} ({progress.percentage}%)
      </div>

      <style jsx>{`
        .inline-progress {
          margin: 16px 0;
        }

        .inline-progress-bar {
          width: 100%;
          height: 4px;
          background-color: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .inline-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .inline-progress-text {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
      `}</style>
    </div>
  )
}