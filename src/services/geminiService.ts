import { 
  UserProfile, 
  ConversationState, 
  EnhancedEssayPlan, 
  ConversationMode, 
  ConversationPhase,
  PlanningStatus 
} from '../types/coach';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Basic chat session interface
export interface ChatSession {
  chatId: string;
  sendMessage: (message: string) => Promise<{ response: string; planUpdates: any; nextState?: string }>;
}

// Enhanced chat session interface
export interface EnhancedChatSession {
  chatId: string;
  userProfile: UserProfile;
  conversationState: ConversationState;
  essayPlan: EnhancedEssayPlan;
  sendMessage: (message: string) => Promise<{
    response: string;
    planUpdates?: Partial<EnhancedEssayPlan>;
    nextSuggestions?: string[];
    conversationMode?: ConversationMode;
    progressUpdate?: {
      phase: string;
      completion: number;
      nextSteps: string[];
    };
    adaptiveHints?: string[];
  }>;
}

// Basic chat initialization
export const initChat = async (essayQuestion: string): Promise<ChatSession> => {
  try {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayQuestion })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to start chat`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to start chat session');
    }

    const { chatId, initialMessage } = data.data;

    return {
      chatId,
      sendMessage: async (message: string) => {
        const msgResponse = await fetch(`${API_BASE_URL}/${chatId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        if (!msgResponse.ok) {
          throw new Error(`HTTP ${msgResponse.status}: Failed to send message`);
        }

        const msgData = await msgResponse.json();
        
        if (!msgData.success) {
          throw new Error(msgData.error || 'Failed to send message');
        }

        return {
          response: msgData.data.response,
          planUpdates: msgData.data.planUpdates || {},
          nextState: msgData.data.nextState
        };
      }
    };
  } catch (error) {
    console.error('Error initializing chat:', error);
    throw new Error("Configuration Error: Unable to connect to chat service. Please ensure the backend is running.");
  }
};

// Enhanced chat initialization
export const initEnhancedChat = async (
  essayQuestion: string, 
  userProfile: UserProfile
): Promise<EnhancedChatSession> => {
  try {
    // Try enhanced endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/start-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayQuestion, userProfile })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Enhanced API response:', data);
        
        if (data.success) {
          const responseData = data.data || data;
          if (responseData?.chatId) {
            const { chatId, initialState, essayPlan } = responseData;
            return {
              chatId,
              userProfile,
              conversationState: initialState || createInitialConversationState(userProfile),
              essayPlan: essayPlan || createInitialEssayPlan(essayQuestion),
              sendMessage: createEnhancedSendMessage(chatId)
            };
          }
        }
      }
    } catch (enhancedError) {
      console.log('Enhanced endpoint not available, trying basic endpoint');
    }

    // Fallback to basic endpoint
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essayQuestion })
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback API response:', fallbackData);
        
        if (fallbackData.success) {
          const fallbackResponseData = fallbackData.data || fallbackData;
          if (fallbackResponseData?.chatId) {
            return createEnhancedSessionFromBasic(fallbackResponseData.chatId, essayQuestion, userProfile);
          }
        }
      }
    } catch (basicError) {
      console.log('Basic endpoint also failed');
    }

    // If both API calls fail, create a mock session for development
    console.log('Creating mock session for development');
    return createMockEnhancedSession(essayQuestion, userProfile);
  } catch (error) {
    console.error('Error initializing enhanced chat:', error);
    
    // More specific error messages based on the error type
    if (error instanceof TypeError && (error as TypeError).message.includes('fetch')) {
      throw new Error("Network Error: Cannot connect to backend server. Please ensure the backend is running on port 3002.");
    } else if (error instanceof TypeError && (error as TypeError).message.includes('destructure')) {
      throw new Error("API Error: Unexpected response format from server. Check backend logs.");
    } else if ((error as Error).message?.includes('HTTP')) {
      throw new Error(`Server Error: ${(error as Error).message}. Check if the backend is responding correctly.`);
    }
    
    throw new Error("Configuration Error: Unable to connect to chat service. Please ensure the backend is running.");
  }
};

// Create mock session for development (when backend is not available)
const createMockEnhancedSession = (
  essayQuestion: string,
  userProfile: UserProfile
): EnhancedChatSession => {
  const mockChatId = `mock_${Date.now()}`;
  
  return {
    chatId: mockChatId,
    userProfile,
    conversationState: createInitialConversationState(userProfile),
    essayPlan: createInitialEssayPlan(essayQuestion),
    sendMessage: createMockSendMessage(userProfile, essayQuestion)
  };
};

