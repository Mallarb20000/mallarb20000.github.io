'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OnboardingFlow from './OnboardingFlow';
import AdaptiveChatInterface from './AdaptiveChatInterface';
import { 
  Message, 
  UserProfile, 
  ConversationState, 
  EnhancedEssayPlan, 
  ConversationPhase,
  PlanningStatus
} from '../../types/coach';
import { initEnhancedChat, EnhancedChatSession } from '../../services/geminiService';

interface EnhancedCoachInterfaceProps {
  essayQuestion: string;
}

const EnhancedCoachInterface: React.FC<EnhancedCoachInterfaceProps> = ({ essayQuestion }) => {
  // States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatSession, setChatSession] = useState<EnhancedChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize chat session after onboarding
  const initializeChatSession = useCallback(async (profile: UserProfile) => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const session = await initEnhancedChat(essayQuestion, profile);
      setChatSession(session);
      setUserProfile(profile);
      
      // Add initial welcome message based on user level
      const welcomeMessage = generateWelcomeMessage(profile, essayQuestion);
      setMessages([{
        id: Date.now().toString(),
        sender: 'ai',
        text: welcomeMessage,
        suggestions: getInitialSuggestions(profile)
      }]);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to start coaching session');
    } finally {
      setIsInitializing(false);
    }
  }, [essayQuestion]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!chatSession || !userProfile) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatSession.sendMessage(messageText);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.response,
        suggestions: response.nextSuggestions,
        planUpdates: response.planUpdates
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update essay plan if there are updates
      if (response.planUpdates) {
        updateEssayPlan(response.planUpdates);
      }
      
      // Update conversation state if provided
      if (response.progressUpdate) {
        updateConversationState(response.progressUpdate, response.conversationMode);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I apologize, but I'm having trouble processing your message right now. Could you please try again?"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatSession, userProfile]);

  // Update essay plan
  const updateEssayPlan = useCallback((planUpdates: Partial<EnhancedEssayPlan>) => {
    if (!chatSession) return;
    
    // Update the plan in the session
    Object.assign(chatSession.essayPlan, planUpdates);
    
    // Update planning progress based on what's been completed
    updatePlanningProgress(chatSession.essayPlan);
  }, [chatSession]);

  // Update planning progress
  const updatePlanningProgress = useCallback((plan: EnhancedEssayPlan) => {
    const progress = { ...plan.planningProgress };
    
    if (plan.hook && progress.hook === 'pending') {
      progress.hook = 'completed';
    }
    if (plan.thesis && progress.thesis === 'pending') {
      progress.thesis = 'completed';
    }
    if (plan.topicSentence1 && progress.body1 === 'pending') {
      progress.body1 = 'completed';
    }
    if (plan.topicSentence2 && progress.body2 === 'pending') {
      progress.body2 = 'completed';
    }
    if (plan.conclusion && progress.conclusion === 'pending') {
      progress.conclusion = 'completed';
    }
    
    plan.planningProgress = progress;
    
    // Calculate overall progress
    const completed = Object.values(progress).filter(status => status === 'completed').length;
    plan.progress = Math.round((completed / 5) * 100);
  }, []);

  // Update conversation state
  const updateConversationState = useCallback((
    progressUpdate: { phase: string; completion: number; nextSteps: string[] },
    conversationMode?: string
  ) => {
    if (!chatSession) return;
    
    chatSession.conversationState.sessionMetrics.messagesCount += 1;
    chatSession.conversationState.sessionMetrics.planningProgress = progressUpdate.completion;
    
    if (conversationMode) {
      chatSession.conversationState.conversationMode = conversationMode as any;
    }
  }, [chatSession]);

  // Show onboarding if user profile not set
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {isInitializing ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg text-gray-700">Setting up your coaching experience...</p>
          </div>
        ) : (
          <OnboardingFlow onComplete={initializeChatSession} />
        )}
      </div>
    );
  }

  // Show error state
  if (error && !chatSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Connection Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show main interface
  if (chatSession && userProfile) {
    return (
      <AdaptiveChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        conversationState={chatSession.conversationState}
        essayPlan={chatSession.essayPlan}
        userProfile={userProfile}
        essayQuestion={essayQuestion}
      />
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-gray-700">Loading your coaching session...</p>
      </div>
    </div>
  );
};

// Helper functions
const generateWelcomeMessage = (profile: UserProfile, essayQuestion: string): string => {
  const level = profile.confidence.replace('-', ' ');

  type MessageLevel = 'completely new' | 'still learning' | 'getting there' | 'confident';
  const messages: Record<MessageLevel, string> = {
    'completely new': `Hello! I'm excited to help you with your first IELTS writing experience. Don't worry - we'll take this step by step, and I'll guide you through everything you need to know.

Let's start by looking at this question together. I can see it's about ${extractSimpleTopic(essayQuestion)}. What's your first reaction when you read this question? Don't worry about having the "right" answer - I just want to understand your initial thoughts.`,
    
    'still learning': `Hi there! I can see you're still building your IELTS writing skills, and that's perfectly normal. We'll work together to create a strong essay plan.

Looking at this question about ${extractSimpleTopic(essayQuestion)}, what comes to mind? Do you have any initial thoughts or opinions about this topic?`,
    
    'getting there': `Hello! Great to see you're developing your IELTS writing skills. I'm here to help you refine your approach and make your essays even stronger.

This question is about ${extractSimpleTopic(essayQuestion)}. What's your take on this topic? I'd love to hear your perspective so we can build a compelling argument together.`,
    
    'confident': `Hi! I can see you're confident with IELTS writing - that's excellent. I'm here to help you polish your approach and ensure you're maximizing your potential.

Looking at this ${extractSimpleTopic(essayQuestion)} question, what's your initial analysis? What type of question do you think this is, and what's your stance on the topic?`
  };

  // Use type assertion to safely index messages
  return messages[level as MessageLevel] || messages['still learning'];
};

const extractSimpleTopic = (question: string): string => {
  if (question.toLowerCase().includes('technology')) return 'technology';
  if (question.toLowerCase().includes('education')) return 'education';
  if (question.toLowerCase().includes('environment')) return 'environmental issues';
  if (question.toLowerCase().includes('work') || question.toLowerCase().includes('job')) return 'work and career';
  if (question.toLowerCase().includes('health')) return 'health';
  return 'this important topic';
};

const getInitialSuggestions = (profile: UserProfile): string[] => {
  switch (profile.confidence) {
    case 'completely-new':
      return [
        "I'm not sure where to start",
        "Can you explain what I should look for?",
        "This seems complicated"
      ];
    case 'still-learning':
      return [
        "I have some thoughts but need guidance",
        "Can you help me organize my ideas?",
        "I think I understand but want to check"
      ];
    case 'getting-there':
      return [
        "I have an opinion on this topic",
        "I can see both sides of this issue",
        "Let me share my perspective"
      ];
    case 'confident':
      return [
        "I can identify the question type",
        "I have a clear stance on this",
        "Let's dive into the analysis"
      ];
    default:
      return [];
  }
};

export default EnhancedCoachInterface;