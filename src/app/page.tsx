'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomQuestion, Question as APIQuestion } from '../services/questionsAPI';
import Modal from '../components/Modal';
import StructuredEssayEditor from '../components/StructuredEssayEditor';
import ThemeToggle from '../components/ThemeToggle';
import ChatInterface from '../components/coach/ChatInterface';
import { initChat, ChatSession } from '../services/geminiService';
import './writing.css';
import '../components/StructuredEssayEditor.css';

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
  structuredEssay: { [key: string]: string };
  onStructuredEssayChange: (essay: { [key: string]: string }) => void;
  onAnalyze: () => void;
  onClear: () => void;
  wordCount: number;
  currentQuestion: APIQuestion;
  onChangeQuestion: () => void;
  isLoadingQuestion: boolean;
  isPlanningComplete: boolean;
  hasLastAnalysis: boolean;
  onToggleChat: () => void;
  isChatOpen: boolean;
}> = ({
  structuredEssay,
  onStructuredEssayChange,
  onAnalyze,
  onClear,
  wordCount,
  currentQuestion,
  onChangeQuestion,
  isPlanningComplete,
  hasLastAnalysis,
  isLoadingQuestion,
  onToggleChat,
  isChatOpen,
}) => (
  <main className="main-content">
    <div className="prompt-box">
      <div className="prompt-header">
        <h2>IELTS WRITING TASK 2</h2>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={onChangeQuestion} disabled={isLoadingQuestion}>
            {isLoadingQuestion ? 'Loading...' : 'Change Question'}
          </button>
        </div>
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
      {/* AI Coach Chat Button - Temporarily Disabled */}
      {/* <div className="chat-button-container">
        <button 
          className={`chat-button ${isChatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {isChatOpen ? 'Close AI Coach' : 'Chat with AI Coach'}
        </button>
      </div> */}
      
      <StructuredEssayEditor
        onEssayChange={onStructuredEssayChange}
        disabled={false}
      />
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
                  Use the planning sections below to organize your essay.
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

export default function HomePage() {
  const router = useRouter();
  const [structuredEssay, setStructuredEssay] = useState<{ [key: string]: string }>({});
  const [planningAnswers, setPlanningAnswers] = useState<PlanningAnswers>({
    typeOfEssay: '',
    hookSentence: '',
    thesisSentence: '',
    topicSentences: '',
    linkToThesis: '',
    conclusion: ''
  });
  const [analysisState, setAnalysisState] = useState<AnalysisState>('initial');
  const [currentQuestion, setCurrentQuestion] = useState<APIQuestion>({
    id: 1,
    question: "Loading question..."
  });
  const [isPlanningVisible, setIsPlanningVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load initial question from API
  useEffect(() => {
    const loadInitialQuestion = async () => {
      if (typeof window !== 'undefined') {
        const storedState = sessionStorage.getItem('writingState');
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState);
            setStructuredEssay(parsed.structuredEssay || {});
            setPlanningAnswers(parsed.planningAnswers || planningAnswers);
            setAnalysisState(parsed.analysisState || 'initial');
            if (parsed.currentQuestion && parsed.currentQuestion.id !== 1) {
              setCurrentQuestion(parsed.currentQuestion);
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved state:', e);
          }
        }
      }
      
      try {
        const question = await getRandomQuestion();
        setCurrentQuestion(question);
      } catch (error) {
        console.error('Failed to load initial question:', error);
      }
    };
    
    loadInitialQuestion();
  }, []);

  // Save state on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'writingState',
        JSON.stringify({
          structuredEssay,
          planningAnswers,
          currentQuestion,
          analysisState,
        })
      );
    }
  }, [structuredEssay, planningAnswers, currentQuestion, analysisState]);

  const handleAnalyze = async () => {
    if (wordCount === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to analyze this essay?\n\nThis will submit your essay for AI analysis and generate detailed IELTS band scores.'
    );
    if (!confirmed) return;

    setAnalysisState('loading');

    const finalEssayText = formatStructuredEssayForSubmission(structuredEssay);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/writing/analyze`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essay: finalEssayText,
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
              essay: finalEssayText,
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
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    setShowClearModal(false);
    setStructuredEssay({});
    setAnalysisState('initial');
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  const handleStructuredEssayChange = (essay: { [key: string]: string }) => {
    setStructuredEssay(essay);
  };

  const formatStructuredEssayForSubmission = (structuredEssay: { [key: string]: string }) => {
    const sections = ['introduction', 'body1', 'body2', 'body3', 'body4', 'body5', 'conclusion'];
    let formatted = '';
    
    sections.forEach(sectionId => {
      const content = structuredEssay[sectionId];
      if (content && content.trim()) {
        const sectionTitle = getSectionTitle(sectionId);
        formatted += `${sectionTitle}: ${content.trim()}\n\n`;
      }
    });
    
    return formatted.trim();
  };

  const getSectionTitle = (sectionId: string) => {
    switch (sectionId) {
      case 'introduction': return 'Introduction';
      case 'body1': return 'Body Paragraph 1';
      case 'body2': return 'Body Paragraph 2';
      case 'body3': return 'Body Paragraph 3';
      case 'body4': return 'Body Paragraph 4';
      case 'body5': return 'Body Paragraph 5';
      case 'conclusion': return 'Conclusion';
      default: return sectionId;
    }
  };

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleChangeQuestionClick = () => {
    setShowConfirmModal(true);
  };

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  };

  const handleConfirmChangeQuestion = async () => {
    setShowConfirmModal(false);
    setIsLoadingQuestion(true);
    
    const isConnected = await checkConnectivity();
    
    if (!isConnected) {
      alert('❌ Connection failed!\n\nUnable to connect to the server. Please check:\n• Your internet connection\n• Server status\n• Try again in a moment');
      setIsLoadingQuestion(false);
      return;
    }
    
    try {
      const newQuestion = await getRandomQuestion();
      
      setCurrentQuestion(newQuestion);
      setStructuredEssay({});
      setPlanningAnswers({
        typeOfEssay: '',
        hookSentence: '',
        thesisSentence: '',
        topicSentences: '',
        linkToThesis: '',
        conclusion: ''
      });
      setAnalysisState('initial');
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('writingState');
        sessionStorage.removeItem('lastAnalysis');
      }
      
      alert('✅ Connected successfully!\n\nNew question loaded.');
    } catch (error) {
      console.error('Failed to change question:', error);
      alert('❌ Failed to load new question!\n\nThe server is reachable but couldn\'t fetch a new question. Please try again.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleCancelChangeQuestion = () => {
    setShowConfirmModal(false);
  };

  const wordCount = useMemo(() => {
    const totalWords = Object.values(structuredEssay).reduce((total, content) => {
      if (!content.trim()) return total;
      return total + content.trim().split(/\s+/).length;
    }, 0);
    return totalWords;
  }, [structuredEssay]);

  const hasLastAnalysis = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastAnalysis') !== null;
    }
    return false;
  }, [analysisState]);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="app-main">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <MainContent
        structuredEssay={structuredEssay}
        onStructuredEssayChange={handleStructuredEssayChange}
        onAnalyze={handleAnalyze}
        onClear={handleClearClick}
        wordCount={wordCount}
        currentQuestion={currentQuestion}
        onChangeQuestion={handleChangeQuestionClick}
        isPlanningComplete={true}
        hasLastAnalysis={hasLastAnalysis}
        isLoadingQuestion={isLoadingQuestion}
        onToggleChat={handleToggleChat}
        isChatOpen={isChatOpen}
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

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed right-4 bottom-4 top-20 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-40 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">AI IELTS Coach</h3>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🤖</span>
                </div>
                <h4 className="font-semibold mb-2">AI Coach Available</h4>
                <p className="text-sm mb-4">Get personalized guidance for your IELTS essay</p>
                <button 
                  onClick={() => router.push('/writing/coach')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  Start Coaching Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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