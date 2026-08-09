'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { fillQuestions, FILL_YEARS, type FillQuestion } from '@/data/fill-questions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Brain,
  ListChecks,
  Eye,
  EyeOff,
  RotateCcw,
  Pencil,
  Lightbulb,
} from 'lucide-react';

type SubjectFilter = 'all' | 'education' | 'psychology';
type FeedbackMode = 'instant' | 'unified';

const SUBJECT_LABELS: Record<string, string> = {
  education: '教育学',
  psychology: '心理学',
};

/* ======================== Fill Practice Page ======================== */
export default function FillPracticePage() {
  const [year, setYear] = useState(2026);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('instant');

  // Filter questions by year and subject
  const questions = useMemo(() => {
    let filtered = fillQuestions.filter((q) => q.year === year);
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((q) => q.subject === subjectFilter);
    }
    return filtered;
  }, [year, subjectFilter]);

  const currentQuestion = questions[currentIndex];

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [year, subjectFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => submittedIds.has(q.id)).length;
    const correct = questions.filter((q) => {
      if (!submittedIds.has(q.id)) return false;
      const userAns = (userAnswers[q.id] || '').trim();
      const correctAns = q.answer.trim();
      // Flexible matching - check if user answer contains the key part
      return correctAns.split(/[\/或、,，]/).some((part) => {
        const p = part.trim();
        return p && (userAns.includes(p) || p.includes(userAns));
      });
    }).length;
    return { total, answered, correct };
  }, [questions, submittedIds, userAnswers]);

  const handleInputChange = (value: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    setSubmittedIds((prev) => new Set([...prev, currentQuestion.id]));
    setShowAnswer((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  // Instant feedback: submit and auto-advance
  const handleInstantSubmit = () => {
    if (!currentQuestion) return;
    const userAns = (userAnswers[currentQuestion.id] || '').trim();
    if (!userAns) return; // Don't submit empty answer
    setSubmittedIds((prev) => new Set([...prev, currentQuestion.id]));
    setShowAnswer((prev) => ({ ...prev, [currentQuestion.id]: true }));
    // Auto-advance after a short delay so user can see the result
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }, 1500);
  };

  // Unified mode: submit all unanswered questions
  const handleSubmitAll = () => {
    const newSubmitted = new Set(submittedIds);
    const newShowAnswer = { ...showAnswer };
    questions.forEach((q) => {
      if (!newSubmitted.has(q.id)) {
        newSubmitted.add(q.id);
        newShowAnswer[q.id] = true;
      }
    });
    setSubmittedIds(newSubmitted);
    setShowAnswer(newShowAnswer);
  };

  // Handle Enter key for instant mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && feedbackMode === 'instant') {
      handleInstantSubmit();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
    setShowNavigator(false);
  };

  const handleReset = () => {
    const ids = new Set(questions.map((q) => q.id));
    setUserAnswers((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    setSubmittedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setShowAnswer((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  };

  const isCorrect = (q: FillQuestion) => {
    const userAns = (userAnswers[q.id] || '').trim();
    if (!userAns) return null;
    const correctAns = q.answer.trim();
    return correctAns.split(/[\/或、,，]/).some((part) => {
      const p = part.trim();
      return p && (userAns.includes(p) || p.includes(userAns));
    });
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">暂无题目数据</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-4 w-4 text-indigo-500" />
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">填空专项练习</h1>
                  <p className="text-xs text-gray-400">2014-2026年真题</p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                <ListChecks className="h-3 w-3 inline mr-1" />
                已答 {stats.answered}/{stats.total}
              </span>
              {stats.correct > 0 && (
                <span className="text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3 inline mr-0.5" />
                  {stats.correct} 正确
                </span>
              )}
            </div>
          </div>

          {/* Feedback mode toggle */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeedbackMode('instant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  feedbackMode === 'instant'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Lightbulb className="h-3 w-3" />
                即时反馈
              </button>
              <button
                onClick={() => setFeedbackMode('unified')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  feedbackMode === 'unified'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <ListChecks className="h-3 w-3" />
                统一提交
              </button>
            </div>
            <span className="text-xs text-gray-400">
              {feedbackMode === 'instant' ? '答完即判，自动跳题' : '全部答完后统一判分'}
            </span>
          </div>

          {/* Year selector - collapsible */}
          <div className="relative mb-3">
            <button
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-all"
            >
              <span>{year}年</span>
              {yearDropdownOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {yearDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-lg shadow-emerald-100/50 border border-emerald-100 p-1.5 min-w-[80px] max-h-[240px] overflow-y-auto">
                {FILL_YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setYearDropdownOpen(false); }}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                      year === y
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {y}年
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <div className="flex gap-1.5">
              {(['all', 'education', 'psychology'] as SubjectFilter[]).map((s) => (
                <Badge
                  key={s}
                  variant={subjectFilter === s ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all rounded-lg text-xs ${
                    subjectFilter === s
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none shadow-sm'
                      : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                  }`}
                  onClick={() => setSubjectFilter(s)}
                >
                  {s === 'all' ? '全部' : s === 'education' ? '教育学' : '心理学'}
                </Badge>
              ))}
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                <ListChecks className="h-3.5 w-3.5 mr-1" />
                题号
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Question Navigator */}
      {showNavigator && (
        <Card className="max-w-3xl mx-auto mt-4 border-indigo-100/60 shadow-lg rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">题号导航</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500" onClick={() => setShowNavigator(false)}>
                关闭
              </Button>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {questions.map((q, idx) => {
                const correct = isCorrect(q);
                const isAnswered = submittedIds.has(q.id);
                const isCurrent = idx === currentIndex;
                let bgClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                if (isCurrent) bgClass = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm';
                else if (isAnswered && correct === true) bgClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                else if (isAnswered && correct === false) bgClass = 'bg-red-100 text-red-700 border border-red-200';
                else if (isAnswered) bgClass = 'bg-blue-100 text-blue-700 border border-blue-200';

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpTo(idx)}
                    className={`h-7 rounded-md text-xs font-medium transition-all ${bgClass}`}
                  >
                    {q.questionId}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-3">
          <Progress value={(stats.answered / stats.total) * 100} className="flex-1 h-2" />
          <span className="text-xs text-gray-500 whitespace-nowrap">{stats.answered}/{stats.total} 题</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        {/* Question Card */}
        <Card className="border-indigo-100/60 shadow-lg shadow-indigo-100/20 overflow-hidden rounded-2xl">
          <CardContent className="pt-5">
            {/* Question header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                currentQuestion.subject === 'education'
                  ? 'bg-gradient-to-br from-indigo-100 to-purple-100'
                  : 'bg-gradient-to-br from-emerald-100 to-teal-100'
              }`}>
                {currentQuestion.subject === 'education' ? (
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                ) : (
                  <Brain className="h-3.5 w-3.5 text-emerald-500" />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-600">
                {SUBJECT_LABELS[currentQuestion.subject]}
              </span>
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-500 ml-auto">
                {currentIndex + 1} / {questions.length}
              </Badge>
            </div>

            {/* Question text */}
            <div className="mb-5 p-4 bg-gradient-to-br from-gray-50/80 to-indigo-50/30 rounded-xl border border-gray-100/60">
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">你的答案：</span>
                {submittedIds.has(currentQuestion.id) && (
                  <Badge
                    variant={isCorrect(currentQuestion) ? 'default' : 'destructive'}
                    className={`text-xs rounded-lg ${
                      isCorrect(currentQuestion)
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isCorrect(currentQuestion) ? '正确' : '错误'}
                  </Badge>
                )}
              </div>
              <Input
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="请输入你的答案..."
                className={`rounded-xl border-2 transition-colors ${
                  submittedIds.has(currentQuestion.id)
                    ? isCorrect(currentQuestion)
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-red-300 bg-red-50/30'
                    : 'border-gray-200 focus:border-emerald-300'
                }`}
                disabled={submittedIds.has(currentQuestion.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !submittedIds.has(currentQuestion.id)) {
                    if (feedbackMode === 'instant') {
                      handleInstantSubmit();
                    } else {
                      handleSubmit();
                    }
                  }
                }}
              />

              {/* Submit button */}
              {!submittedIds.has(currentQuestion.id) && (
                <Button
                  onClick={feedbackMode === 'instant' ? handleInstantSubmit : handleSubmit}
                  disabled={!userAnswers[currentQuestion.id]?.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-sm shadow-emerald-200"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {feedbackMode === 'instant' ? '提交并判分' : '提交答案'}
                </Button>
              )}

              {/* Show answer */}
              {submittedIds.has(currentQuestion.id) && (
                <div className="space-y-3">
                  {/* Toggle answer visibility */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500"
                    onClick={() => setShowAnswer((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                  >
                    {showAnswer[currentQuestion.id] ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 mr-1" />
                        收起答案
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        查看答案
                      </>
                    )}
                  </Button>

                  {showAnswer[currentQuestion.id] && (
                    <>
                      {/* Correct answer */}
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-700">正确答案</span>
                        </div>
                        <p className="text-base text-emerald-800 font-medium">{currentQuestion.answer}</p>
                      </div>

                      {/* Explanation */}
                      {currentQuestion.explanation && (
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-700">解析</span>
                          </div>
                          <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一题
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            下一题
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Submit All button for unified mode */}
        {feedbackMode === 'unified' && stats.answered < stats.total && (
          <Button
            onClick={handleSubmitAll}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-sm shadow-emerald-200 py-5 text-base font-medium"
          >
            <ListChecks className="h-5 w-5 mr-2" />
            统一提交全部答案（还有 {stats.total - stats.answered} 题未答）
          </Button>
        )}

        {/* Results summary for unified mode after submit all */}
        {feedbackMode === 'unified' && stats.answered === stats.total && stats.total > 0 && (
          <Card className="mt-4 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
            <CardContent className="pt-5">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  {stats.correct >= stats.total * 0.8 ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <Lightbulb className="h-6 w-6 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">练习完成！</h3>
                <p className="text-sm text-gray-600">
                  共 {stats.total} 题，答对 <span className="text-emerald-600 font-bold">{stats.correct}</span> 题，
                  正确率 <span className="text-emerald-600 font-bold">{Math.round((stats.correct / stats.total) * 100)}%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="mt-6 border-indigo-100/60 shadow-lg shadow-indigo-100/20 overflow-hidden rounded-2xl">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <span className="text-sm font-semibold text-gray-600">练习统计</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">总题数</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{stats.correct}</p>
                <p className="text-xs text-gray-500 mt-1">答对</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">正确率</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
