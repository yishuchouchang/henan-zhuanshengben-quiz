"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, Eye, EyeOff, CheckCircle2, List } from "lucide-react";
import { subjectiveQuestions, chapters } from "@/data/subjective-questions";
import { cn } from "@/lib/utils";

export default function SubjectivePage() {
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterExpanded, setChapterExpanded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [navExpanded, setNavExpanded] = useState(false);

  const filteredQuestions = useMemo(() => {
    return subjectiveQuestions.filter((q) => q.chapterId === selectedChapter);
  }, [selectedChapter]);

  const currentQuestion = filteredQuestions[currentIdx];

  useEffect(() => {
    setCurrentIdx(0);
    setShowAnswer(false);
  }, [selectedChapter]);

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setChapterExpanded(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (currentQuestion) {
      setAnsweredIds((prev) => new Set(prev).add(currentQuestion.id));
    }
  };

  const handleNext = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowAnswer(false);
    }
  };

  const handleJumpTo = (idx: number) => {
    setCurrentIdx(idx);
    setShowAnswer(false);
    setNavExpanded(false);
  };

  const chapterProgress = useMemo(() => {
    const chapterQs = subjectiveQuestions.filter((q) => q.chapterId === selectedChapter);
    const answered = chapterQs.filter((q) => answeredIds.has(q.id)).length;
    return { total: chapterQs.length, answered };
  }, [selectedChapter, answeredIds]);

  const totalProgress = useMemo(() => {
    return { total: subjectiveQuestions.length, answered: answeredIds.size };
  }, [answeredIds]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">暂无题目数据</p>
      </div>
    );
  }

  const selectedChapterInfo = chapters.find((c) => c.id === selectedChapter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
            <h1 className="text-base font-semibold text-gray-800">主观题训练</h1>
            <div className="text-xs text-gray-400">
              {totalProgress.answered}/{totalProgress.total}
            </div>
          </div>

          {/* Chapter Selector - Collapsible */}
          <div className="relative">
            <button
              onClick={() => setChapterExpanded(!chapterExpanded)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <span className="font-medium text-sm">
                {selectedChapterInfo?.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-80">
                  {chapterProgress.answered}/{chapterProgress.total}
                </span>
                {chapterExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {chapterExpanded && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(ch.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-center justify-between hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0",
                      ch.id === selectedChapter && "bg-amber-50"
                    )}
                  >
                    <span className="text-sm text-gray-700">{ch.title}</span>
                    <span className="text-xs text-gray-400">{ch.questionCount}题</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          {/* Question Header */}
          <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-600 font-medium">
                第 {currentIdx + 1} / {filteredQuestions.length} 题
              </span>
              <span className="text-xs text-gray-400">
                {answeredIds.has(currentQuestion.id) && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" />
                    已查看
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-5">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm font-medium flex items-center justify-center">
                {currentIdx + 1}
              </span>
              <p className="flex-1 text-gray-800 text-base leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="px-5 pb-5">
            {showAnswer ? (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    参考答案
                  </span>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    收起
                  </button>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentQuestion.answer}
                </div>
              </div>
            ) : (
              <button
                onClick={handleShowAnswer}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                显示答案
              </button>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              currentIdx === 0
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm"
            )}
          >
            上一题
          </button>
          <button
            onClick={() => setNavExpanded(!navExpanded)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center gap-1.5"
          >
            <List className="w-4 h-4" />
            题号
          </button>
          <button
            onClick={handleNext}
            disabled={currentIdx === filteredQuestions.length - 1}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              currentIdx === filteredQuestions.length - 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow-md"
            )}
          >
            下一题
          </button>
        </div>

        {/* Question Navigator Panel */}
        {navExpanded && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-amber-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">题号导航</span>
              <span className="text-xs text-gray-400">
                已答 {answeredIds.size}/{filteredQuestions.length}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {filteredQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleJumpTo(idx)}
                  className={cn(
                    "w-full aspect-square rounded-lg text-xs font-medium transition-all",
                    idx === currentIdx
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm"
                      : answeredIds.has(q.id)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
