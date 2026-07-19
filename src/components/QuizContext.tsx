'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { allQuestions, type Question, type QuestionType, type Subject } from '@/data';

interface AnswerRecord {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

type ExamMode = 'practice' | 'exam';

interface ExamState {
  examMode: ExamMode;
  examStartTime: number | null;
  examRemainingSeconds: number;
  examFinished: boolean;
  examPaused: boolean;
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
  // Exam mode
  examMode: ExamMode;
  examStartTime: number | null;
  examRemainingSeconds: number;
  examFinished: boolean;
  examPaused: boolean;
  // Auto advance
  autoAdvance: boolean;
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
  // Exam mode methods
  startExam: () => void;
  setExamMode: (mode: ExamMode) => void;
  togglePauseExam: () => void;
  endExam: () => void;
  exitExamMode: () => void;
  elapsedSeconds: number;
  // Auto advance
  setAutoAdvance: (enabled: boolean) => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

const STORAGE_KEY = 'henan-quiz-state';
const EXAM_DURATION_SECONDS = 120 * 60; // 2 hours

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
      examMode: state.examMode,
      examStartTime: state.examStartTime,
      examRemainingSeconds: state.examRemainingSeconds,
      examFinished: state.examFinished,
      examPaused: state.examPaused,
      autoAdvance: state.autoAdvance,
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

  // Exam mode state
  const [examMode, setExamModeState] = useState<ExamMode>(saved.examMode || 'practice');
  const [examStartTime, setExamStartTime] = useState<number | null>(saved.examStartTime || null);
  const [examRemainingSeconds, setExamRemainingSeconds] = useState<number>(
    saved.examRemainingSeconds ?? EXAM_DURATION_SECONDS
  );
  const [examFinished, setExamFinished] = useState<boolean>(saved.examFinished || false);
  const [examPaused, setExamPaused] = useState<boolean>(saved.examPaused || false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto advance state
  const [autoAdvance, setAutoAdvanceState] = useState<boolean>(saved.autoAdvance ?? true);
  const setAutoAdvance = useCallback((enabled: boolean) => {
    setAutoAdvanceState(enabled);
  }, []);

  // Filtered questions
  const filteredQuestions = allQuestions.filter((q) => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    return true;
  });

  // Save to localStorage when key state changes
  useEffect(() => {
    saveState({
      subjectFilter, typeFilter, view, answers, wrongIds, currentIndex,
      examMode, examStartTime, examRemainingSeconds, examFinished, examPaused,
      autoAdvance,
    } as QuizState);
  }, [answers, wrongIds, subjectFilter, typeFilter, view, currentIndex, examMode, examStartTime, examRemainingSeconds, examFinished, examPaused, autoAdvance]);

  // Countdown timer logic
  useEffect(() => {
    if (examMode !== 'exam' || examFinished || examPaused || !examStartTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setExamRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Time's up
          setExamFinished(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [examMode, examFinished, examPaused, examStartTime]);

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
    setExamModeState('practice');
    setExamStartTime(null);
    setExamRemainingSeconds(EXAM_DURATION_SECONDS);
    setExamFinished(false);
    setExamPaused(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const removeWrongQuestion = useCallback((id: number) => {
    setWrongIds((prev) => prev.filter((qid) => qid !== id));
  }, []);

  // Exam mode methods
  const startExam = useCallback(() => {
    setExamModeState('exam');
    setExamStartTime(Date.now());
    setExamRemainingSeconds(EXAM_DURATION_SECONDS);
    setExamFinished(false);
    setExamPaused(false);
    setAnswers({});
    setWrongIds([]);
    setCurrentIndex(0);
  }, []);

  const setExamMode = useCallback((mode: ExamMode) => {
    setExamModeState(mode);
    if (mode === 'practice') {
      setExamStartTime(null);
      setExamRemainingSeconds(EXAM_DURATION_SECONDS);
      setExamFinished(false);
      setExamPaused(false);
    }
  }, []);

  const togglePauseExam = useCallback(() => {
    setExamPaused((prev) => !prev);
  }, []);

  const endExam = useCallback(() => {
    setExamFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const exitExamMode = useCallback(() => {
    setExamModeState('practice');
    setExamStartTime(null);
    setExamRemainingSeconds(EXAM_DURATION_SECONDS);
    setExamFinished(false);
    setExamPaused(false);
  }, []);

  // Calculate elapsed seconds (pure calculation, no Date.now)
  const elapsedSeconds = EXAM_DURATION_SECONDS - examRemainingSeconds;

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
    examMode,
    examStartTime,
    examRemainingSeconds,
    examFinished,
    examPaused,
    autoAdvance,
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
    startExam,
    setExamMode,
    togglePauseExam,
    endExam,
    exitExamMode,
    elapsedSeconds,
    setAutoAdvance,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextType {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
