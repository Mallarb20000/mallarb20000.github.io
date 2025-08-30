import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.192A6.75 6.75 0 019.315 7.584zM12 6a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM10.5 8.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM6 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM4.5 14.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

export default SparklesIcon;