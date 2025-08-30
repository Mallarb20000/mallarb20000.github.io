'use client';

import React, { useState } from 'react';
import { UserProfile, UserLevel } from '../../types/coach';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  className?: string;
}

const CONFIDENCE_LEVELS = [
  {
    id: 'confident' as UserLevel,
    title: 'Confident',
    description: 'I feel good about IELTS writing and just need some guidance',
    icon: '🎯',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'getting-there' as UserLevel,
    title: 'Getting there',
    description: 'I have some experience but want to improve my approach',
    icon: '📈',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'still-learning' as UserLevel,
    title: 'Still learning',
    description: 'I know the basics but need help with essay structure',
    icon: '📚',
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
  },
  {
    id: 'completely-new' as UserLevel,
    title: 'Completely new',
    description: 'This is my first time with IELTS writing - guide me through everything',
    icon: '🌱',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, className = '' }) => {
  const [selectedLevel, setSelectedLevel] = useState<UserLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLevelSelect = async (level: UserLevel) => {
    setSelectedLevel(level);
    setIsSubmitting(true);

    // Create user profile based on selection
    const profile: UserProfile = {
      confidence: level,
      preferredPace: level === 'confident' ? 'fast' : level === 'completely-new' ? 'slow' : 'medium',
      previousSessions: 0
    };

    // Simulate brief processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onComplete(profile);
  };

  if (isSubmitting) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your coaching experience...</h2>
        <p className="text-gray-600 text-center max-w-md">
          I'm adapting my teaching style to match your {selectedLevel?.replace('-', ' ')} level.
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white">🤖</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to your AI IELTS Writing Coach! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          I'm here to help you plan and write amazing IELTS essays. Let's start by understanding 
          where you are in your IELTS writing journey.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          How would you describe your IELTS writing confidence?
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {CONFIDENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => handleLevelSelect(level.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${level.color}
                hover:shadow-lg hover:scale-[1.02]
                focus:outline-none focus:ring-4 focus:ring-blue-200
              `}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {level.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {level.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {level.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Don't worry - I'll adapt my coaching style based on your choice, and we can always adjust as we go!
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;