import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface WelcomeScreenProps {
  onStart: (question: string) => void;
}

const presetQuestions = [
  "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?",
  "In many countries, online shopping is becoming more popular. Do the advantages of this trend outweigh the disadvantages?",
  "Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages of this outweigh the disadvantages?",
  "Many working people get little or no exercise either during the working day or in their free time, and have health problems as a result. Why do many working people not get enough exercise? What can be done about this problem?"
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [question, setQuestion] = useState(presetQuestions[0]);
  const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onStart(question.trim());
    }
  };

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index);
    setQuestion(presetQuestions[index]);
    setInputMode('preset');
  };

  const handleCustomMode = () => {
    setInputMode('custom');
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 px-4 py-8 lg:py-12">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 lg:px-12 lg:py-12 text-center">
              <SparklesIcon className="w-16 h-16 lg:w-20 lg:h-20 mx-auto text-white mb-4" />
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                AI IELTS Writing Coach
              </h1>
              <p className="text-lg lg:text-xl text-indigo-100 max-w-2xl mx-auto">
                Get personalized guidance to plan your IELTS Writing Task 2 essay step by step
              </p>
            </div>

            {/* Content Section */}
            <div className="p-6 lg:p-12">
              {/* Mode Selection */}
              <div className="mb-8">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  Choose Your Essay Question
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setInputMode('preset')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                      inputMode === 'preset'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Choose from Presets
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomMode}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                      inputMode === 'custom'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Write Your Own
                  </button>
                </div>

                {/* Preset Questions */}
                {inputMode === 'preset' && (
                  <div className="space-y-3 mb-6">
                    {presetQuestions.map((preset, index) => (
                      <div
                        key={index}
                        onClick={() => handlePresetSelect(index)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPreset === index
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                        }`}
                      >
                        <p className="text-sm lg:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                          {preset}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Question Input */}
                {inputMode === 'custom' && (
                  <div className="mb-6">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Paste your IELTS Writing Task 2 question here..."
                      className="w-full h-32 lg:h-40 p-4 text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Selected Question Display */}
              {question && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Selected Question:
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {question}
                  </p>
                </div>
              )}

              {/* Start Button */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  className="w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  disabled={!question.trim()}
                >
                  Start Planning Your Essay
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;