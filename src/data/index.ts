import { Question } from './types';
import { educationQuestions } from './education-questions';
import { psychologyQuestions } from './psychology-questions';
import { educationQuestions2025 } from './education-2025';
import { psychologyQuestions2025 } from './psychology-2025';
import { educationQuestions2023 } from './education-2023';
import { psychologyQuestions2023 } from './psychology-2023';
import { educationQuestions2024 } from './education-2024';
import { psychologyQuestions2024 } from './psychology-2024';
import { educationQuestions2022 } from './education-2022';
import { psychologyQuestions2022 } from './psychology-2022';

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

// 2024年真题
export const allQuestions2024: Question[] = [
  ...educationQuestions2024,
  ...psychologyQuestions2024,
];

// 2023年真题
export const allQuestions2023: Question[] = [
  ...educationQuestions2023,
  ...psychologyQuestions2023,
];

// 2022年真题
export const allQuestions2022: Question[] = [
  ...educationQuestions2022,
  ...psychologyQuestions2022,
];

// 默认使用2026年真题
export const allQuestions: Question[] = allQuestions2026;

export { educationQuestions, psychologyQuestions, educationQuestions2025, psychologyQuestions2025, educationQuestions2023, psychologyQuestions2023, educationQuestions2024, psychologyQuestions2024, educationQuestions2022, psychologyQuestions2022 };
export type { Question, QuestionType, Subject } from './types';
export { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from './types';

// 根据年份获取题目
export const getQuestionsByYear = (year: number): Question[] => {
  if (year === 2025) return allQuestions2025;
  if (year === 2024) return allQuestions2024;
  if (year === 2023) return allQuestions2023;
  if (year === 2022) return allQuestions2022;
  return allQuestions2026;
};
