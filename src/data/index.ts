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
import { educationQuestions2020 } from './education-2020';
import { psychologyQuestions2020 } from './psychology-2020';
import { educationQuestions2021 } from './education-2021';
import { psychologyQuestions2021 } from './psychology-2021';
import { educationQuestions2019 } from './education-2019';
import { psychologyQuestions2019 } from './psychology-2019';
import { education2018Questions } from './education-2018';
import { psychology2018Questions } from './psychology-2018';

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

// 2020年真题
export const allQuestions2020: Question[] = [
  ...educationQuestions2020,
  ...psychologyQuestions2020,
];

// 2021年真题
export const allQuestions2021: Question[] = [
  ...educationQuestions2021,
  ...psychologyQuestions2021,
];

// 2019年真题
export const allQuestions2019: Question[] = [
  ...educationQuestions2019,
  ...psychologyQuestions2019,
];

// 2018年真题
export const allQuestions2018: Question[] = [
  ...education2018Questions,
  ...psychology2018Questions,
];

// 默认使用2026年真题
export const allQuestions: Question[] = allQuestions2026;

export { educationQuestions, psychologyQuestions, educationQuestions2025, psychologyQuestions2025, educationQuestions2023, psychologyQuestions2023, educationQuestions2024, psychologyQuestions2024, educationQuestions2022, psychologyQuestions2022, educationQuestions2020, psychologyQuestions2020, educationQuestions2021, psychologyQuestions2021, educationQuestions2019, psychologyQuestions2019, education2018Questions, psychology2018Questions };
export type { Question, QuestionType, Subject } from './types';
export { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from './types';

// 根据年份获取题目
export const getQuestionsByYear = (year: number): Question[] => {
  if (year === 2025) return allQuestions2025;
  if (year === 2024) return allQuestions2024;
  if (year === 2023) return allQuestions2023;
  if (year === 2022) return allQuestions2022;
  if (year === 2021) return allQuestions2021;
  if (year === 2020) return allQuestions2020;
  if (year === 2019) return allQuestions2019;
  if (year === 2018) return allQuestions2018;
  return allQuestions2026;
};
