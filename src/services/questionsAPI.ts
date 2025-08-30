// Local questions service - no backend API required

export interface Question {
  id: number;
  question: string;
  category?: string;
  type?: string;
}

// Sample IELTS Writing Task 2 questions
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. What, in your opinion, should be the main function of a university?',
    type: 'opinion',
    category: 'Education'
  },
  {
    id: 2, 
    question: 'In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.',
    type: 'advantages-disadvantages',
    category: 'Education'
  },
  {
    id: 3,
    question: 'Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both these views and give your own opinion.',
    type: 'discussion',
    category: 'Environment'
  },
  {
    id: 4,
    question: 'In many countries, the amount of crime is increasing. What do you think are the main causes of crime? How can we deal with those causes?',
    type: 'problem-solution',
    category: 'Society'
  },
  {
    id: 5,
    question: 'Some people think that strict punishments for driving offences are the key to reducing traffic accidents. Others, however, believe that other measures would be more effective in improving road safety. Discuss both these views and give your own opinion.',
    type: 'discussion',
    category: 'Transportation'
  },
  {
    id: 6,
    question: 'Many working people get little or no exercise either during the working day or in their free time, and have health problems as a result. Why do working people not get enough exercise? What can be done about this problem?',
    type: 'problem-solution',
    category: 'Health'
  },
  {
    id: 7,
    question: 'Some people believe that it is good to share as much information as possible in scientific research, business and the academic world. Others believe that some information is too important or too valuable to be shared freely. Discuss both these views and give your own opinion.',
    type: 'discussion',
    category: 'Technology'
  },
  {
    id: 8,
    question: 'In a number of countries, some people think it is necessary to spend large sums of money on constructing new railway lines for very fast trains between cities. Others believe the money should be spent on improving existing public transport. Discuss both these views and give your own opinion.',
    type: 'discussion',
    category: 'Transportation'
  },
  {
    id: 9,
    question: 'Some people think that all teenagers should be required to do unpaid work in their free time to help the local community. They believe this would benefit both the individual teenager and society as a whole. Do you agree or disagree?',
    type: 'opinion',
    category: 'Society'
  },
  {
    id: 10,
    question: 'Today, the high sales of popular consumer goods reflect the power of advertising and not the real needs of the society in which they are sold. To what extent do you agree or disagree?',
    type: 'opinion',
    category: 'Business'
  }
];

export const getRandomQuestion = async (options?: {
  category?: string;
  type?: string;
}): Promise<Question> => {
  // Simulate API delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filteredQuestions = SAMPLE_QUESTIONS;
  
  if (options?.category) {
    filteredQuestions = filteredQuestions.filter(q => 
      q.category?.toLowerCase() === options.category!.toLowerCase()
    );
  }
  
  if (options?.type) {
    filteredQuestions = filteredQuestions.filter(q => 
      q.type?.toLowerCase() === options.type!.toLowerCase()
    );
  }
  
  if (filteredQuestions.length === 0) {
    filteredQuestions = SAMPLE_QUESTIONS;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  return filteredQuestions[randomIndex];
};

export const getQuestionsByCategory = async (
  category: string, 
  options?: { type?: string; limit?: number }
): Promise<Question[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let filtered = SAMPLE_QUESTIONS.filter(q => 
    q.category?.toLowerCase() === category.toLowerCase()
  );
  
  if (options?.type) {
    filtered = filtered.filter(q => 
      q.type?.toLowerCase() === options.type!.toLowerCase()
    );
  }
  
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};

export const getAllQuestions = async (options?: {
  category?: string;
  type?: string;
  limit?: number;
}): Promise<Question[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let filtered = [...SAMPLE_QUESTIONS];
  
  if (options?.category) {
    filtered = filtered.filter(q => 
      q.category?.toLowerCase() === options.category?.toLowerCase()
    );
  }
  
  if (options?.type) {
    filtered = filtered.filter(q => 
      q.type?.toLowerCase() === options.type?.toLowerCase()
    );
  }
  
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};

export const getQuestionsMetadata = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const categories = [...new Set(SAMPLE_QUESTIONS.map(q => q.category).filter(Boolean))];
  const types = [...new Set(SAMPLE_QUESTIONS.map(q => q.type).filter(Boolean))];
  
  const categoryStats = categories.reduce((acc, category) => {
    acc[category!] = SAMPLE_QUESTIONS.filter(q => q.category === category).length;
    return acc;
  }, {} as Record<string, number>);
  
  const typeStats = types.reduce((acc, type) => {
    acc[type!] = SAMPLE_QUESTIONS.filter(q => q.type === type).length;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalQuestions: SAMPLE_QUESTIONS.length,
    categories,
    questionTypes: types,
    categoryStats,
    typeStats
  };
};