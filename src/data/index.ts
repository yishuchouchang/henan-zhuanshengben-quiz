import { Question } from './types';
import { educationQuestions } from './education-questions';
import { psychologyQuestions } from './psychology-questions';
import { educationQuestions2025 } from './education-2025';
import { psychologyQuestions2025 } from './psychology-2025';

// 2026年真题
export const allQuestions2026: Question[] = [
  ...educationQuestions,
  ...psychologyQuestions,
];

// 2025年真题
export const allQuestions2025: Question[] = [
  ...educationQuestions2025,
  ...psychologyQuestions2025,
];

// 默认使用2026年真题
export const allQuestions: Question[] = allQuestions2026;

export { educationQuestions, psychologyQuestions, educationQuestions2025, psychologyQuestions2025 };
export type { Question, QuestionType, Subject } from './types';
export { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from './types';

// 根据年份获取题目
export const getQuestionsByYear = (year: number): Question[] => {
  if (year === 2025) return allQuestions2025;
  return allQuestions2026;
};
