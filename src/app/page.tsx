'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QuizProvider, useQuiz } from '@/components/QuizContext';
import {
  allQuestions,
  QUESTION_TYPE_LABELS,
  SUBJECT_LABELS,
  type QuestionType,
  type Subject,
  type Question,
} from '@/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  Brain,
  ListChecks,
  Eye,
  EyeOff,
  Clock,
  Play,
  Pause,
  Timer,
  Trophy,
  Target,
} from 'lucide-react';

/* ======================== Filter Bar ======================== */
function FilterBar() {
  const { subjectFilter, setSubjectFilter, typeFilter, setTypeFilter } = useQuiz();

  return (
    <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 overflow-hidden rounded-2xl">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
            <Filter className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <span className="text-sm font-semibold text-gray-600">筛选条件</span>
        </div>
        <div className="space-y-4">
          {/* Subject filter */}
          <div>
            <span className="text-xs text-gray-400 mb-2 block font-medium">科目</span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={subjectFilter === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all rounded-lg ${subjectFilter === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm shadow-indigo-200' : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                onClick={() => setSubjectFilter('all')}
              >
                全部
              </Badge>
              <Badge
                variant={subjectFilter === 'education' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all rounded-lg ${subjectFilter === 'education' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm shadow-indigo-200' : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                onClick={() => setSubjectFilter('education')}
              >
                <GraduationCap className="h-3 w-3 mr-1" />
                教育学
              </Badge>
              <Badge
                variant={subjectFilter === 'psychology' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all rounded-lg ${subjectFilter === 'psychology' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm shadow-indigo-200' : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                onClick={() => setSubjectFilter('psychology')}
              >
                <Brain className="h-3 w-3 mr-1" />
                心理学
              </Badge>
            </div>
          </div>
          {/* Type filter */}
          <div>
            <span className="text-xs text-gray-400 mb-2 block font-medium">题型</span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all rounded-lg ${typeFilter === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm shadow-indigo-200' : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                onClick={() => setTypeFilter('all')}
              >
                全部
              </Badge>
              {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={typeFilter === key ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all rounded-lg ${typeFilter === key ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-sm shadow-indigo-200' : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                  onClick={() => setTypeFilter(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ======================== Choice Question ======================== */
function ChoiceQuestion({ question, answered }: { question: Question; answered: boolean }) {
  const { submitAnswer, answers, autoAdvance, goToNext, filteredQuestions, currentIndex } = useQuiz();
  const [selected, setSelected] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const record = answers[question.id];
  const isAnswered = record !== undefined;
  const userAnswer = record?.userAnswer || selected;
  const isCorrect = record?.isCorrect;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Auto-advance after answering (both modes, controlled by autoAdvance toggle)
  useEffect(() => {
    if (submitted && autoAdvance) {
      const isLastQuestion = currentIndex >= filteredQuestions.length - 1;
      if (!isLastQuestion) {
        advanceTimerRef.current = setTimeout(() => {
          goToNext();
        }, 500);
      }
    }
  }, [submitted, autoAdvance, currentIndex, filteredQuestions.length, goToNext]);

  const handleSelect = (value: string) => {
    if (isAnswered || submitted) return;
    setSelected(value);
    // Auto-submit immediately after selection
    const correct = value.trim().toUpperCase() === question.answer.trim().toUpperCase();
    submitAnswer(question.id, value, correct);
    setSubmitted(true);
  };

  const optionLetter = (opt: string): string => {
    const match = opt.match(/^([A-Da-d])/);
    return match ? match[1].toUpperCase() : '';
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={userAnswer} className="space-y-2.5">
        {question.options?.map((opt, idx) => {
          const letter = optionLetter(opt);
          const isSelected = userAnswer === letter;
          const isCorrectOption = letter === question.answer;
          let borderColor = 'border-gray-200/80';
          let bgColor = 'bg-white';
          let shadow = '';

          if (isAnswered || submitted) {
            if (isCorrectOption) {
              borderColor = 'border-emerald-400';
              bgColor = 'bg-gradient-to-r from-emerald-50/80 to-green-50/50';
              shadow = 'shadow-sm shadow-emerald-100';
            } else if (isSelected && !isCorrect) {
              borderColor = 'border-rose-300';
              bgColor = 'bg-gradient-to-r from-rose-50/80 to-red-50/50';
              shadow = 'shadow-sm shadow-rose-100';
            }
          } else if (isSelected) {
            borderColor = 'border-indigo-400';
            bgColor = 'bg-gradient-to-r from-indigo-50/80 to-purple-50/50';
            shadow = 'shadow-sm shadow-indigo-100';
          }

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${borderColor} ${bgColor} ${shadow} ${!isAnswered && !submitted ? 'hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50' : ''}`}
              onClick={() => handleSelect(letter)}
            >
              <RadioGroupItem value={letter} id={`opt-${question.id}-${idx}`} className="shrink-0" />
              <Label htmlFor={`opt-${question.id}-${idx}`} className="flex-1 cursor-pointer text-sm leading-relaxed text-gray-700">
                {opt}
              </Label>
              {(isAnswered || submitted) && isCorrectOption && (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
              {(isAnswered || submitted) && isSelected && !isCorrect && (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>

      {(isAnswered || submitted) && (
        <div className={`p-4 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-green-50/40' : 'border-rose-200 bg-gradient-to-r from-rose-50/60 to-red-50/40'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-400" />
            )}
            <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '回答正确!' : '回答错误'}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">正确答案：</span>{question.answer}
          </p>
          {question.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">解析：</span>{question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ======================== Text Question (Fill / Short Answer / Case / Essay) ======================== */
function TextQuestion({ question }: { question: Question }) {
  const { submitAnswer, answers, autoAdvance, goToNext, filteredQuestions, currentIndex } = useQuiz();
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selfEval, setSelfEval] = useState<'correct' | 'wrong' | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const record = answers[question.id];
  const isAnswered = record !== undefined;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Auto-advance after self-evaluation (both modes, controlled by autoAdvance toggle)
  useEffect(() => {
    if (selfEval && autoAdvance) {
      const isLastQuestion = currentIndex >= filteredQuestions.length - 1;
      if (!isLastQuestion) {
        advanceTimerRef.current = setTimeout(() => {
          goToNext();
        }, 500);
      }
    }
  }, [selfEval, autoAdvance, currentIndex, filteredQuestions.length, goToNext]);

  const handleSubmit = () => {
    if (!userInput.trim() || isAnswered) return;
    // For text questions, we mark as answered but don't auto-judge
    submitAnswer(question.id, userInput, false); // temporarily mark as wrong
    setShowAnswer(true);
  };

  const handleSelfEval = (eval_: 'correct' | 'wrong') => {
    setSelfEval(eval_);
    if (isAnswered) {
      submitAnswer(question.id, record?.userAnswer || userInput, eval_ === 'correct');
    }
  };

  const isTextarea = question.type === 'short_answer' || question.type === 'case_analysis' || question.type === 'essay';

  return (
    <div className="space-y-4">
      {isTextarea ? (
        <Textarea
          placeholder="请输入你的答案..."
          value={isAnswered ? record?.userAnswer || '' : userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isAnswered}
          className="min-h-[160px] text-sm leading-relaxed resize-y"
          rows={6}
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="请输入你的答案..."
            value={isAnswered ? record?.userAnswer || '' : userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isAnswered}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
      )}

      {!isAnswered && (
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            提交并查看答案
          </Button>
        </div>
      )}

      {(showAnswer || isAnswered) && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <p className="text-sm font-medium text-blue-800 mb-1">参考答案：</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{question.answer}</p>
          </div>

          {question.explanation && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-1">解析提示：</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {!selfEval && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-sm text-amber-800">请对照答案进行自评：</span>
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => handleSelfEval('correct')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                掌握
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => handleSelfEval('wrong')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                未掌握
              </Button>
            </div>
          )}

          {selfEval && (
            <div className={`p-3 rounded-lg border ${selfEval === 'correct' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <span className={`text-sm font-medium ${selfEval === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {selfEval === 'correct' ? '已标记为掌握' : '已加入错题本，继续加油!'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ======================== Question Card ======================== */
function QuestionCard() {
  const { getCurrentQuestion, filteredQuestions, currentIndex, answers, examMode, endExam } = useQuiz();
  const question = getCurrentQuestion();

  if (!question) {
    return (
      <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
        <CardContent className="pt-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">当前筛选条件下没有题目</p>
          <p className="text-sm text-gray-400 mt-1">请调整筛选条件</p>
        </CardContent>
      </Card>
    );
  }

  const isAnswered = answers[question.id] !== undefined;
  const typeLabel = QUESTION_TYPE_LABELS[question.type];
  const subjectLabel = SUBJECT_LABELS[question.subject];
  const isLastQuestion = currentIndex >= filteredQuestions.length - 1;

  // Check if all questions in current filter are answered
  const allAnswered = filteredQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 overflow-hidden rounded-2xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent border-b border-indigo-100/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 rounded-lg">
              {subjectLabel}
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 rounded-lg">
              {typeLabel}
            </Badge>
            {isAnswered && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-lg" variant="outline">
                已答
              </Badge>
            )}
          </div>
          <span className="text-sm text-gray-400 font-medium bg-white/60 px-2.5 py-1 rounded-full border border-gray-100">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
        </div>
        <CardTitle className="text-base font-medium text-gray-700 leading-relaxed mt-3">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {question.type === 'choice' ? (
          <ChoiceQuestion question={question} answered={isAnswered} />
        ) : (
          <TextQuestion question={question} />
        )}

        {/* All questions answered indicator in exam mode */}
        {examMode === 'exam' && allAnswered && isLastQuestion && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-green-50/40">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="font-medium text-emerald-700">所有题目已完成!</span>
            </div>
            <p className="text-sm text-emerald-600 mb-3">
              你已完成当前筛选条件下的所有题目，可以提交试卷查看成绩。
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm('确定要提交试卷吗？')) {
                  endExam();
                }
              }}
            >
              <Trophy className="h-4 w-4 mr-2" />
              提交试卷
            </Button>
          </div>
        )}

        {/* Last question indicator in exam mode (not all answered yet) */}
        {examMode === 'exam' && isLastQuestion && !allAnswered && (
          <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">这是最后一题，请检查是否有未答的题目</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ======================== Question Navigator ======================== */
function QuestionNavigator() {
  const { filteredQuestions, currentIndex, goToQuestion, goToPrev, goToNext, answers } = useQuiz();

  // Calculate stats for the legend
  const answeredCorrect = filteredQuestions.filter((q) => answers[q.id]?.isCorrect === true).length;
  const answeredWrong = filteredQuestions.filter((q) => answers[q.id]?.isCorrect === false).length;
  const unanswered = filteredQuestions.length - answeredCorrect - answeredWrong;

  return (
    <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 overflow-hidden rounded-2xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50/30 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md flex items-center justify-center">
              <ListChecks className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            题目导航
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-gray-100 border border-gray-200 inline-block" />
              未答 {unanswered}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
              答对 {answeredCorrect}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 inline-block" />
              答错 {answeredWrong}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filteredQuestions.map((q, idx) => {
            const record = answers[q.id];
            const isCurrent = idx === currentIndex;
            let bgClass = 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200/80';
            let icon = null;

            if (record) {
              if (record.isCorrect) {
                bgClass = 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200';
                icon = <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
              } else {
                bgClass = 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200';
                icon = <XCircle className="h-3 w-3 text-rose-400" />;
              }
            }

            if (isCurrent) {
              bgClass = 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-200 border-indigo-500 shadow-md shadow-indigo-200';
              icon = null;
            }

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`relative w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${bgClass}`}
                title={`第${idx + 1}题${record ? (record.isCorrect ? ' - 答对' : ' - 答错') : ' - 未答'}`}
              >
                {isCurrent ? idx + 1 : (icon || idx + 1)}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一题
          </Button>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex >= filteredQuestions.length - 1}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            下一题
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ======================== Wrong Book ======================== */
function WrongBook() {
  const { wrongIds, answers, removeWrongQuestion } = useQuiz();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const wrongQuestions = useMemo(
    () => allQuestions.filter((q) => wrongIds.includes(q.id)),
    [wrongIds]
  );

  if (wrongQuestions.length === 0) {
    return (
      <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
        <CardContent className="pt-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无错题</h3>
          <p className="text-sm text-gray-500">继续加油，保持全对!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800">
          错题本 <span className="text-sm font-normal text-gray-500">({wrongQuestions.length} 题)</span>
        </h3>
      </div>
      {wrongQuestions.map((q) => {
        const record = answers[q.id];
        const isExpanded = expandedId === q.id;
        return (
          <Card key={q.id} className="border-red-100 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50 text-xs rounded-lg">
                      {SUBJECT_LABELS[q.subject]}
                    </Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50/50 text-xs rounded-lg">
                      {QUESTION_TYPE_LABELS[q.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{q.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="shrink-0 text-indigo-500 hover:text-indigo-600"
                >
                  {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-2 pt-3 border-t border-indigo-100/50">
                  {record && (
                    <p className="text-sm">
                      <span className="text-gray-400">你的答案：</span>
                      <span className="text-rose-500 font-medium">{record.userAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-gray-400">正确答案：</span>
                    <span className="text-emerald-500 font-medium">
                      {q.type === 'choice' ? q.answer : q.answer.slice(0, 100) + (q.answer.length > 100 ? '...' : '')}
                    </span>
                  </p>
                  {q.explanation && (
                    <p className="text-sm text-gray-500">{q.explanation}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 mt-2 rounded-lg"
                    onClick={() => removeWrongQuestion(q.id)}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    已掌握，移除
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ======================== Progress Panel ======================== */
function ProgressPanel() {
  const {
    answeredCount,
    correctCount,
    choiceCorrectCount,
    choiceAnsweredCount,
    wrongIds,
    resetProgress,
    answers,
  } = useQuiz();

  const totalQuestions = allQuestions.length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const choiceAccuracy = choiceAnsweredCount > 0 ? Math.round((choiceCorrectCount / choiceAnsweredCount) * 100) : 0;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Per-type stats
  const typeStats = useMemo(() => {
    const types: QuestionType[] = ['choice', 'fill', 'short_answer', 'case_analysis', 'essay'];
    return types.map((type) => {
      const typeQuestions = allQuestions.filter((q) => q.type === type);
      const typeAnswered = typeQuestions.filter((q) => answers[q.id] !== undefined);
      const typeCorrect = typeAnswered.filter((q) => answers[q.id]?.isCorrect);
      return {
        type,
        label: QUESTION_TYPE_LABELS[type],
        total: typeQuestions.length,
        answered: typeAnswered.length,
        correct: typeCorrect.length,
      };
    });
  }, [answers]);

  // Per-subject stats
  const subjectStats = useMemo(() => {
    const subjects: Subject[] = ['education', 'psychology'];
    return subjects.map((subject) => {
      const subjectQuestions = allQuestions.filter((q) => q.subject === subject);
      const subjectAnswered = subjectQuestions.filter((q) => answers[q.id] !== undefined);
      const subjectCorrect = subjectAnswered.filter((q) => answers[q.id]?.isCorrect);
      return {
        subject,
        label: SUBJECT_LABELS[subject],
        total: subjectQuestions.length,
        answered: subjectAnswered.length,
        correct: subjectCorrect.length,
      };
    });
  }, [answers]);

  return (
    <div className="space-y-4">
      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
            <p className="text-xs text-gray-500 mt-1">已答题数</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-gray-500 mt-1">答对题数</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{wrongIds.length}</p>
            <p className="text-xs text-gray-500 mt-1">错题数</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
            <p className="text-xs text-gray-500 mt-1">总正确率</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">总体进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{answeredCount} / {totalQuestions} 题</span>
            <span className="text-sm font-medium text-blue-600">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Choice accuracy */}
      {choiceAnsweredCount > 0 && (
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">选择题正确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{choiceCorrectCount} / {choiceAnsweredCount} 题</span>
              <span className="text-sm font-medium text-green-600">{choiceAccuracy}%</span>
            </div>
            <Progress value={choiceAccuracy} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Per subject */}
      <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">科目完成情况</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjectStats.map((s) => {
            const pct = s.total > 0 ? Math.round((s.answered / s.total) * 100) : 0;
            return (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{s.label}</span>
                  <span className="text-xs text-gray-500">{s.answered}/{s.total} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Per type */}
      <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">题型完成情况</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-600 font-medium">题型</th>
                  <th className="text-center py-2 text-gray-600 font-medium">已答</th>
                  <th className="text-center py-2 text-gray-600 font-medium">正确</th>
                  <th className="text-center py-2 text-gray-600 font-medium">正确率</th>
                </tr>
              </thead>
              <tbody>
                {typeStats.map((t) => {
                  const acc = t.answered > 0 ? Math.round((t.correct / t.answered) * 100) : '-';
                  return (
                    <tr key={t.type} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-700">{t.label}</td>
                      <td className="py-2.5 text-center text-gray-600">{t.answered}/{t.total}</td>
                      <td className="py-2.5 text-center text-green-600">{t.correct}</td>
                      <td className="py-2.5 text-center text-blue-600 font-medium">{acc}{typeof acc === 'number' ? '%' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card className="border-red-100 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">重置进度</p>
              <p className="text-xs text-gray-500 mt-0.5">清除所有答题记录和错题数据</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm('确定要重置所有进度吗？此操作不可撤销。')) {
                  resetProgress();
                }
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================== Countdown Timer ======================== */
function CountdownTimer() {
  const {
    examMode, examRemainingSeconds, examFinished, examPaused,
    togglePauseExam, endExam,
  } = useQuiz();

  if (examMode !== 'exam' || examFinished) return null;

  const hours = Math.floor(examRemainingSeconds / 3600);
  const minutes = Math.floor((examRemainingSeconds % 3600) / 60);
  const seconds = examRemainingSeconds % 60;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = examRemainingSeconds <= 600; // Last 10 minutes

  return (
    <div className={`sticky top-[105px] z-40 flex items-center justify-between px-4 py-3 border-b transition-all ${
      isWarning ? 'bg-gradient-to-r from-rose-50/80 to-red-50/60 border-rose-200/60 backdrop-blur-sm' : 'bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border-indigo-100/50 backdrop-blur-sm'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isWarning ? 'bg-rose-100' : 'bg-indigo-100'}`}>
          <Clock className={`h-3.5 w-3.5 ${isWarning ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`} />
        </div>
        <span className={`text-sm font-semibold ${isWarning ? 'text-rose-600' : 'text-indigo-600'}`}>
          考试模式
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isWarning ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
        }`}>
          {isWarning ? '即将结束!' : '进行中'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-mono text-lg font-bold tracking-wider ${
          isWarning ? 'text-rose-500' : 'text-indigo-600'
        }`}>
          {timeStr}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePauseExam}
            className={`h-7 px-2 rounded-lg ${examPaused ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-50'}`}
            title={examPaused ? '继续' : '暂停'}
          >
            {examPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('确定要提前交卷吗？')) {
                endExam();
              }
            }}
            className="h-7 px-2 text-rose-400 hover:bg-rose-50 rounded-lg"
            title="提前交卷"
          >
            交卷
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ======================== Mode Selection Dialog ======================== */
function ModeSelectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { startExam, setExamMode } = useQuiz();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-[90%] max-w-md border-blue-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Timer className="h-7 w-7 text-blue-600" />
          </div>
          <CardTitle className="text-lg">选择答题模式</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            选择适合你的练习方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <button
            onClick={() => {
              setExamMode('practice');
              onClose();
            }}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 group-hover:text-blue-700">练习模式</p>
                <p className="text-xs text-gray-500 mt-0.5">无时间限制，自由练习，适合日常刷题</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('开始考试模式将清除当前答题记录并开始2小时倒计时，确定开始吗？')) {
                startExam();
                onClose();
              }
            }}
            className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 group-hover:text-blue-700">考试模式</p>
                <p className="text-xs text-gray-500 mt-0.5">120分钟倒计时，模拟真实考试环境</p>
              </div>
            </div>
          </button>

          <Button
            variant="ghost"
            className="w-full text-gray-500 text-sm"
            onClick={onClose}
          >
            取消
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================== Exam Results ======================== */
function ExamResults() {
  const {
    answers, exitExamMode, elapsedSeconds,
    answeredCount, correctCount, choiceCorrectCount, choiceAnsweredCount, wrongIds,
  } = useQuiz();

  const totalQuestions = allQuestions.length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const choiceAccuracy = choiceAnsweredCount > 0 ? Math.round((choiceCorrectCount / choiceAnsweredCount) * 100) : 0;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;

  // Per-subject stats
  const subjectStats = useMemo(() => {
    const subjects: Subject[] = ['education', 'psychology'];
    return subjects.map((subject) => {
      const subjectQuestions = allQuestions.filter((q) => q.subject === subject);
      const subjectAnswered = subjectQuestions.filter((q) => answers[q.id] !== undefined);
      const subjectCorrect = subjectAnswered.filter((q) => answers[q.id]?.isCorrect);
      return {
        subject,
        label: SUBJECT_LABELS[subject],
        total: subjectQuestions.length,
        answered: subjectAnswered.length,
        correct: subjectCorrect.length,
      };
    });
  }, [answers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">考试结束</h1>
          <p className="text-gray-500">以下是你的考试成绩报告</p>
        </div>

        {/* Time used */}
        <Card className="border-blue-200 shadow-sm mb-4">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-medium">本次用时：</span>
              <span className="text-2xl font-bold font-mono">
                {elapsedMinutes}分{String(elapsedSecs).padStart(2, '0')}秒
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Score cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
              <p className="text-xs text-gray-500 mt-1">已答题数</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-xs text-gray-500 mt-1">答对题数</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{wrongIds.length}</p>
              <p className="text-xs text-gray-500 mt-1">错题数</p>
            </CardContent>
          </Card>
          <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">总正确率</p>
            </CardContent>
          </Card>
        </div>

        {/* Choice accuracy */}
        {choiceAnsweredCount > 0 && (
          <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                选择题正确率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{choiceCorrectCount} / {choiceAnsweredCount} 题</span>
                <span className="text-sm font-medium text-green-600">{choiceAccuracy}%</span>
              </div>
              <Progress value={choiceAccuracy} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Subject breakdown */}
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">科目完成情况</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectStats.map((s) => {
              const pct = s.total > 0 ? Math.round((s.answered / s.total) * 100) : 0;
              const acc = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0;
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{s.label}</span>
                    <span className="text-xs text-gray-500">
                      已答 {s.answered}/{s.total} | 正确率 {acc}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Per-question results */}
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">每题作答详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allQuestions.map((q, idx) => {
                const record = answers[q.id];
                let bgClass = 'bg-gray-100 text-gray-500 border border-gray-200';
                let icon = null;
                let statusText = '未答';

                if (record) {
                  if (record.isCorrect) {
                    bgClass = 'bg-green-100 text-green-700 border border-green-300';
                    icon = <CheckCircle2 className="h-3 w-3 text-green-600" />;
                    statusText = '答对';
                  } else {
                    bgClass = 'bg-red-100 text-red-700 border border-red-300';
                    icon = <XCircle className="h-3 w-3 text-red-500" />;
                    statusText = '答错';
                  }
                }

                return (
                  <div
                    key={q.id}
                    className={`relative w-9 h-9 rounded-md text-xs font-medium flex items-center justify-center ${bgClass}`}
                    title={`第${idx + 1}题 - ${statusText}`}
                  >
                    {icon || idx + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300 inline-block" />
                未作答
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                答对
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                答错
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={exitExamMode}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            返回练习模式
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => {
              exitExamMode();
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            查看错题本
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ======================== Main Content ======================== */
function MainContent() {
  const { view } = useQuiz();

  switch (view) {
    case 'practice':
      return (
        <div className="space-y-5">
          <FilterBar />
          <QuestionCard />
          <QuestionNavigator />
        </div>
      );
    case 'wrong_book':
      return <WrongBook />;
    case 'progress':
      return <ProgressPanel />;
  }
}

/* ======================== Paused Overlay ======================== */
function PausedOverlay() {
  const { togglePauseExam } = useQuiz();
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-[90%] max-w-sm border-blue-200 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <Pause className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">考试已暂停</h2>
          <p className="text-sm text-gray-500 mb-6">倒计时已暂停，点击下方按钮继续</p>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={togglePauseExam}
          >
            <Play className="h-4 w-4 mr-2" />
            继续答题
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================== App Shell ======================== */
function AppShell() {
  const { view, setView, answeredCount, wrongIds, examMode, examFinished, examPaused, autoAdvance, setAutoAdvance } = useQuiz();
  const [showModeDialog, setShowModeDialog] = useState(false);

  // If exam is finished, show results
  if (examMode === 'exam' && examFinished) {
    return <ExamResults />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">教育理论刷题</h1>
                <p className="text-xs text-gray-400">2026河南专升本</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-advance toggle */}
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  autoAdvance
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
                title={autoAdvance ? '点击关闭自动跳题' : '点击开启自动跳题'}
              >
                <span className={`w-6 h-3.5 rounded-full relative transition-colors ${
                  autoAdvance ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-transform ${
                    autoAdvance ? 'left-3' : 'left-0.5'
                  }`} />
                </span>
                <span className="hidden sm:inline">{autoAdvance ? '自动跳题' : '手动'}</span>
              </button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => setShowModeDialog(true)}
              >
                <Timer className="h-3 w-3 mr-1" />
                {examMode === 'exam' ? '考试中' : '切换模式'}
              </Button>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="hidden sm:inline">
                  <ListChecks className="h-3 w-3 inline mr-1" />
                  已答 {answeredCount} 题
                </span>
                {wrongIds.length > 0 && (
                  <span className="text-red-500">
                    <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                    {wrongIds.length} 错题
                  </span>
                )}
              </div>
            </div>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList className="w-full bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-1 rounded-xl border border-indigo-100/50">
              <TabsTrigger value="practice" className="flex-1 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                刷题练习
              </TabsTrigger>
              <TabsTrigger value="wrong_book" className="flex-1 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 relative">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                错题本
                {wrongIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-400 to-red-500 text-white text-[10px] rounded-full flex items-center justify-center shadow-sm">
                    {wrongIds.length > 9 ? '9+' : wrongIds.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex-1 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                学习进度
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Countdown Timer (exam mode only) */}
      <CountdownTimer />

      {/* Paused overlay */}
      {examMode === 'exam' && examPaused && !examFinished && <PausedOverlay />}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-10">
        <MainContent />
      </main>

      {/* Mode Selection Dialog */}
      <ModeSelectionDialog open={showModeDialog} onClose={() => setShowModeDialog(false)} />
    </div>
  );
}

/* ======================== Page Export ======================== */
export default function Home() {
  return (
    <QuizProvider>
      <AppShell />
    </QuizProvider>
  );
}