// Create enhanced session from basic session (fallback)
const createEnhancedSessionFromBasic = async (
  chatId: string,
  essayQuestion: string,
  userProfile: UserProfile
): Promise<EnhancedChatSession> => {
  return {
    chatId,
    userProfile,
    conversationState: createInitialConversationState(userProfile),
    essayPlan: createInitialEssayPlan(essayQuestion),
    sendMessage: createBasicSendMessage(chatId, userProfile)
  };
};

// Create initial conversation state
const createInitialConversationState = (userProfile: UserProfile): ConversationState => {
  const mode: ConversationMode = userProfile.confidence === 'completely-new' 
    ? 'discovery' 
    : userProfile.confidence === 'confident' 
    ? 'consultation' 
    : 'collaboration';

  return {
    phase: 'question-analysis' as ConversationPhase,
    userLevel: userProfile.confidence,
    conversationMode: mode,
    planningProgress: {
      hook: 'pending' as PlanningStatus,
      thesis: 'pending' as PlanningStatus,
      body1: 'pending' as PlanningStatus,
      body2: 'pending' as PlanningStatus,
      conclusion: 'pending' as PlanningStatus
    },
    adaptiveHints: [],
    sessionMetrics: {
      startTime: new Date(),
      messagesCount: 0,
      planningProgress: 0
    }
  };
};

// Create initial essay plan
const createInitialEssayPlan = (essayQuestion: string): EnhancedEssayPlan => {
  return {
    questionType: null,
    hook: null,
    thesis: null,
    topicSentence1: null,
    topicSentence2: null,
    conclusion: null,
    topic: extractTopicFromQuestion(essayQuestion),
    userView: undefined,
    bodyParagraphs: [],
    progress: 0,
    planningProgress: {
      hook: 'pending' as PlanningStatus,
      thesis: 'pending' as PlanningStatus,
      body1: 'pending' as PlanningStatus,
      body2: 'pending' as PlanningStatus,
      conclusion: 'pending' as PlanningStatus
    }
  };
};

// Extract topic from question for display
const extractTopicFromQuestion = (question: string): string => {
  // Simple topic extraction - could be enhanced with NLP
  if (question.toLowerCase().includes('technology')) return 'Technology';
  if (question.toLowerCase().includes('education')) return 'Education';
  if (question.toLowerCase().includes('environment')) return 'Environment';
  if (question.toLowerCase().includes('work') || question.toLowerCase().includes('job')) return 'Work & Career';
  return 'General Topic';
};

// Enhanced send message for new API
const createEnhancedSendMessage = (chatId: string) => {
  return async (message: string) => {
    const msgResponse = await fetch(`${API_BASE_URL}/${chatId}/message-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!msgResponse.ok) {
      throw new Error(`HTTP ${msgResponse.status}: Failed to send message`);
    }

    const msgData = await msgResponse.json();
    
    if (!msgData.success) {
      throw new Error(msgData.error || 'Failed to send message');
    }

    return {
      response: msgData.data.response,
      planUpdates: msgData.data.planUpdates || {},
      nextSuggestions: msgData.data.nextSuggestions || [],
      conversationMode: msgData.data.conversationMode,
      progressUpdate: msgData.data.progressUpdate,
      adaptiveHints: msgData.data.adaptiveHints || []
    };
  };
};

// Basic send message (fallback)
const createBasicSendMessage = (chatId: string, userProfile: UserProfile) => {
  return async (message: string) => {
    const msgResponse = await fetch(`${API_BASE_URL}/${chatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!msgResponse.ok) {
      throw new Error(`HTTP ${msgResponse.status}: Failed to send message`);
    }

    const msgData = await msgResponse.json();
    
    if (!msgData.success) {
      throw new Error(msgData.error || 'Failed to send message');
    }

    // Enhance basic response with adaptive features
    const enhancedResponse = enhanceBasicResponse(msgData.data, userProfile, message);

    return {
      response: enhancedResponse.response,
      planUpdates: enhancedResponse.planUpdates || {},
      nextSuggestions: enhancedResponse.nextSuggestions || [],
      conversationMode: enhancedResponse.conversationMode,
      progressUpdate: enhancedResponse.progressUpdate,
      adaptiveHints: enhancedResponse.adaptiveHints || []
    };
  };
};

// Enhance basic response with client-side intelligence
const enhanceBasicResponse = (basicData: any, userProfile: UserProfile, userMessage: string) => {
  const response = basicData.response;
  const planUpdates = basicData.planUpdates || {};
  
  // Generate adaptive suggestions based on user level
  const nextSuggestions = generateAdaptiveSuggestions(userProfile, userMessage, response);
  
  // Determine conversation mode
  const conversationMode: ConversationMode = userProfile.confidence === 'completely-new' 
    ? 'discovery' 
    : userProfile.confidence === 'confident' 
    ? 'consultation' 
    : 'collaboration';

  // Generate adaptive hints
  const adaptiveHints = generateAdaptiveHints(userProfile, userMessage, response);

  return {
    response,
    planUpdates,
    nextSuggestions,
    conversationMode,
    adaptiveHints,
    progressUpdate: {
      phase: 'collaborative-planning',
      completion: calculateProgressFromPlanUpdates(planUpdates),
      nextSteps: ['Continue building your essay structure']
    }
  };
};

// Generate suggestions based on user level
const generateAdaptiveSuggestions = (
  userProfile: UserProfile, 
  userMessage: string, 
  aiResponse: string
): string[] => {
  const suggestions: string[] = [];
  
  switch (userProfile.confidence) {
    case 'completely-new':
      suggestions.push(
        "Can you give me an example?",
        "I'm not sure I understand",
        "Could you explain that differently?"
      );
      break;
    case 'still-learning':
      suggestions.push(
        "That makes sense, what's next?",
        "Can you help me improve it?",
        "Is this on the right track?"
      );
      break;
    case 'getting-there':
      suggestions.push(
        "Let me try another approach",
        "How can I make this stronger?",
        "What alternatives do you suggest?"
      );
      break;
    case 'confident':
      suggestions.push(
        "I think I have a different perspective",
        "Let me build on that idea",
        "Can you quickly review this?"
      );
      break;
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

// Generate adaptive hints
const generateAdaptiveHints = (
  userProfile: UserProfile, 
  userMessage: string, 
  aiResponse: string
): string[] => {
  const hints: string[] = [];
  
  // Add hints based on user level
  if (userProfile.confidence === 'completely-new' && userMessage.length < 20) {
    hints.push("Try to be more specific in your responses - it helps me give better guidance.");
  }
  
  if (userProfile.confidence === 'confident' && aiResponse.includes('thesis')) {
    hints.push("Remember to make your thesis statement clear and arguable.");
  }
  
  return hints;
};

// Calculate progress from plan updates
const calculateProgressFromPlanUpdates = (planUpdates: any): number => {
  const completedFields = Object.values(planUpdates).filter(value => value !== null && value !== '').length;
  const totalFields = 5; // hook, thesis, body1, body2, conclusion
  return Math.round((completedFields / totalFields) * 100);
};

// Mock send message for development (when backend is not available)
const createMockSendMessage = (userProfile: UserProfile, essayQuestion: string) => {
  return async (message: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      'completely-new': `I can see you're just starting out with IELTS writing. Let's break down your question: "${essayQuestion}". What's the first thing that comes to mind when you read this?`,
      'still-learning': `Good thinking! For this question about "${essayQuestion}", let's work together to develop your ideas. What's your initial perspective on this topic?`,
      'getting-there': `I can see you're developing your skills well. Looking at "${essayQuestion}", what type of essay structure do you think would work best here?`,
      'confident': `Great approach! You seem confident with IELTS writing. For this question about "${essayQuestion}", what's your thesis statement going to be?`
    };

    const response = responses[userProfile.confidence] || responses['still-learning'];
    const suggestions = generateAdaptiveSuggestions(userProfile, message, response);
    
    return {
      response: response + "\n\n*Note: This is a mock response - backend server is not connected.*",
      planUpdates: {},
      nextSuggestions: suggestions,
      conversationMode: userProfile.confidence === 'completely-new' ? 'discovery' as ConversationMode : 'collaboration' as ConversationMode,
      progressUpdate: {
        phase: 'question-analysis',
        completion: 10,
        nextSteps: ['Analyze the question type', 'Identify key themes']
      },
      adaptiveHints: [`Try to be more specific about ${extractTopicFromQuestion(essayQuestion).toLowerCase()}`]
    };
  };
};