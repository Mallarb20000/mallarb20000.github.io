'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomQuestion, Question as APIQuestion } from '../../services/questionsAPI';
import Modal from '../../components/Modal';
import './writing.css';

// --- TYPE DEFINITIONS ---
type AnalysisState = 'initial' | 'loading' | 'analyzed';


interface PlanningAnswers {
  typeOfEssay: string;
  hookSentence: string;
  thesisSentence: string;
  topicSentences: string;
  linkToThesis: string;
  conclusion: string;
}


// --- LAYOUT COMPONENTS ---
const MainContent: React.FC<{
  essayText: string;
  onEssayChange: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  wordCount: number;
  currentQuestion: APIQuestion;
  onChangeQuestion: () => void;
  isLoadingQuestion: boolean;
  isPlanningComplete: boolean;
  hasLastAnalysis: boolean;
}> = ({
  essayText,
  onEssayChange,
  onAnalyze,
  onClear,
  wordCount,
  currentQuestion,
  onChangeQuestion,
  isPlanningComplete,
  hasLastAnalysis,
  isLoadingQuestion,
}) => (
  <main className="main-content">
    <div className="prompt-box">
      <div className="prompt-header">
        <h2>IELTS WRITING TASK 2</h2>
        <button className="btn btn-outline" onClick={onChangeQuestion} disabled={isLoadingQuestion}>
          {isLoadingQuestion ? 'Loading...' : 'Change Question'}
        </button>
      </div>
      <div className="prompt-content">
        <div className="prompt-text">
          <p>{currentQuestion.question}</p>
        </div>
        <div className="prompt-actions">
          <button className="btn btn-secondary btn-small" onClick={onClear}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
            </svg>
            Clear
          </button>
          {hasLastAnalysis && (
            <button
              className="btn btn-outline btn-small"
              onClick={() => window.open('/writing/report', '_blank')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              View Report
            </button>
          )}
          <button
            className="btn btn-primary btn-small"
            onClick={onAnalyze}
            disabled={wordCount === 0}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"/>
            </svg>
            Analyze
          </button>
        </div>
      </div>
    </div>
    <div className="editor-container">
      <textarea
        value={essayText}
        onChange={(e) => onEssayChange(e.target.value)}
        placeholder={
          isPlanningComplete
            ? 'Start writing your essay here...'
            : 'Complete your planning notes first to unlock the essay editor...'
        }
        disabled={!isPlanningComplete}
        className={!isPlanningComplete ? 'editor-disabled' : ''}
        title={
          !isPlanningComplete ? 'Please complete planning phase first' : ''
        }
      />
      {!isPlanningComplete && (
        <div className="editor-overlay">
          <div className="lock-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
          </div>
          <p>Please complete planning phase first</p>
        </div>
      )}
      <div className="editor-footer">
        <span className="word-count">{wordCount} words</span>
      </div>
    </div>
  </main>
);

const PlanningPad: React.FC<{
  planningAnswers: PlanningAnswers;
  onPlanningChange: (answers: PlanningAnswers) => void;
}> = ({ planningAnswers, onPlanningChange }) => {
  const [isImportanceExpanded, setIsImportanceExpanded] = useState(true);
  const questions = [
    {
      key: 'typeOfEssay' as keyof PlanningAnswers,
      label: '1. Type of Essay:',
      placeholder: 'e.g., Discussion, Opinion, Problem-Solution...',
    },
    {
      key: 'hookSentence' as keyof PlanningAnswers,
      label: '2. Hook Sentence:',
      placeholder: 'Write an engaging opening sentence...',
    },
    {
      key: 'thesisSentence' as keyof PlanningAnswers,
      label: '3. Thesis Sentence:',
      placeholder: 'State your main argument clearly...',
    },
    {
      key: 'topicSentences' as keyof PlanningAnswers,
      label: '4. Topic Sentences with supporting details and examples:',
      placeholder: 'Body paragraph 1:\nBody paragraph 2:',
    },
    {
      key: 'linkToThesis' as keyof PlanningAnswers,
      label: '5. How paragraphs link back to thesis:',
      placeholder:
        'Explain the connection between each paragraph and your thesis...',
    },
    {
      key: 'conclusion' as keyof PlanningAnswers,
      label: '6. Conclusion and recommendation:',
      placeholder:
        'Summarize and provide final thoughts or recommendations...',
    },
  ];

  const handleAnswerChange = (key: keyof PlanningAnswers, value: string) => {
    onPlanningChange({
      ...planningAnswers,
      [key]: value,
    });
  };

  return (
    <aside className="planning-pad">
      <div className="planning-header">
        <h2>Planning Notes</h2>
        <div className="planning-importance">
          <div
            className="importance-toggle"
            onClick={() => setIsImportanceExpanded(!isImportanceExpanded)}
            role="button"
            tabIndex={0}
          >
            <h3>Why Planning is Essential</h3>
            <div
              className={`toggle-icon ${
                isImportanceExpanded ? 'expanded' : ''
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          {isImportanceExpanded && (
            <div className="importance-content">
              <p>
                Effective planning is crucial for IELTS Writing Task 2 success.
                It helps you:
              </p>
              <ul>
                <li>Organize your thoughts clearly</li>
                <li>Ensure balanced arguments</li>
                <li>Stay focused on the topic</li>
                <li>Meet word count requirements</li>
                <li>Achieve higher band scores</li>
              </ul>
              <p>
                <strong>
                  Please complete all planning sections below before writing
                  your essay.
                </strong>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="planning-container">
        {questions.map((question) => (
          <div key={question.key} className="planning-question">
            <label className="question-label">{question.label}</label>
            <textarea
              value={planningAnswers[question.key]}
              onChange={(e) => handleAnswerChange(question.key, e.target.value)}
              placeholder={question.placeholder}
              className="answer-textarea"
              rows={question.key === 'topicSentences' ? 6 : 3}
            />
          </div>
        ))}
      </div>
    </aside>
  );
};

export default function WritingPage() {
  const router = useRouter();
  const [essayText, setEssayText] = useState('');
  const [planningAnswers, setPlanningAnswers] = useState<PlanningAnswers>({
    typeOfEssay: '',
    hookSentence: '',
    thesisSentence: '',
    topicSentences: '',
    linkToThesis: '',
    conclusion: ''
  })
  const [analysisState, setAnalysisState] = useState<AnalysisState>('initial')
  const [currentQuestion, setCurrentQuestion] = useState<APIQuestion>({
    id: 1,
    question: "Loading question..."
  })
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null)
  const [isPlanningVisible, setIsPlanningVisible] = useState(true)

  // Load initial question from API
  useEffect(() => {
    const loadInitialQuestion = async () => {
      if (typeof window !== 'undefined') {
        const storedState = sessionStorage.getItem('writingState');
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState);
            setEssayText(parsed.essayText || '');
            setPlanningAnswers(parsed.planningAnswers || planningAnswers);
            setAnalysisState(parsed.analysisState || 'initial');
            // Only use stored question if it exists and has valid API data, otherwise load new one
            if (parsed.currentQuestion && parsed.currentQuestion.id !== 1) {
              setCurrentQuestion(parsed.currentQuestion);
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved state:', e);
          }
        }
      }
      
      // Load fresh question from API
      try {
        const question = await getRandomQuestion()
        setCurrentQuestion(question)
      } catch (error) {
        console.error('Failed to load initial question:', error)
      }
    }
    
    loadInitialQuestion()
  }, [])

  // Save state on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'writingState',
        JSON.stringify({
          essayText,
          planningAnswers,
          currentQuestion,
          analysisState,
        })
      );
    }
  }, [essayText, planningAnswers, currentQuestion, analysisState]);

  const handleAnalyze = async () => {
    if (wordCount === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to analyze this essay?\n\nThis will submit your essay for AI analysis and generate detailed IELTS band scores.'
    );
    if (!confirmed) return;

    setAnalysisState('loading');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/writing/analyze`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essay: essayText.trim(),
            prompt: currentQuestion.question,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setAnalysisState('analyzed');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'lastAnalysis',
            JSON.stringify({
              analysis: result.analysis,
              essay: essayText,
              prompt: currentQuestion.question,
              timestamp: new Date().toISOString(),
            })
          );
        }
        router.push('/writing/report');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Analysis failed. Please check that the backend is running.');
      setAnalysisState('initial');
    }
  };

  const handleClearClick = () => {
    setShowClearModal(true)
  }

  const handleConfirmClear = () => {
    setShowClearModal(false)
    setEssayText('')
    setAnalysisState('initial')
  }

  const handleCancelClear = () => {
    setShowClearModal(false)
  }

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  const handleChangeQuestionClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmChangeQuestion = async () => {
    setShowConfirmModal(false)
    setIsLoadingQuestion(true)
    
    try {
      // Get new question
      const newQuestion = await getRandomQuestion()
      
      // Reset everything
      setCurrentQuestion(newQuestion)
      setEssayText('')
      setPlanningAnswers({
        typeOfEssay: '',
        hookSentence: '',
        thesisSentence: '',
        topicSentences: '',
        linkToThesis: '',
        conclusion: ''
      })
      setAnalysisState('initial')
      
      // Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('writingState')
        sessionStorage.removeItem('lastAnalysis')
      }
    } catch (error) {
      console.error('Failed to change question:', error)
      alert('Failed to load new question. Please try again.')
    } finally {
      setIsLoadingQuestion(false)
    }
  }

  const handleCancelChangeQuestion = () => {
    setShowConfirmModal(false)
  }

  const wordCount = useMemo(() => {
    if (!essayText.trim()) return 0;
    return essayText.trim().split(/\s+/).length;
  }, [essayText]);

  const isPlanningComplete = useMemo(() => {
    return Object.values(planningAnswers).every(answer => answer.trim().length > 0);
  }, [planningAnswers]);

  const hasLastAnalysis = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastAnalysis') !== null;
    }
    return false;
  }, [analysisState]);
  

  return (
    <div className="app-main">
      <MainContent
        essayText={essayText}
        onEssayChange={setEssayText}
        onAnalyze={handleAnalyze}
        onClear={handleClearClick}
        wordCount={wordCount}
        currentQuestion={currentQuestion}
        onChangeQuestion={handleChangeQuestionClick}
        isPlanningComplete={isPlanningComplete}
        hasLastAnalysis={hasLastAnalysis}
        isLoadingQuestion={isLoadingQuestion}
      />
      
      {/* Mobile Toggle Button */}
      <button 
        className={`planning-toggle-btn ${isPlanningVisible ? 'hidden' : 'visible'}`}
        onClick={() => setIsPlanningVisible(true)}
        aria-label="Show planning notes"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        Planning
      </button>

      {/* Planning Panel */}
      <div className={`planning-panel ${isPlanningVisible ? 'visible' : 'hidden'}`}>
        <PlanningPad
          planningAnswers={planningAnswers}
          onPlanningChange={setPlanningAnswers}
        />
        
        {/* Mobile Close Button */}
        <button 
          className="planning-close-btn"
          onClick={() => setIsPlanningVisible(false)}
          aria-label="Hide planning notes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Change Question Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelChangeQuestion}
        title="Change Question"
        iconColor="warning"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        }
        buttons={[
          {
            text: 'Cancel',
            onClick: handleCancelChangeQuestion,
            variant: 'secondary'
          },
          {
            text: 'Yes, Change Question',
            onClick: handleConfirmChangeQuestion,
            variant: 'primary',
            disabled: isLoadingQuestion,
            loading: isLoadingQuestion
          }
        ]}
      >
        <div className="modal-message">
          <p className="primary-message">Are you sure you want the question changed?</p>
          <p className="secondary-message">All the progress will be lost.</p>
        </div>
      </Modal>

      {/* Clear Essay Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={handleCancelClear}
        title="Clear Essay"
        iconColor="danger"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
          </svg>
        }
        buttons={[
          {
            text: 'Cancel',
            onClick: handleCancelClear,
            variant: 'secondary'
          },
          {
            text: 'Yes, Clear Essay',
            onClick: handleConfirmClear,
            variant: 'primary'
          }
        ]}
      >
        <div className="modal-message">
          <p className="primary-message">Are you sure you want to clear your essay?</p>
          <p className="secondary-message">This will delete all your written content and cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}
