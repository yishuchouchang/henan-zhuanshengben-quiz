import { Question } from './types';
import { educationQuestions } from './education-questions';
import { psychologyQuestions } from './psychology-questions';

export const allQuestions: Question[] = [
  ...educationQuestions,
  ...psychologyQuestions,
];

export { educationQuestions, psychologyQuestions };
export type { Question, QuestionType, Subject } from './types';
export { QUESTION_TYPE_LABELS, SUBJECT_LABELS } from './types';
