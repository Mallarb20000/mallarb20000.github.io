'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, EnhancedEssayPlan, ConversationState, UserProfile } from '../../types/coach';

interface AdaptiveChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  conversationState: ConversationState;
  essayPlan: EnhancedEssayPlan;
  userProfile: UserProfile;
  essayQuestion?: string;
}

const PlanningCanvas: React.FC<{ essayPlan: EnhancedEssayPlan }> = ({ essayPlan }) => {
  const getStatusColor = (status: 'pending' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'in-progress': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-500';
    }
  };

  const getStatusIcon = (status: 'pending' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      default: return '⏳';
    }
  };

  const progressPercentage = Math.round(essayPlan.progress || 0);

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2">Essay Blueprint</h3>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">{progressPercentage}%</span>
        </div>
      </div>

      {essayPlan.topic && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Topic</h4>
          <p className="text-sm text-blue-800">{essayPlan.topic}</p>
          {essayPlan.userView && (
            <>
              <h4 className="font-semibold text-blue-900 mt-3 mb-1">Your View</h4>
              <p className="text-sm text-blue-800">{essayPlan.userView}</p>
            </>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(essayPlan.planningProgress.hook)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(essayPlan.planningProgress.hook)}</span>
            <label className="font-medium">Hook Sentence</label>
          </div>
          <div className="text-sm">
            {essayPlan.hook ? (
              <p className="leading-relaxed">{essayPlan.hook}</p>
            ) : (
              <span className="italic">To be developed together</span>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getStatusColor(essayPlan.planningProgress.thesis)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(essayPlan.planningProgress.thesis)}</span>
            <label className="font-medium">Thesis Statement</label>
          </div>
          <div className="text-sm">
            {essayPlan.thesis ? (
              <p className="leading-relaxed">{essayPlan.thesis}</p>
            ) : (
              <span className="italic">To be developed together</span>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getStatusColor(essayPlan.planningProgress.body1)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(essayPlan.planningProgress.body1)}</span>
            <label className="font-medium">Body Paragraph 1</label>
          </div>
          <div className="text-sm">
            {essayPlan.topicSentences?.[0] || essayPlan.topicSentence1 ? (
              <p className="leading-relaxed">
                {essayPlan.topicSentences?.[0] || essayPlan.topicSentence1}
              </p>
            ) : (
              <span className="italic">To be developed together</span>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getStatusColor(essayPlan.planningProgress.body2)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(essayPlan.planningProgress.body2)}</span>
            <label className="font-medium">Body Paragraph 2</label>
          </div>
          <div className="text-sm">
            {essayPlan.topicSentences?.[1] || essayPlan.topicSentence2 ? (
              <p className="leading-relaxed">
                {essayPlan.topicSentences?.[1] || essayPlan.topicSentence2}
              </p>
            ) : (
              <span className="italic">To be developed together</span>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getStatusColor(essayPlan.planningProgress.conclusion)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getStatusIcon(essayPlan.planningProgress.conclusion)}</span>
            <label className="font-medium">Conclusion</label>
          </div>
          <div className="text-sm">
            {essayPlan.conclusion ? (
              <p className="leading-relaxed">{essayPlan.conclusion}</p>
            ) : (
              <span className="italic">To be developed together</span>
            )}
          </div>
        </div>
      </div>

      {essayPlan.progress === 100 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-lg">🎉</span>
            <span className="font-semibold">Plan Complete!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your essay structure is ready for writing.
          </p>
        </div>
      )}
    </div>
  );
};

const QuestionDisplay: React.FC<{ question?: string }> = ({ question }) => {
  if (!question) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">Q</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">IELTS Writing Task 2</h3>
          <p className="text-blue-800 leading-relaxed text-base">{question}</p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ 
  message: Message; 
  userProfile: UserProfile;
  onSuggestionClick?: (suggestion: string) => void;
}> = ({ message, userProfile, onSuggestionClick }) => {
  const isCoach = message.sender === 'ai';
  
  return (
    <div className={`flex gap-4 ${isCoach ? 'justify-start' : 'justify-end'} mb-6`}>
      {isCoach && (
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">🤖</span>
        </div>
      )}
      
      <div className={`max-w-2xl ${isCoach ? 'flex-1' : ''}`}>
        <div className={`p-4 rounded-2xl ${isCoach 
          ? 'bg-white border border-gray-200 shadow-sm' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
        
        {/* Suggestions for AI messages */}
        {isCoach && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-sm text-blue-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isCoach && (
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">👤</span>
        </div>
      )}
    </div>
  );
};

const ConversationHeader: React.FC<{ 
  conversationState: ConversationState;
  userProfile: UserProfile;
}> = ({ conversationState, userProfile }) => {
  const getPhaseTitle = () => {
    switch (conversationState.phase) {
      case 'onboarding': return 'Getting to know you';
      case 'question-analysis': return 'Understanding the question together';
      case 'collaborative-planning': return 'Building your essay plan';
      case 'writing-assistance': return 'Writing support';
      case 'review': return 'Final review';
      default: return "Let's work together";
    }
  };

  const getModeDescription = () => {
    switch (conversationState.conversationMode) {
      case 'discovery': return 'Exploring ideas step by step';
      case 'collaboration': return 'Working together to refine';
      case 'consultation': return 'Quick guidance and feedback';
      default: return 'Adaptive coaching';
    }
  };

  const getConfidenceBadge = () => {
    const colors = {
      'confident': 'bg-green-100 text-green-800',
      'getting-there': 'bg-blue-100 text-blue-800',
      'still-learning': 'bg-yellow-100 text-yellow-800',
      'completely-new': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[userProfile.confidence]}`}>
        {userProfile.confidence.replace('-', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {getPhaseTitle()}
          </h2>
          <p className="text-sm text-gray-600">
            {getModeDescription()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getConfidenceBadge()}
          <div className="text-sm text-gray-500">
            {conversationState.sessionMetrics.messagesCount} messages
          </div>
        </div>
      </div>
    </div>
  );
};

const AdaptiveChatInterface: React.FC<AdaptiveChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  conversationState,
  essayPlan,
  userProfile,
  essayQuestion
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const getPlaceholder = () => {
    if (isLoading) return "AI is thinking...";
    
    switch (conversationState.conversationMode) {
      case 'discovery':
        return "Share your thoughts - there's no wrong answer...";
      case 'collaboration':
        return "Let's work on this together...";
      case 'consultation':
        return "What would you like to focus on?";
      default:
        return "Type your response...";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <PlanningCanvas essayPlan={essayPlan} />
      
      <div className="flex-1 flex flex-col">
        <ConversationHeader 
          conversationState={conversationState} 
          userProfile={userProfile}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {essayQuestion && (
              <QuestionDisplay question={essayQuestion} />
            )}
            
            <div className="space-y-4">
              {messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  userProfile={userProfile}
                  onSuggestionClick={handleSuggestionClick}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">🤖</span>
                  </div>
                  <div className="max-w-lg p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Send
              </button>
            </div>
            
            {conversationState.adaptiveHints.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Hint:</strong> {conversationState.adaptiveHints[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveChatInterface;