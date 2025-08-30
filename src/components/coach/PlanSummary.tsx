import React from 'react';
import { EssayPlan } from '../../types/coach';
import CheckIcon from './icons/CheckIcon';
import PencilIcon from './icons/PencilIcon';

interface PlanSummaryProps {
  plan: EssayPlan;
  essayQuestion: string;
}

const PlanItem: React.FC<{ title: string; content: string | null }> = ({ title, content }) => {
  const isComplete = content !== null;
  return (
    <div>
      <h3 className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
        {isComplete ? (
          <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
        ) : (
          <PencilIcon className="w-4 h-4 mr-2 text-yellow-500" />
        )}
        {title}
      </h3>
      {isComplete ? (
        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 pl-6">{content}</p>
      ) : (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 pl-6 italic">Pending...</p>
      )}
    </div>
  );
};

const PlanSummary: React.FC<PlanSummaryProps> = ({ plan, essayQuestion }) => {
  const planItems = [
    { title: 'Question Type', content: plan.questionType },
    { title: 'Hook', content: plan.hook },
    { title: 'Thesis Statement', content: plan.thesis },
    { title: 'Topic Sentence 1', content: plan.topicSentence1 },
    { title: 'Topic Sentence 2', content: plan.topicSentence2 },
    { title: 'Conclusion Summary', content: plan.conclusion },
  ];

  return (
    <div className="h-full bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700">
      <div className="sticky top-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Essay Plan</h2>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Essay Question</h3>
            <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{essayQuestion}</p>
        </div>
        <div className="mt-6 space-y-4">
          {planItems.map((item) => (
            <PlanItem key={item.title} title={item.title} content={item.content} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSummary;