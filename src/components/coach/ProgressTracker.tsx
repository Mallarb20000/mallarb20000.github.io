import React from 'react';
import { AppState } from '../../types/coach';
import CheckIcon from './icons/CheckIcon';

const steps = [
  { state: AppState.QUESTION_TYPE, label: 'Type' },
  { state: AppState.HOOK, label: 'Hook' },
  { state: AppState.THESIS, label: 'Thesis' },
  { state: AppState.TOPIC_SENTENCE_1, label: 'Topics' },
  { state: AppState.CONCLUSION, label: 'Conclusion' },
];

const stateOrder: AppState[] = [
    AppState.WELCOME,
    AppState.QUESTION_TYPE,
    AppState.HOOK,
    AppState.THESIS,
    AppState.TOPIC_SENTENCE_1,
    AppState.TOPIC_SENTENCE_2,
    AppState.CONCLUSION,
    AppState.COMPLETE,
];

const getStepStatus = (currentAppState: AppState, stepState: AppState): 'completed' | 'current' | 'upcoming' => {
    // Treat TOPIC_SENTENCE_2 as being in the same step as TOPIC_SENTENCE_1 for UI purposes
    const normalizedCurrentState = currentAppState === AppState.TOPIC_SENTENCE_2 ? AppState.TOPIC_SENTENCE_1 : currentAppState;

    const currentIndex = stateOrder.indexOf(normalizedCurrentState);
    const stepIndex = stateOrder.indexOf(stepState);

    if (currentIndex > stepIndex) {
        return 'completed';
    }
    if (currentIndex === stepIndex) {
        return 'current';
    }
    return 'upcoming';
};

const ProgressTracker: React.FC<{ currentStep: AppState }> = ({ currentStep }) => {
    if (currentStep === AppState.WELCOME || currentStep === AppState.COMPLETE) {
        return null;
    }
    
    return (
        <div className="pt-8 pb-12 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((step, stepIdx) => {
                        const status = getStepStatus(currentStep, step.state);
                        const isLastStep = stepIdx === steps.length - 1;

                        return (
                            <li key={step.label} className={`relative ${!isLastStep ? 'pr-8 sm:pr-20 flex-1' : ''}`}>
                                {status === 'completed' ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-indigo-600" />
                                        </div>
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                                            <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                        </div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{step.label}</span>
                                    </>
                                ) : status === 'current' ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white dark:bg-gray-800" aria-current="step">
                                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                        </div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{step.label}</span>
                                    </>
                                ) : ( // upcoming
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                        </div>
                                         <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{step.label}</span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default ProgressTracker;