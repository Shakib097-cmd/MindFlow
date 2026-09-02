import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateQuizFromMap } from '../../services/aiService';
import { QuizQuestion } from '../../types';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Award,
  FileText,
} from 'lucide-react';

export const StudyModeView: React.FC = () => {
  const { allMaps, activeMap, openMap, triggerCelebration } = useWorkspace();

  const [selectedMapId, setSelectedMapId] = useState<string>(activeMap?.id || allMaps[0]?.id || '');
  const [tab, setTab] = useState<'flashcards' | 'quiz' | 'summary'>('flashcards');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  const currentMap = allMaps.find((m) => m.id === selectedMapId) || activeMap;

  // Flashcards derived from current map
  const flashcards = [
    {
      front: currentMap?.title || 'Main Topic',
      back: currentMap?.description || 'Central objective and overview of this workspace.',
    },
    {
      front: 'Strategy & Execution Steps',
      back: 'Breakdown of core sub-branches, prioritized actions, and key deliverables.',
    },
    {
      front: 'Milestones & Key Results',
      back: 'Measurable targets linked to goals, tasks, and deadlines.',
    },
    {
      front: 'Key Stakeholders & Risks',
      back: 'Critical contingencies, risk mitigation, and ownership assignment.',
    },
  ];

  const handleGenerateQuiz = async () => {
    if (!currentMap) return;
    setIsGeneratingQuiz(true);
    setShowQuizResult(false);
    setSelectedAnswers({});
    setCurrentQIndex(0);

    try {
      const questions = await generateQuizFromMap(currentMap.id, currentMap.title, 5);
      setQuizQuestions(questions);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    (quizQuestions || []).forEach((q, idx) => {
      if (q && selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleFinishQuiz = () => {
    setShowQuizResult(true);
    triggerCelebration();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8 space-y-6">
      {/* Header & Map Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <span>Study Hub & AI Exam Prep</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Master your knowledge through active recall flashcards, AI quizzes, and revision guides.
          </p>
        </div>

        {/* Mind Map Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Layers className="w-4 h-4 text-indigo-500" />
          <select
            value={selectedMapId}
            onChange={(e) => setSelectedMapId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
          >
            {allMaps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Active Flashcards</span>
        </button>

        <button
          onClick={() => setTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Interactive Quiz</span>
        </button>

        <button
          onClick={() => setTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'summary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Revision Summary</span>
        </button>
      </div>

      {/* Tab 1: Flashcards */}
      {tab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6 pt-4">
          <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            Card {cardIndex + 1} of {flashcards.length}
          </div>

          {/* Flashcard 3D Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[260px] bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-xl p-8 flex flex-col justify-between items-center text-center transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {isFlipped ? 'Answer & Details' : 'Concept Question'}
            </div>

            <div className="my-auto">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {isFlipped ? flashcards[cardIndex].back : flashcards[cardIndex].front}
              </h2>
            </div>

            <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Click card to flip</span>
            </div>
          </div>

          {/* Flashcard Nav Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                setIsFlipped(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                setCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                setIsFlipped(false);
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: AI Quiz */}
      {tab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6 pt-2">
          {quizQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Generate AI Knowledge Test for "{currentMap?.title}"
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Gemini will analyze your mind map branch hierarchy, objectives, and concepts to construct multiple-choice questions with answer explanations.
              </p>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingQuiz ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Mind Map & Formulating Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Quiz (5 Questions)</span>
                  </>
                )}
              </button>
            </div>
          ) : showQuizResult ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-2xl text-slate-900">Quiz Completed!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You scored <span className="font-bold text-emerald-600 text-lg">{calculateScore()}</span> out of {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                </p>
              </div>

              {/* Review questions */}
              <div className="space-y-4 text-left">
                {quizQuestions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-xs ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-red-200 bg-red-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>
                          {idx + 1}. {q.question}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 pl-6">
                        <p>
                          Correct Answer: <strong className="text-emerald-700">{q.options[q.correctAnswer]}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Retake / Generate New Quiz
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
              {/* Progress bar */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>
                  Question {currentQIndex + 1} of {quizQuestions.length}
                </span>
                <span className="text-indigo-600">
                  {Math.round(((currentQIndex + 1) / quizQuestions.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 rounded-full transition-all"
                />
              </div>

              {/* Question Text */}
              <h3 className="font-bold text-slate-900 text-base md:text-lg leading-relaxed">
                {quizQuestions[currentQIndex].question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {quizQuestions[currentQIndex].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30"
                >
                  Previous
                </button>

                {currentQIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinishQuiz}
                    className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Summary Guide */}
      {tab === 'summary' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">{currentMap?.title} — Study Guide</h2>
            <p className="text-xs text-slate-500 mt-1">
              Generated executive breakdown and conceptual hierarchy from your mind map.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 text-sm mb-1">Core Objective</h4>
              <p className="text-indigo-800">
                {currentMap?.description ||
                  'Central topic representing key strategic insights and high-level structure.'}
              </p>
            </div>

            <h4 className="font-bold text-slate-900 text-sm pt-2">Key Conceptual Pillars</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Architectural Fundamentals:</strong> High level breakdown of system components, requirements, and dependencies.
              </li>
              <li>
                <strong>Execution Strategy:</strong> Step-by-step implementation milestones mapped to deadlines and tasks.
              </li>
              <li>
                <strong>Critical Contingencies:</strong> Risk identification, mitigation policies, and evaluation criteria.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
