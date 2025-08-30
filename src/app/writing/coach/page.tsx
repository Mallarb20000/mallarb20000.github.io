'use client';

import React, { useState } from 'react';
import EnhancedCoachInterface from '../../../components/coach/EnhancedCoachInterface';
import './coach.css';

// Modern question selection interface
const QuestionSelector: React.FC<{ onQuestionSelect: (question: string) => void }> = ({ onQuestionSelect }) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const presetQuestions = [
    {
      id: 1,
      text: "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?",
      category: "Education & Community"
    },
    {
      id: 2,
      text: "Many working people get little or no exercise either during the working day or in their free time, and have health problems as a result. Why do the problems happen? What can be done to solve this problem?",
      category: "Health & Lifestyle"
    },
    {
      id: 3,
      text: "Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages outweigh the disadvantages?",
      category: "Education & Language"
    },
    {
      id: 4,
      text: "In many countries, people are moving away from rural areas and towards urban areas. Why does this happen? What are the consequences of this trend?",
      category: "Society & Urbanization"
    }
  ];

  const handlePresetSelect = (question: string, id: number) => {
    setSelectedPreset(`preset-${id}`);
    setCustomQuestion('');
    onQuestionSelect(question);
  };

  const handleCustomSubmit = () => {
    if (customQuestion.trim()) {
      onQuestionSelect(customQuestion.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-4xl text-white">🤖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI IELTS Writing Coach
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get personalized, adaptive guidance to plan your IELTS Writing Task 2 essay step by step
          </p>
        </div>

        {/* Question Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <button className="flex-1 max-w-xs py-3 px-6 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all duration-200">
                Choose from Presets
              </button>
              <div className="mx-4 text-gray-400">or</div>
              <button 
                onClick={() => document.getElementById('custom-input')?.focus()}
                className="flex-1 max-w-xs py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Write Your Own
              </button>
            </div>
          </div>

          {/* Preset Questions */}
          <div className="mb-8">
            <div className="grid gap-4">
              {presetQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handlePresetSelect(question.text, question.id)}
                  className={`p-6 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                    selectedPreset === `preset-${question.id}`
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {question.category}
                    </span>
                    {selectedPreset === `preset-${question.id}` && (
                      <span className="text-blue-500 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    {question.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Question Input */}
          <div className="border-t border-gray-200 pt-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Or paste your own IELTS Writing Task 2 question:
            </label>
            <textarea
              id="custom-input"
              value={customQuestion}
              onChange={(e) => {
                setCustomQuestion(e.target.value);
                setSelectedPreset(null);
              }}
              placeholder="Paste your IELTS Writing Task 2 question here..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 leading-relaxed resize-none"
              rows={4}
            />
            {customQuestion.trim() && (
              <button
                onClick={handleCustomSubmit}
                className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Start Planning Your Essay →
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            ✨ Powered by adaptive AI that adjusts to your skill level
          </p>
        </div>
      </div>
    </div>
  );
};

const CoachPage: React.FC = () => {
  const [essayQuestion, setEssayQuestion] = useState<string | null>(null);

  if (!essayQuestion) {
    return <QuestionSelector onQuestionSelect={setEssayQuestion} />;
  }

  return <EnhancedCoachInterface essayQuestion={essayQuestion} />;
};

export default CoachPage;