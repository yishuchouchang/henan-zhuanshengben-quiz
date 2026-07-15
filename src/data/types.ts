export type QuestionType = 'choice' | 'fill' | 'short_answer' | 'case_analysis' | 'essay';
export type Subject = 'education' | 'psychology';

export interface Question {
  id: number;
  type: QuestionType;
  subject: Subject;
  question: string;
  options?: string[]; // for choice questions
  answer: string;
  explanation?: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  choice: '选择题',
  fill: '填空题',
  short_answer: '简答题',
  case_analysis: '案例分析题',
  essay: '论述题',
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  education: '教育学',
  psychology: '心理学',
};
