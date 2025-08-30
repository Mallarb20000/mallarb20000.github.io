'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState, EssayPlan } from '../../types/coach';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  appState: AppState;
  essayPlan: EssayPlan;
}

const COACHING_STEPS = [
  { id: 1, name: 'Question Type', description: 'Identify the type of IELTS question' },
  { id: 2, name: 'Hook Sentence', description: 'Create an engaging opening' },
  { id: 3, name: 'Thesis Statement', description: 'Develop your main argument' },
  { id: 4, name: 'Topic Sentences', description: 'Structure your body paragraphs' },
  { id: 5, name: 'Conclusion', description: 'Summarize your essay plan' }
];

const QUESTION_TYPES = [
  'Opinion (Agree or Disagree)',
  'Discussion (Discuss both views and give your opinion)',
  'Problem and Solution',
  'Advantages and Disadvantages',
  'Two-Part Question (Direct questions)'
];

const getCurrentStep = (appState: AppState): number => {
  switch (appState) {
    case AppState.QUESTION_TYPE: return 1;
    case AppState.HOOK: return 2;
    case AppState.THESIS: return 3;
    case AppState.TOPIC_SENTENCES: return 4;
    case AppState.CONCLUSION: return 5;
    default: return 0;
  }
};

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {COACHING_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-500 text-white ring-4 ring-blue-200' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  `}>
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 max-w-20">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < COACHING_STEPS.length - 1 && (
                  <div className={`
                    h-1 w-16 mx-4 mt-[-20px]
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const QuestionDisplay: React.FC<{ question?: string }> = ({ question }) => {
  if (!question) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">Q</span>
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">IELTS Writing Task 2 Question:</h3>
          <p className="text-blue-800 leading-relaxed">{question}</p>
        </div>
      </div>
    </div>
  );
};

const PlanSidebar: React.FC<{ essayPlan: EssayPlan }> = ({ essayPlan }) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      <h3 className="font-bold text-gray-900 mb-4">Your Essay Plan</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Question Type</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-12 flex items-center">
            {essayPlan.questionType ? (
              <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                {essayPlan.questionType}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">Not selected yet</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Hook Sentence</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-16">
            {essayPlan.hook ? (
              <p className="text-sm text-gray-900">{essayPlan.hook}</p>
            ) : (
              <span className="text-gray-400 text-sm">To be developed</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Thesis Statement</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-16">
            {essayPlan.thesis ? (
              <p className="text-sm text-gray-900">{essayPlan.thesis}</p>
            ) : (
              <span className="text-gray-400 text-sm">To be developed</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Topic Sentence 1</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-16">
            {essayPlan.topicSentences?.[0] ? (
              <p className="text-sm text-gray-900">{essayPlan.topicSentences[0]}</p>
            ) : (
              <span className="text-gray-400 text-sm">To be developed</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Topic Sentence 2</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-16">
            {essayPlan.topicSentences?.[1] ? (
              <p className="text-sm text-gray-900">{essayPlan.topicSentences[1]}</p>
            ) : (
              <span className="text-gray-400 text-sm">To be developed</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Conclusion Summary</label>
          <div className="mt-1 p-3 bg-white rounded-lg border min-h-16">
            {essayPlan.conclusion ? (
              <p className="text-sm text-gray-900">{essayPlan.conclusion}</p>
            ) : (
              <span className="text-gray-400 text-sm">To be developed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isCoach = message.sender === 'ai';
  
  return (
    <div className={`flex gap-4 ${isCoach ? 'justify-start' : 'justify-end'} mb-6`}>
      {isCoach && (
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
      )}
      
      <div className={`max-w-lg p-4 rounded-lg ${
        isCoach 
          ? 'bg-white border border-gray-200 shadow-sm' 
          : 'bg-blue-500 text-white'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>

      {!isCoach && (
        <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">You</span>
        </div>
      )}
    </div>
  );
};

const QuestionTypeSelector: React.FC<{ onSelect: (type: string) => void; disabled: boolean }> = ({ onSelect, disabled }) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6">
      <div className="max-w-2xl mx-auto">
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          Choose the question type:
        </h4>
        <div className="grid gap-3">
          {QUESTION_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              disabled={disabled}
              className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium text-gray-900">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  appState, 
  essayPlan 
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentStep = getCurrentStep(appState);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showQuestionTypeOptions = appState === AppState.QUESTION_TYPE && !essayPlan.questionType;
  const isInputDisabled = isLoading || showQuestionTypeOptions;

  // Get the original IELTS question from messages (first user message)
  const ieltsQuestion = messages.find(msg => msg.sender === 'user')?.text;

  return (
    <div className="flex h-screen bg-gray-100">
      <PlanSidebar essayPlan={essayPlan} />
      
      <div className="flex-1 flex flex-col">
        <StepIndicator currentStep={currentStep} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <QuestionDisplay question={ieltsQuestion} />
            
            <div className="space-y-4">
              {messages.slice(1).map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="max-w-lg p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-gray-600 ml-2">AI Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showQuestionTypeOptions && (
          <QuestionTypeSelector onSelect={onSendMessage} disabled={isLoading} />
        )}

        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isInputDisabled ? "Please select an option above..." : "Type your response..."}
                disabled={isInputDisabled}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isInputDisabled || !inputText.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;