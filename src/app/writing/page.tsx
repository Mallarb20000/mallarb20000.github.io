'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomQuestion, Question as APIQuestion } from '../../services/questionsAPI';
import Modal from '../../components/Modal';
import StructuredEssayEditor from '../../components/StructuredEssayEditor';
import ThemeToggle from '../../components/ThemeToggle';
import EnhancedCoachInterface from '../../components/coach/EnhancedCoachInterface';
import PlanSummary from '../../components/coach/PlanSummary';
import ChatInterface from '../../components/coach/ChatInterface';
import { initChat, ChatSession } from '../../services/geminiService';
import { AppState, Message, EssayPlan } from '../../types/coach';
import './writing.css';
import '../../components/StructuredEssayEditor.css';

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

type AppPhase = 'coach' | 'writing';

// Helper function to parse AI responses for state and plan updates
const parseAIResponse = (text: string) => {
    let cleanText = text;
    let nextState: AppState | null = null;
    const planUpdates: Partial<EssayPlan> = {};

    const stateMatch = text.match(/\[STATE_UPDATE:(\w+)\]/);
    if (stateMatch?.[1]) {
        const newStateKey = stateMatch[1] as keyof typeof AppState;
        if (AppState[newStateKey]) {
            nextState = AppState[newStateKey];
        }
        cleanText = cleanText.replace(stateMatch[0], '');
    }

    const planMatches = [...text.matchAll(/\[PLAN_UPDATE:(\w+)\]([^\[]+)/g)];
    planMatches.forEach(match => {
        const key = match[1] as keyof EssayPlan;
        const value = match[2].trim();
        if (Object.keys(newPlanTemplate).includes(key)) {
            (planUpdates as any)[key] = value;
        }
        cleanText = cleanText.replace(match[0], '');
    });

    return { cleanText: cleanText.trim(), nextState, planUpdates };
};

const newPlanTemplate: EssayPlan = {
    questionType: null,
    hook: null,
    thesis: null,
    topicSentence1: null,
    topicSentence2: null,
    conclusion: null,
};


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
      {/* Chat Button */}
      <div className="chat-button-container">
        <button className="chat-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat with AI Coach
        </button>
      </div>
      
      <StructuredEssayEditor
        onEssayChange={onStructuredEssayChange}
        disabled={!isPlanningComplete}
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
  const [structuredEssay, setStructuredEssay] = useState<{ [key: string]: string }>({});
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

  // Coach phase states
  const [appPhase, setAppPhase] = useState<AppPhase>('coach');
  const [essayQuestion, setEssayQuestion] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [messagesByState, setMessagesByState] = useState<Partial<Record<AppState, Message[]>>>({});
  const [essayPlan, setEssayPlan] = useState<EssayPlan>(newPlanTemplate);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const chatSession = useRef<ChatSession | null>(null);

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
          structuredEssay,
          planningAnswers,
          currentQuestion,
          analysisState,
        })
      );
    }
  }, [structuredEssay, planningAnswers, currentQuestion, analysisState]);

  // Coach conversation starter
  useEffect(() => {
    const startConversation = async (question: string) => {
      setIsCoachLoading(true);
      setAppState(AppState.QUESTION_TYPE);

      try {
        chatSession.current = await initChat(question);
        
        const aiMessageId = `ai-${Date.now()}`;
        
        setMessagesByState(prev => ({
          ...prev,
          [AppState.QUESTION_TYPE]: [{ 
            id: aiMessageId, 
            sender: 'ai', 
            text: 'Hello! I\'m your AI IELTS Writing Coach. Let\'s start by identifying the question type from the options below.' 
          }]
        }));

      } catch (error) {
        console.error("Error starting conversation:", error);
        if (error instanceof Error) {
          setInitError(error.message);
        } else {
          setInitError("An unknown error occurred during initialization.");
        }
      } finally {
        setIsCoachLoading(false);
      }
    };

    if (essayQuestion && appState === AppState.WELCOME && !chatSession.current && appPhase === 'coach') {
      startConversation(essayQuestion);
    }
  }, [essayQuestion, appState, appPhase]);

  // Coach message handler
  const handleSendMessage = async (text: string) => {
    if (!chatSession.current || isCoachLoading) return;

    setIsCoachLoading(true);
    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text };
    const aiMessageId = `ai-${Date.now()}`;

    setMessagesByState(prev => ({
      ...prev,
      [appState]: [
        ...(prev[appState] || []),
        userMessage,
      ]
    }));
    
    try {
      const result = await chatSession.current.sendMessage(text);
      
      setMessagesByState(prev => ({
        ...prev,
        [appState]: [...(prev[appState] || []), { id: aiMessageId, sender: 'ai', text: '' }]
      }));

      const { response: fullResponseText, planUpdates: directPlanUpdates, nextState: directNextState } = result;

      const { cleanText: rawCleanText, nextState: parsedNextState, planUpdates: parsedPlanUpdates } = parseAIResponse(fullResponseText);
      
      const finalPlanUpdates = { ...parsedPlanUpdates, ...directPlanUpdates };
      const finalNextState = directNextState || parsedNextState;

      const cleanText = rawCleanText.trim() === ''
        ? "I'm sorry, I seem to have lost my train of thought. Could you please try sending your last message again?"
        : rawCleanText;

      // Fallback logic: If AI correctly identifies question type but doesn't provide PLAN_UPDATE tag
      if (appState === AppState.QUESTION_TYPE && !essayPlan.questionType && 
          (cleanText.includes('Exactly! Well done') || cleanText.includes('Correct!')) &&
          cleanText.includes('ready to write the hook')) {
        
        // Try to extract question type from AI response
        const questionTypePatterns = [
          /Opinion \(Agree or Disagree\)/i,
          /Discussion \(Discuss both views and give your opinion\)/i,
          /Problem and Solution/i,
          /Advantages and Disadvantages/i,
          /Two-Part Question \(Direct questions\)/i
        ];
        
        for (const pattern of questionTypePatterns) {
          const match = cleanText.match(pattern);
          if (match) {
            finalPlanUpdates.questionType = match[0];
            console.log('Fallback: Detected question type from AI response:', match[0]);
            break;
          }
        }
      }

      if (Object.keys(finalPlanUpdates).length > 0) {
        setEssayPlan(prev => {
          const newPlan = { ...prev, ...finalPlanUpdates };
          
          // Auto-populate planning answers from AI coach
          if (newPlan.questionType && !planningAnswers.typeOfEssay) {
            setPlanningAnswers(prev => ({ ...prev, typeOfEssay: newPlan.questionType || '' }));
          }
          if (newPlan.hook && !planningAnswers.hookSentence) {
            setPlanningAnswers(prev => ({ ...prev, hookSentence: newPlan.hook || '' }));
          }
          if (newPlan.thesis && !planningAnswers.thesisSentence) {
            setPlanningAnswers(prev => ({ ...prev, thesisSentence: newPlan.thesis || '' }));
          }
          if ((newPlan.topicSentence1 || newPlan.topicSentence2) && !planningAnswers.topicSentences) {
            const topics = [newPlan.topicSentence1, newPlan.topicSentence2].filter(Boolean).join('\n\n');
            setPlanningAnswers(prev => ({ ...prev, topicSentences: topics }));
          }
          if (newPlan.conclusion && !planningAnswers.conclusion) {
            setPlanningAnswers(prev => ({ ...prev, conclusion: newPlan.conclusion || '' }));
          }
          
          return newPlan;
        });
      }

      // Check if coach is complete and transition to writing
      if (finalNextState === AppState.COMPLETE) {
        setAppPhase('writing');
        setCurrentQuestion({ id: Date.now(), question: essayQuestion || 'Custom question' });
        return;
      }

      if (rawCleanText.trim() === '' && finalNextState) {
        setMessagesByState(prev => {
          const currentMessages = (prev[appState] || []).map(msg =>
            msg.id === aiMessageId ? { ...msg, text: cleanText } : msg
          );
          return { ...prev, [appState]: currentMessages };
        });
      } else if (finalNextState) {
        setMessagesByState(prev => {
          const oldStateMessages = (prev[appState] || []).filter(msg => msg.id !== aiMessageId);
          return { ...prev, [appState]: oldStateMessages };
        });
        setAppState(finalNextState as AppState);
        setMessagesByState(prev => ({
          ...prev,
          [finalNextState]: [{ id: `ai-new-${Date.now()}`, sender: 'ai', text: cleanText }]
        }));
      } else {
        setMessagesByState(prev => {
          const currentMessages = (prev[appState] || []).map(msg =>
            msg.id === aiMessageId ? { ...msg, text: cleanText } : msg
          );
          return { ...prev, [appState]: currentMessages };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessagesByState(prev => {
        const currentMessages = (prev[appState] || []).map(msg =>
          msg.id === aiMessageId ? { ...msg, text: 'An error occurred. Please try again.' } : msg
        );
        return { ...prev, [appState]: currentMessages };
      });
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleCoachStart = (question: string) => {
    setEssayQuestion(question);
  };

  const handleAnalyze = async () => {
    if (wordCount === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to analyze this essay?\n\nThis will submit your essay for AI analysis and generate detailed IELTS band scores.'
    );
    if (!confirmed) return;

    setAnalysisState('loading');

    // Format structured essay for submission
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
    setShowClearModal(true)
  }

  const handleConfirmClear = () => {
    setShowClearModal(false)
    setStructuredEssay({})
    setAnalysisState('initial')
  }

  const handleCancelClear = () => {
    setShowClearModal(false)
  }


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

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  const handleChangeQuestionClick = () => {
    setShowConfirmModal(true)
  }

  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.error('Connectivity check failed:', error)
      return false
    }
  }

  const handleConfirmChangeQuestion = async () => {
    setShowConfirmModal(false)
    setIsLoadingQuestion(true)
    
    // Check connectivity first
    const isConnected = await checkConnectivity()
    
    if (!isConnected) {
      alert('❌ Connection failed!\n\nUnable to connect to the server. Please check:\n• Your internet connection\n• Server status\n• Try again in a moment')
      setIsLoadingQuestion(false)
      return
    }
    
    try {
      // Get new question
      const newQuestion = await getRandomQuestion()
      
      // Reset everything
      setCurrentQuestion(newQuestion)
      setStructuredEssay({})
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
      
      // Show success feedback
      alert('✅ Connected successfully!\n\nNew question loaded.')
    } catch (error) {
      console.error('Failed to change question:', error)
      alert('❌ Failed to load new question!\n\nThe server is reachable but couldn\'t fetch a new question. Please try again.')
    } finally {
      setIsLoadingQuestion(false)
    }
  }

  const handleCancelChangeQuestion = () => {
    setShowConfirmModal(false)
  }

  const wordCount = useMemo(() => {
    const totalWords = Object.values(structuredEssay).reduce((total, content) => {
      if (!content.trim()) return total;
      return total + content.trim().split(/\s+/).length;
    }, 0);
    return totalWords;
  }, [structuredEssay]);

  const isPlanningComplete = useMemo(() => {
    return Object.values(planningAnswers).every(answer => answer.trim().length > 0);
  }, [planningAnswers]);

  const hasLastAnalysis = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastAnalysis') !== null;
    }
    return false;
  }, [analysisState]);
  

  // Show error state
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 text-red-700 dark:text-red-300">
        <div className="w-full max-w-2xl p-8 mx-4 space-y-4 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold">Initialization Error</h1>
          <p className="text-base">The application could not start due to a configuration issue.</p>
          <pre className="p-4 mt-2 text-sm text-left bg-red-100 dark:bg-gray-700 dark:text-red-200 rounded-lg whitespace-pre-wrap font-mono">
            {initError}
          </pre>
          <p className="pt-2 text-sm text-gray-600 dark:text-gray-400">
            This application expects the Gemini API key to be available as an <code>API_KEY</code> environment variable in the execution context.
          </p>
        </div>
      </div>
    );
  }

  // Show coach interface first
  if (appPhase === 'coach') {
    if (!essayQuestion) {
      // Use the new beautiful question selector from our coach page
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl text-white">🤖</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI IELTS Writing Coach
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get personalized, adaptive guidance for your IELTS Writing Task 2 essay
            </p>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <button
                onClick={() => window.location.href = '/writing/coach'}
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Start with AI Coach →
              </button>
              <p className="text-sm text-gray-500 mt-4">
                ✨ New adaptive interface that adjusts to your skill level
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <EnhancedCoachInterface essayQuestion={essayQuestion} />;
  }

  // Show writing interface after coach is complete
  return (
    <div className="app-main">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Coach Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setAppPhase('coach')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          ← Back to Coach
        </button>
      </div>
      
      <MainContent
        structuredEssay={structuredEssay}
        onStructuredEssayChange={handleStructuredEssayChange}
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
