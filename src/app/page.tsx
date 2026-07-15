'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

/* ======================== Filter Bar ======================== */
function FilterBar() {
  const { subjectFilter, setSubjectFilter, typeFilter, setTypeFilter } = useQuiz();

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
        </div>
        <div className="space-y-3">
          {/* Subject filter */}
          <div>
            <span className="text-xs text-gray-500 mb-1.5 block">科目</span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={subjectFilter === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${subjectFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setSubjectFilter('all')}
              >
                全部
              </Badge>
              <Badge
                variant={subjectFilter === 'education' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${subjectFilter === 'education' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setSubjectFilter('education')}
              >
                <GraduationCap className="h-3 w-3 mr-1" />
                教育学
              </Badge>
              <Badge
                variant={subjectFilter === 'psychology' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${subjectFilter === 'psychology' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setSubjectFilter('psychology')}
              >
                <Brain className="h-3 w-3 mr-1" />
                心理学
              </Badge>
            </div>
          </div>
          {/* Type filter */}
          <div>
            <span className="text-xs text-gray-500 mb-1.5 block">题型</span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${typeFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
                onClick={() => setTypeFilter('all')}
              >
                全部
              </Badge>
              {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={typeFilter === key ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${typeFilter === key ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
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
  const { submitAnswer, answers } = useQuiz();
  const [selected, setSelected] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const record = answers[question.id];
  const isAnswered = record !== undefined;
  const userAnswer = record?.userAnswer || selected;
  const isCorrect = record?.isCorrect;

  const handleSelect = (value: string) => {
    if (isAnswered) return;
    setSelected(value);
  };

  const handleSubmit = () => {
    if (!selected || isAnswered) return;
    const correct = selected.trim().toUpperCase() === question.answer.trim().toUpperCase();
    submitAnswer(question.id, selected, correct);
    setShowResult(true);
  };

  const optionLetter = (opt: string): string => {
    const match = opt.match(/^([A-Da-d])/);
    return match ? match[1].toUpperCase() : '';
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={userAnswer} onValueChange={handleSelect} className="space-y-2">
        {question.options?.map((opt, idx) => {
          const letter = optionLetter(opt);
          const isSelected = userAnswer === letter;
          const isCorrectOption = letter === question.answer;
          let borderColor = 'border-gray-200';
          let bgColor = 'bg-white';

          if (isAnswered || showResult) {
            if (isCorrectOption) {
              borderColor = 'border-green-500';
              bgColor = 'bg-green-50';
            } else if (isSelected && !isCorrect) {
              borderColor = 'border-red-500';
              bgColor = 'bg-red-50';
            }
          } else if (isSelected) {
            borderColor = 'border-blue-500';
            bgColor = 'bg-blue-50';
          }

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${borderColor} ${bgColor} ${!isAnswered ? 'hover:border-blue-300' : ''}`}
              onClick={() => handleSelect(letter)}
            >
              <RadioGroupItem value={letter} id={`opt-${question.id}-${idx}`} className="shrink-0" />
              <Label htmlFor={`opt-${question.id}-${idx}`} className="flex-1 cursor-pointer text-sm leading-relaxed">
                {opt}
              </Label>
              {(isAnswered || showResult) && isCorrectOption && (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              )}
              {(isAnswered || showResult) && isSelected && !isCorrect && (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
            </div>
          );
        })}
      </RadioGroup>

      {!isAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          提交答案
        </Button>
      )}

      {(isAnswered || showResult) && (
        <div className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
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
  const { submitAnswer, answers } = useQuiz();
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selfEval, setSelfEval] = useState<'correct' | 'wrong' | null>(null);

  const record = answers[question.id];
  const isAnswered = record !== undefined;

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
  const { getCurrentQuestion, filteredQuestions, currentIndex, answers } = useQuiz();
  const question = getCurrentQuestion();

  if (!question) {
    return (
      <Card className="border-blue-100 shadow-sm">
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

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
              {subjectLabel}
            </Badge>
            <Badge variant="outline" className="text-gray-600 border-gray-200">
              {typeLabel}
            </Badge>
            {isAnswered && (
              <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                已答
              </Badge>
            )}
          </div>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
        </div>
        <CardTitle className="text-base font-medium text-gray-800 leading-relaxed mt-3">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.type === 'choice' ? (
          <ChoiceQuestion question={question} answered={isAnswered} />
        ) : (
          <TextQuestion question={question} />
        )}
      </CardContent>
    </Card>
  );
}

/* ======================== Question Navigator ======================== */
function QuestionNavigator() {
  const { filteredQuestions, currentIndex, goToQuestion, goToPrev, goToNext, answers } = useQuiz();

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">题目导航</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filteredQuestions.map((q, idx) => {
            const record = answers[q.id];
            let bgClass = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
            if (record) {
              bgClass = record.isCorrect
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200';
            }
            if (idx === currentIndex) {
              bgClass = 'bg-blue-600 text-white ring-2 ring-blue-300';
            }
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${bgClass}`}
              >
                {idx + 1}
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
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一题
          </Button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex >= filteredQuestions.length - 1}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
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
      <Card className="border-blue-100 shadow-sm">
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
                    <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-xs">
                      {SUBJECT_LABELS[q.subject]}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600 border-gray-200 text-xs">
                      {QUESTION_TYPE_LABELS[q.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{q.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="shrink-0 text-blue-600"
                >
                  {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                  {record && (
                    <p className="text-sm">
                      <span className="text-gray-500">你的答案：</span>
                      <span className="text-red-600 font-medium">{record.userAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-gray-500">正确答案：</span>
                    <span className="text-green-600 font-medium">
                      {q.type === 'choice' ? q.answer : q.answer.slice(0, 100) + (q.answer.length > 100 ? '...' : '')}
                    </span>
                  </p>
                  {q.explanation && (
                    <p className="text-sm text-gray-600">{q.explanation}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-200 hover:bg-green-50 mt-2"
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
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
            <p className="text-xs text-gray-500 mt-1">已答题数</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-gray-500 mt-1">答对题数</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{wrongIds.length}</p>
            <p className="text-xs text-gray-500 mt-1">错题数</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
            <p className="text-xs text-gray-500 mt-1">总正确率</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <Card className="border-blue-100 shadow-sm">
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
        <Card className="border-blue-100 shadow-sm">
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
      <Card className="border-blue-100 shadow-sm">
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
      <Card className="border-blue-100 shadow-sm">
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

/* ======================== Main Content ======================== */
function MainContent() {
  const { view } = useQuiz();

  switch (view) {
    case 'practice':
      return (
        <div className="space-y-4">
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

/* ======================== App Shell ======================== */
function AppShell() {
  const { view, setView, answeredCount, wrongIds } = useQuiz();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-800 leading-tight">教育理论刷题</h1>
                <p className="text-xs text-gray-500">2026河南专升本</p>
              </div>
            </div>
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
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList className="w-full bg-gray-100 p-1">
              <TabsTrigger value="practice" className="flex-1 text-sm">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                刷题练习
              </TabsTrigger>
              <TabsTrigger value="wrong_book" className="flex-1 text-sm relative">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                错题本
                {wrongIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {wrongIds.length > 9 ? '9+' : wrongIds.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex-1 text-sm">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                学习进度
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 pb-8">
        <MainContent />
      </main>
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
