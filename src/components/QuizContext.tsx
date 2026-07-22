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
  // Draft answers (user's input before submission)
  draftAnswers: Record<number, string>;
  // Answer records (after submission, with correctness)
  answers: Record<number, AnswerRecord>;
  // Wrong question IDs
  wrongIds: number[];
  // Current question index in filtered list
  currentIndex: number;
  // Whether the quiz has been submitted (for unified submission flow)
  submitted: boolean;
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
  // Save a draft answer (before submission)
  saveDraftAnswer: (questionId: number, userAnswer: string) => void;
  // Submit all answers at once (evaluates correctness)
  submitAll: () => void;
  // Legacy: submit a single answer with correctness (for wrong book review)
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
  draftAnsweredCount: number;
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
      draftAnswers: state.draftAnswers,
      answers: state.answers,
      wrongIds: state.wrongIds,
      submitted: state.submitted,
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
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>(saved.draftAnswers || {});
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>(saved.answers || {});
  const [wrongIds, setWrongIds] = useState<number[]>(saved.wrongIds || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState<boolean>(saved.submitted || false);

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
      subjectFilter, typeFilter, view, draftAnswers, answers, wrongIds, currentIndex, submitted,
      examMode, examStartTime, examRemainingSeconds, examFinished, examPaused,
      autoAdvance,
    } as QuizState);
  }, [draftAnswers, answers, wrongIds, subjectFilter, typeFilter, view, currentIndex, submitted, examMode, examStartTime, examRemainingSeconds, examFinished, examPaused, autoAdvance]);

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
          // Time's up - auto submit all answers
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

  // Auto-submit when exam time runs out
  useEffect(() => {
    if (examMode === 'exam' && examFinished && !submitted && Object.keys(draftAnswers).length > 0) {
      // Evaluate all draft answers
      const newAnswers: Record<number, AnswerRecord> = {};
      const newWrongIds: number[] = [];

      Object.entries(draftAnswers).forEach(([qIdStr, userAnswer]) => {
        const questionId = Number(qIdStr);
        const question = allQuestions.find((q) => q.id === questionId);
        if (!question) return;

        let isCorrect = false;
        if (question.type === 'choice') {
          isCorrect = userAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase();
        } else {
          const normalizedUser = userAnswer.trim().replace(/\s+/g, '');
          const normalizedAnswer = question.answer.trim().replace(/\s+/g, '');
          isCorrect = normalizedUser === normalizedAnswer;
        }

        newAnswers[questionId] = {
          questionId,
          userAnswer,
          isCorrect,
          timestamp: Date.now(),
        };

        if (!isCorrect) {
          newWrongIds.push(questionId);
        }
      });

      setAnswers(newAnswers);
      setWrongIds((prev) => {
        const combined = [...new Set([...prev, ...newWrongIds])];
        return combined.filter((id) => !Object.values(newAnswers).some((a) => a.questionId === id && a.isCorrect));
      });
      setSubmitted(true);
    }
  }, [examMode, examFinished, submitted, draftAnswers]);

  const saveDraftAnswer = useCallback((questionId: number, userAnswer: string) => {
    setDraftAnswers((prev) => ({ ...prev, [questionId]: userAnswer }));
  }, []);

  const submitAll = useCallback(() => {
    const newAnswers: Record<number, AnswerRecord> = {};
    const newWrongIds: number[] = [];

    Object.entries(draftAnswers).forEach(([qIdStr, userAnswer]) => {
      const questionId = Number(qIdStr);
      const question = allQuestions.find((q) => q.id === questionId);
      if (!question) return;

      let isCorrect = false;
      if (question.type === 'choice') {
        isCorrect = userAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase();
      } else {
        // For text questions, do a simple comparison (trimmed, case-insensitive for Chinese)
        const normalizedUser = userAnswer.trim().replace(/\s+/g, '');
        const normalizedAnswer = question.answer.trim().replace(/\s+/g, '');
        isCorrect = normalizedUser === normalizedAnswer;
      }

      newAnswers[questionId] = {
        questionId,
        userAnswer,
        isCorrect,
        timestamp: Date.now(),
      };

      if (!isCorrect) {
        newWrongIds.push(questionId);
      }
    });

    setAnswers(newAnswers);
    setWrongIds((prev) => {
      const combined = [...new Set([...prev, ...newWrongIds])];
      // Remove questions that are now correct
      return combined.filter((id) => !Object.values(newAnswers).some((a) => a.questionId === id && a.isCorrect));
    });
    setSubmitted(true);
  }, [draftAnswers]);

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
    setDraftAnswers({});
    setAnswers({});
    setWrongIds([]);
    setCurrentIndex(0);
    setSubmitted(false);
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
    setDraftAnswers({});
    setAnswers({});
    setWrongIds([]);
    setSubmitted(false);
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
  const draftAnsweredCount = Object.keys(draftAnswers).length;
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
    draftAnswers,
    answers,
    wrongIds,
    currentIndex,
    submitted,
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
    saveDraftAnswer,
    submitAll,
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
    draftAnsweredCount,
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
