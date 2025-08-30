import { test, expect } from '@playwright/test';
import { getRandomQuestion, getQuestionsByCategory, getAllQuestions, getQuestionsMetadata } from '../src/services/questionsAPI';

test.describe('Questions API Interface', () => {
  test('getRandomQuestion returns a valid question', async () => {
    const question = await getRandomQuestion();
    
    expect(question).toBeDefined();
    expect(question.id).toBeGreaterThan(0);
    expect(question.question).toBeTruthy();
    expect(typeof question.question).toBe('string');
    expect(question.question.length).toBeGreaterThan(10);
  });

  test('getRandomQuestion with category filter works', async () => {
    const question = await getRandomQuestion({ category: 'Education' });
    
    expect(question).toBeDefined();
    expect(question.category).toBe('Education');
  });

  test('getRandomQuestion with type filter works', async () => {
    const question = await getRandomQuestion({ type: 'opinion' });
    
    expect(question).toBeDefined();
    expect(question.type).toBe('opinion');
  });

  test('getQuestionsByCategory returns filtered questions', async () => {
    const questions = await getQuestionsByCategory('Education');
    
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    
    questions.forEach(question => {
      expect(question.category).toBe('Education');
    });
  });

  test('getQuestionsByCategory with type filter works', async () => {
    const questions = await getQuestionsByCategory('Education', { type: 'opinion' });
    
    expect(Array.isArray(questions)).toBe(true);
    
    questions.forEach(question => {
      expect(question.category).toBe('Education');
      expect(question.type).toBe('opinion');
    });
  });

  test('getQuestionsByCategory with limit works', async () => {
    const questions = await getQuestionsByCategory('Education', { limit: 1 });
    
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeLessThanOrEqual(1);
  });

  test('getAllQuestions returns all questions', async () => {
    const questions = await getAllQuestions();
    
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBe(10); // Based on the sample data
  });

  test('getAllQuestions with filters works', async () => {
    const questions = await getAllQuestions({ category: 'Society', limit: 5 });
    
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeLessThanOrEqual(5);
    
    questions.forEach(question => {
      expect(question.category).toBe('Society');
    });
  });

  test('getQuestionsMetadata returns correct structure', async () => {
    const metadata = await getQuestionsMetadata();
    
    expect(metadata).toBeDefined();
    expect(metadata.totalQuestions).toBe(10);
    expect(Array.isArray(metadata.categories)).toBe(true);
    expect(Array.isArray(metadata.questionTypes)).toBe(true);
    expect(typeof metadata.categoryStats).toBe('object');
    expect(typeof metadata.typeStats).toBe('object');
    
    // Verify the categories and types exist
    expect(metadata.categories.length).toBeGreaterThan(0);
    expect(metadata.questionTypes.length).toBeGreaterThan(0);
  });

  test('all questions have required fields', async () => {
    const questions = await getAllQuestions();
    
    questions.forEach(question => {
      expect(question.id).toBeDefined();
      expect(typeof question.id).toBe('number');
      expect(question.question).toBeDefined();
      expect(typeof question.question).toBe('string');
      expect(question.question.length).toBeGreaterThan(10);
    });
  });

  test('API functions handle edge cases gracefully', async () => {
    // Test with non-existent category
    const questions = await getQuestionsByCategory('NonExistentCategory');
    expect(Array.isArray(questions)).toBe(true);
    
    // Test with non-existent type
    const questionsWithType = await getAllQuestions({ type: 'non-existent' });
    expect(Array.isArray(questionsWithType)).toBe(true);
  });

  test('API response times are reasonable', async () => {
    const start = Date.now();
    const question = await getRandomQuestion();
    const end = Date.now();
    
    expect(question).toBeDefined();
    expect(end - start).toBeLessThan(1000); // Should complete within 1 second
  });
});