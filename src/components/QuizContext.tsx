'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { allQuestions, type Question, type QuestionType, type Subject } from '@/data';

interface AnswerRecord {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

interface QuizState {
  // Filters
  subjectFilter: Subject | 'all';
  typeFilter: QuestionType | 'all';
  // Current view
  view: 'practice' | 'wrong_book' | 'progress';
  // Answer records
  answers: Record<number, AnswerRecord>;
  // Wrong question IDs
  wrongIds: number[];
  // Current question index in filtered list
  currentIndex: number;
}

interface QuizContextType extends QuizState {
  filteredQuestions: Question[];
  setSubjectFilter: (s: Subject | 'all') => void;
  setTypeFilter: (t: QuestionType | 'all') => void;
  setView: (v: 'practice' | 'wrong_book' | 'progress') => void;
  submitAnswer: (questionId: number, userAnswer: string, isCorrect: boolean) => void;
  getCurrentQuestion: () => Question | null;
  goToNext: () => void;
  goToPrev: () => void;
  goToQuestion: (index: number) => void;
  resetProgress: () => void;
  removeWrongQuestion: (id: number) => void;
  answeredCount: number;
  correctCount: number;
  choiceCorrectCount: number;
  choiceAnsweredCount: number;
}

const QuizContext = createContext<QuizContextType | null>(null);

const STORAGE_KEY = 'henan-quiz-state';

function loadState(): Partial<QuizState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {};
}

function saveState(state: QuizState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: state.answers,
      wrongIds: state.wrongIds,
    }));
  } catch {
    // ignore
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const saved = loadState();

  const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [view, setView] = useState<'practice' | 'wrong_book' | 'progress'>('practice');
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>(saved.answers || {});
  const [wrongIds, setWrongIds] = useState<number[]>(saved.wrongIds || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtered questions
  const filteredQuestions = allQuestions.filter((q) => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    return true;
  });

  // Save to localStorage when answers or wrongIds change
  useEffect(() => {
    saveState({ subjectFilter, typeFilter, view, answers, wrongIds, currentIndex } as QuizState);
  }, [answers, wrongIds, subjectFilter, typeFilter, view, currentIndex]);

  const submitAnswer = useCallback((questionId: number, userAnswer: string, isCorrect: boolean) => {
    const record: AnswerRecord = {
      questionId,
      userAnswer,
      isCorrect,
      timestamp: Date.now(),
    };
    setAnswers((prev) => ({ ...prev, [questionId]: record }));

    if (!isCorrect) {
      setWrongIds((prev) => prev.includes(questionId) ? prev : [...prev, questionId]);
    } else {
      setWrongIds((prev) => prev.filter((id) => id !== questionId));
    }
  }, []);

  const getCurrentQuestion = useCallback(() => {
    if (filteredQuestions.length === 0) return null;
    const idx = Math.min(currentIndex, filteredQuestions.length - 1);
    return filteredQuestions[idx];
  }, [filteredQuestions, currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, filteredQuestions.length - 1));
  }, [filteredQuestions.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, filteredQuestions.length - 1)));
  }, [filteredQuestions.length]);

  const resetProgress = useCallback(() => {
    setAnswers({});
    setWrongIds([]);
    setCurrentIndex(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const removeWrongQuestion = useCallback((id: number) => {
    setWrongIds((prev) => prev.filter((qid) => qid !== id));
  }, []);

  // Stats
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const choiceAnsweredCount = Object.values(answers).filter(
    (a) => allQuestions.find((q) => q.id === a.questionId)?.type === 'choice'
  ).length;
  const choiceCorrectCount = Object.values(answers).filter(
    (a) => a.isCorrect && allQuestions.find((q) => q.id === a.questionId)?.type === 'choice'
  ).length;

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [subjectFilter, typeFilter]);

  const value: QuizContextType = {
    subjectFilter,
    typeFilter,
    view,
    answers,
    wrongIds,
    currentIndex,
    filteredQuestions,
    setSubjectFilter,
    setTypeFilter,
    setView,
    submitAnswer,
    getCurrentQuestion,
    goToNext,
    goToPrev,
    goToQuestion,
    resetProgress,
    removeWrongQuestion,
    answeredCount,
    correctCount,
    choiceCorrectCount,
    choiceAnsweredCount,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextType {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
