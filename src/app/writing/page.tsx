'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './writing.css';

// --- TYPE DEFINITIONS ---
type AnalysisState = 'initial' | 'loading' | 'analyzed';

interface Question {
  id: number;
  question: string;
}

interface PlanningAnswers {
  typeOfEssay: string;
  hookSentence: string;
  thesisSentence: string;
  topicSentences: string;
  linkToThesis: string;
  conclusion: string;
}

// Sample IELTS questions
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question:
      'Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your own opinion.',
  },
  {
    id: 2,
    question:
      'In many countries, the amount of crime is increasing. What do you think are the main causes of crime? How can we deal with those causes?',
  },
  {
    id: 3,
    question:
      'Some people say that advertising encourages us to buy things that we really do not need. Others say that advertisements tell us about new products that may improve our lives. Which viewpoint do you agree with?',
  },
];

// --- LAYOUT COMPONENTS ---
const MainContent: React.FC<{
  essayText: string;
  onEssayChange: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  wordCount: number;
  currentQuestion: Question;
  onChangeQuestion: () => void;
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
}) => (
  <main className="main-content">
    <div className="prompt-box">
      <div className="prompt-header">
        <h2>IELTS WRITING TASK 2</h2>
        <button className="btn btn-outline" onClick={onChangeQuestion}>
          Change Question
        </button>
      </div>
      <p>{currentQuestion.question}</p>
      <div className="editor-actions" style={{ marginTop: '1rem' }}>
        <span className="word-count">{wordCount} words</span>
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={wordCount === 0}
        >
          Analyze Essay
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          Clear
        </button>
        {hasLastAnalysis && (
          <button
            className="btn btn-outline"
            onClick={() => window.open('/writing/report', '_blank')}
          >
            View Last Report
          </button>
        )}
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
  const [currentQuestion, setCurrentQuestion] = useState<Question>(SAMPLE_QUESTIONS[0])
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null)
  const [isPlanningVisible, setIsPlanningVisible] = useState(true)

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedState = sessionStorage.getItem('writingState');
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState);
          setEssayText(parsed.essayText || '');
          setPlanningAnswers(parsed.planningAnswers || planningAnswers);
          setCurrentQuestion(parsed.currentQuestion || SAMPLE_QUESTIONS[0]);
          setAnalysisState(parsed.analysisState || 'initial');
        } catch (e) {
          console.error('Failed to parse saved state:', e);
        }
      }
     
    }
  }, []);

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

  const handleClear = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your essay?\n\nThis will delete all your written content and cannot be undone.'
    );
    if (confirmed) {
      setEssayText('');
      setAnalysisState('initial');
    }
  };

  const handleChangeQuestion = () => {
    setCurrentQuestion(SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)])
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
        onClear={handleClear}
        wordCount={wordCount}
        currentQuestion={currentQuestion}
        onChangeQuestion={handleChangeQuestion}
        isPlanningComplete={isPlanningComplete}
        hasLastAnalysis={hasLastAnalysis}
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
    </div>
  );
}
