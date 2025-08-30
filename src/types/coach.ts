export enum AppState {
  WELCOME = 'WELCOME',
  QUESTION_TYPE = 'QUESTION_TYPE',
  HOOK = 'HOOK',
  THESIS = 'THESIS',
  TOPIC_SENTENCE_1 = 'TOPIC_SENTENCE_1',
  TOPIC_SENTENCE_2 = 'TOPIC_SENTENCE_2',
  TOPIC_SENTENCES = 'TOPIC_SENTENCES',
  CONCLUSION = 'CONCLUSION',
  COMPLETE = 'COMPLETE'
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  planUpdates?: Partial<EnhancedEssayPlan>;
}

export interface EssayPlan {
  questionType: string | null;
  hook: string | null;
  thesis: string | null;
  topicSentence1: string | null;
  topicSentence2: string | null;
  conclusion: string | null;
  topicSentences?: string[];
}

// Enhanced types for new interface
export type UserLevel = 'confident' | 'getting-there' | 'still-learning' | 'completely-new';
export type ConversationMode = 'discovery' | 'collaboration' | 'consultation';
export type ConversationPhase = 'onboarding' | 'question-analysis' | 'collaborative-planning' | 'writing-assistance' | 'review';
export type PlanningStatus = 'pending' | 'in-progress' | 'completed';

export interface UserProfile {
  confidence: UserLevel;
  preferredPace?: 'fast' | 'medium' | 'slow';
  previousSessions?: number;
}

export interface EnhancedEssayPlan extends EssayPlan {
  topic?: string;
  userView?: string;
  bodyParagraphs?: {
    topicSentence?: string;
    mainPoints?: string[];
    examples?: string[];
  }[];
  progress: number;
  planningProgress: {
    hook: PlanningStatus;
    thesis: PlanningStatus;
    body1: PlanningStatus;
    body2: PlanningStatus;
    conclusion: PlanningStatus;
  };
}

export interface ConversationState {
  phase: ConversationPhase;
  userLevel: UserLevel;
  conversationMode: ConversationMode;
  planningProgress: {
    hook: PlanningStatus;
    thesis: PlanningStatus;
    body1: PlanningStatus;
    body2: PlanningStatus;
    conclusion: PlanningStatus;
  };
  adaptiveHints: string[];
  sessionMetrics: {
    startTime: Date;
    messagesCount: number;
    planningProgress: number;
  };
}

export interface ChatSession {
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