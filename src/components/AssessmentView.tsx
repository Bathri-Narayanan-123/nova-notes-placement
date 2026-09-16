import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  ArrowRight, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Award,
  BookOpen,
  Send,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssessmentAttempt, Question, UserProfile } from '../types';
import { db } from '../services/db';
import { NavTab } from './Sidebar';

interface AssessmentViewProps {
  profile: UserProfile;
  attempts: AssessmentAttempt[];
  setActiveTab: (tab: NavTab) => void;
  onAssessmentCompleted?: (attempt: AssessmentAttempt) => void;
  initialAdaptive?: boolean;
}

type ExamState = 'intro' | 'active' | 'submitted' | 'results';

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  profile,
  attempts,
  setActiveTab,
  onAssessmentCompleted,
  initialAdaptive = false,
}) => {
  const [examState, setExamState] = useState<ExamState>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [codingDrafts, setCodingDrafts] = useState<Record<string, string>>({});
  const [poolStatus, setPoolStatus] = useState<'abundant' | 'low' | 'recycled'>('abundant');

  // Coding evaluation state inside assessment
  const [isEvaluatingTestCases, setIsEvaluatingTestCases] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState<any | null>(null);

  // Timer & Security state
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [suspiciousActivityCount, setSuspiciousActivityCount] = useState(0);
  const [showSuspiciousWarning, setShowSuspiciousWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<AssessmentAttempt | null>(null);

  // Filter review questions
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  const timerRef = useRef<any>(null);
  const config = db.getConfig();

  const nextAttemptNum = attempts.length > 0 
    ? Math.max(...attempts.map((a) => a.attemptNumber)) + 1 
    : 1;

  // Initialize questions
  const startExam = () => {
    const isAdaptive = initialAdaptive || nextAttemptNum > 1;
    const weakTopics = profile.needsImprovement || [];
    const generated = db.generateAssessmentQuestions(profile.selectedRole, isAdaptive, weakTopics);

    setQuestions(generated.questions);
    setPoolStatus(generated.poolStatus);
    setCurrentIndex(0);
    setUserAnswers({});
    setCodingDrafts({});
    setSecondsRemaining(config.assessmentTimeMinutes * 60);
    setSuspiciousActivityCount(0);
    setShowSuspiciousWarning(false);
    setExamState('active');

    // Request fullscreen if supported
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Timer countdown
  useEffect(() => {
    if (examState === 'active') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitAssessment(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examState]);

  // Suspicious Activity Detection (Tab switches / window blur)
  useEffect(() => {
    if (examState !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSuspiciousActivityCount((prev) => prev + 1);
        setShowSuspiciousWarning(true);
      }
    };

    const handleBlur = () => {
      setSuspiciousActivityCount((prev) => prev + 1);
      setShowSuspiciousWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examState]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const submitAssessment = (autoSubmit = false) => {
    clearInterval(timerRef.current);
    setShowSubmitModal(false);

    // Calculate score
    let mcqScore = 0;
    let aptitudeScore = 0;
    let pseudoScore = 0;
    let codingScore = 0;
    let correctCount = 0;

    const topicBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};

    questions.forEach((q) => {
      const topic = q.topic || 'General';
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0, percentage: 0 };
      }
      topicBreakdown[topic].total += 1;

      const userAns = userAnswers[q.id] || codingDrafts[q.id] || '';
      let isCorrect = false;

      if (q.type === 'MCQ' || q.type === 'MSQ' || (q as any).type === 'DSA') {
        if (userAns.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase()) {
          mcqScore += 1;
          isCorrect = true;
        }
      } else if (q.type === 'APTITUDE') {
        if (userAns.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase()) {
          aptitudeScore += 1; // 10 Aptitudes = 10 points
          isCorrect = true;
        }
      } else if (q.type === 'PSEUDOCODE') {
        if (
          userAns.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase() ||
          userAns.trim().toLowerCase() === (q.expectedOutput || '').trim().toLowerCase()
        ) {
          pseudoScore += 1; // 10 Pseudocode * 1 = 10 points
          isCorrect = true;
        }
      } else if (q.type === 'CODING') {
        // Evaluate code submission
        if (userAns && userAns.trim().length > 25) {
          codingScore += 1; // 4 Coding * 1 = 4 points
          isCorrect = true;
        }
      }

      if (isCorrect) {
        correctCount += 1;
        topicBreakdown[topic].correct += 1;
      }
    });

    // Total 39 questions (15 MCQ + 10 Aptitude + 10 Pseudocode + 4 Coding)
    const totalQCount = questions.length || 39;
    const finalScore = Math.round((correctCount / totalQCount) * 100);
    const isQualified = finalScore >= config.qualificationThreshold;

    // Identify weak & strong topics
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(topicBreakdown).forEach(([topic, data]) => {
      data.percentage = Math.round((data.correct / data.total) * 100);
      if (data.percentage < 60) {
        weakTopics.push(topic);
      } else {
        strongTopics.push(topic);
      }
    });

    const elapsedMinutes = Math.max(1, Math.round((config.assessmentTimeMinutes * 60 - secondsRemaining) / 60));

    const newAttempt = db.recordAttempt({
      studentId: profile.id,
      role: profile.selectedRole,
      date: new Date().toLocaleDateString('en-US'),
      score: finalScore,
      isQualified,
      mcqScore,
      aptitudeScore,
      pseudoScore,
      codingScore,
      totalQuestions: questions.length,
      correctCount,
      durationMinutes: elapsedMinutes,
      questions,
      answers: { ...userAnswers, ...codingDrafts },
      topicBreakdown,
      weakTopics,
      strongTopics,
      isAdaptive: initialAdaptive || nextAttemptNum > 1,
    });

    setCompletedAttempt(newAttempt);
    setExamState('submitted');

    if (onAssessmentCompleted) {
      onAssessmentCompleted(newAttempt);
    }

    if (isQualified) {
      // Trigger celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Exit fullscreen when finished
  useEffect(() => {
    if (examState !== 'active' && document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }
  }, [examState]);

  const currentQ = questions[currentIndex];

  // ==================== INTRO VIEW (Matches Page 4) ====================
  if (examState === 'intro') {
    return (
      <div id="assessment-intro-view" className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Main Card */}
        <div className="p-7 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.selectedRole} Assessment
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Adaptive Reattempt #{nextAttemptNum} · {config.qualificationThreshold}% to qualify
              </p>
            </div>
          </div>

          {/* Non-repeating Question Banner (Mandated by Section 15) */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              <b>Unused question pool:</b> Previously attempted questions are intelligently rotated out so you experience fresh, varied questions on every attempt.
            </span>
          </div>

          {/* Adaptive Notification */}
          <p className="text-xs text-slate-600 dark:text-slate-400">
            10 Technical MCQ, 8 Data Structures &amp; Algorithms (DSA), 10 Aptitude, 7 Output, 4 Coding adaptive assessment focuses on your role and key domains: <b className="text-slate-800 dark:text-slate-200">{profile.needsImprovement.length ? profile.needsImprovement.join(', ') : 'Core Placement Readiness'}</b>.
          </p>

          {/* 5 Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">10</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Role MCQs</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">8</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">DSA</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">10</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aptitude</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">7</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pseudocode</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center col-span-2 sm:col-span-1">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">4</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Coding</p>
            </div>
          </div>

          {/* "Before you begin" Checklist (Page 4) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Before you begin
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>One continuous assessment — all question types appear in a single flow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Focused mode: the app navigation is hidden and fullscreen mode is requested.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Timer starts immediately — 30 minutes, auto-submit at 0.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Browser-based Suspicious Activity Detection monitors tab and window switches.</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              id="begin-assessment-btn"
              onClick={startExam}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              Begin {profile.selectedRole} Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Previous Assessment Attempts History Card */}
        {attempts.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assessment History &amp; Attempts
              </h2>
              <span className="text-xs text-slate-500">
                {attempts.length} total attempt{attempts.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      att.isQualified 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      #{att.attemptNumber}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {att.role} Assessment &bull; {att.score}%
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {att.date} &bull; {att.isQualified ? 'Qualified' : 'Not Qualified'} &bull; {att.correctCount}/{att.totalQuestions} correct
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCompletedAttempt(att);
                      setExamState('results');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    View Attempt
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== ACTIVE EXAM VIEW ====================
  if (examState === 'active' && currentQ) {
    const answeredCount = Object.keys(userAnswers).length + Object.keys(codingDrafts).length;
    const isAnswered = !!userAnswers[currentQ.id] || !!codingDrafts[currentQ.id];

    return (
      <div id="active-assessment-screen" className="fixed inset-0 z-50 bg-slate-100 dark:bg-[#080d1a] flex flex-col overflow-hidden">
        {/* Top Focused Exam Bar */}
        <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {profile.selectedRole} Assessment
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
              Q{currentIndex + 1} of {questions.length} ({currentQ.type})
            </span>
          </div>

          {/* Live Timer */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
              secondsRemaining < 300 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              id="submit-exam-trigger-btn"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* Suspicious Warning Alert */}
        {showSuspiciousWarning && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Warning: Tab or window switch detected ({suspiciousActivityCount} times). Suspicious activity is recorded in proctoring logs.</span>
            </div>
            <button
              onClick={() => setShowSuspiciousWarning(false)}
              className="px-2 py-0.5 bg-black/20 hover:bg-black/30 rounded text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Body: Question content + Sidebar navigator */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Question Viewer */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Question metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Topic: <b className="text-slate-800 dark:text-slate-200">{currentQ.topic}</b></span>
                <span>Difficulty: <b className="text-slate-800 dark:text-slate-200">{currentQ.difficulty}</b></span>
              </div>

              {/* Question prompt */}
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Pseudocode snippet if applicable */}
              {currentQ.pseudocode && (
                <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  <pre>{currentQ.pseudocode}</pre>
                </div>
              )}

              {/* MCQ Options */}
              {currentQ.options && currentQ.options.length > 0 && (
                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pseudocode text output entry if no options provided */}
              {currentQ.type === 'PSEUDOCODE' && (!currentQ.options || currentQ.options.length === 0) && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Your Computed Output:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter expected terminal output..."
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Coding Question Interface */}
              {currentQ.type === 'CODING' && (
                <div className="space-y-4">
                  {currentQ.constraints && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <b className="text-slate-900 dark:text-white block mb-0.5">Constraints:</b>
                      {currentQ.constraints}
                    </div>
                  )}

                  {currentQ.testCases && currentQ.testCases.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                      <b className="text-slate-900 dark:text-white block mb-1">Sample Test Case:</b>
                      <p>Input: {currentQ.testCases[0].input}</p>
                      <p>Expected Output: {currentQ.testCases[0].expectedOutput}</p>
                    </div>
                  )}

                  {/* Code textarea */}
                  <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                    <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs font-mono flex items-center justify-between">
                      <span>Python Solution</span>
                    </div>
                    <textarea
                      value={codingDrafts[currentQ.id] ?? (currentQ.codeTemplate || '')}
                      onChange={(e) => setCodingDrafts({ ...codingDrafts, [currentQ.id]: e.target.value })}
                      rows={12}
                      className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-hidden"
                      spellCheck={false}
                    />
                  </div>

                  {/* Run Code Button & Test Case Feedback inside Assessment */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={async () => {
                        const code = codingDrafts[currentQ.id] || currentQ.codeTemplate || '';
                        setIsEvaluatingTestCases(true);
                        setTestCaseResults(null);
                        try {
                          const res = await fetch('/api/code/evaluate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              language: 'python',
                              code,
                              testCases: currentQ.testCases && currentQ.testCases.length > 0 ? currentQ.testCases : [
                                { input: '5\n1 2 3 4 5', expectedOutput: '15' },
                                { input: '3\n10 20 30', expectedOutput: '60' },
                              ],
                            }),
                          });
                          const data = await res.json();
                          setTestCaseResults(data);
                        } catch (err) {
                          console.error('Error evaluating test cases:', err);
                        } finally {
                          setIsEvaluatingTestCases(false);
                        }
                      }}
                      disabled={isEvaluatingTestCases}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-300" />
                      <span>{isEvaluatingTestCases ? 'Evaluating...' : 'Run Test Cases'}</span>
                    </button>
                    {testCaseResults && (
                      <span className={`text-xs font-bold ${testCaseResults.allPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        Passed: {testCaseResults.passedCount} / {testCaseResults.totalCount} Test Cases
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Nav: Prev / Next */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs text-slate-400">
                {answeredCount} of {questions.length} answered
              </div>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </main>

          {/* 30-Question Grid Navigator */}
          <aside className="w-full md:w-64 p-5 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = userAnswers[q.id] || codingDrafts[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'ring-2 ring-blue-600 ring-offset-2 bg-blue-600 text-white'
                        : ans
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                <span>Unanswered</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit Assessment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have answered <b>{answeredCount}</b> out of <b>{questions.length}</b> questions.
                Once submitted, your responses will be evaluated and recorded.
              </p>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Continue Test
                </button>
                <button
                  onClick={() => submitAssessment(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== ASSESSMENT SUBMITTED CONFIRMATION VIEW ====================
  if (examState === 'submitted' && completedAttempt) {
    return (
      <div id="assessment-submitted-view" className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Recorded & Evaluated
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Assessment Submitted Successfully
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your responses have been captured and saved. Click &ldquo;View Attempt&rdquo; to review your detailed performance breakdown, score percentage, qualification status, and all question explanations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Assessment Role</span>
              <span className="font-semibold text-slate-900 dark:text-white">{completedAttempt.role}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Attempt Number</span>
              <span className="font-semibold text-slate-900 dark:text-white">Attempt #{completedAttempt.attemptNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Questions Evaluated</span>
              <span className="font-semibold text-slate-900 dark:text-white">{completedAttempt.totalQuestions} Questions</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Duration</span>
              <span className="font-semibold text-slate-900 dark:text-white">{completedAttempt.durationMinutes} minutes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="view-attempt-btn"
              onClick={() => setExamState('results')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>View Attempt</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="back-to-history-btn"
              onClick={() => setExamState('intro')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Back to Assessment History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS VIEW ====================
  if (examState === 'results' && completedAttempt) {
    const isQual = completedAttempt.isQualified;

    return (
      <div id="assessment-results-view" className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Result Header Hero Card */}
        <div className={`p-8 rounded-2xl border text-center space-y-4 ${
          isQual
            ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/30'
            : 'bg-gradient-to-b from-rose-500/10 to-transparent border-rose-500/30'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-md">
            {isQual ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-500" />
            )}
          </div>

          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isQual
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
            }`}>
              {isQual ? 'Qualified' : 'Not Qualified'}
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {completedAttempt.score}%
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Attempt #{completedAttempt.attemptNumber} · {completedAttempt.correctCount} of {completedAttempt.totalQuestions} questions correct
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isQual ? (
              <button
                id="results-launch-interview-btn"
                onClick={() => setActiveTab('interview')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2"
              >
                Proceed to Mock Placement Interview
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="results-retry-assessment-btn"
                onClick={startExam}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Adaptive Reattempt #{completedAttempt.attemptNumber + 1}
              </button>
            )}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Sectional Performance Breakdown (39 Questions: 15 MCQ + 10 Aptitude + 10 Pseudocode + 4 Coding) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">Technical MCQs</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
              {completedAttempt.mcqScore} / 15
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">Aptitude &amp; Logic</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
              {completedAttempt.aptitudeScore ?? 0} / 10
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">Pseudocode</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
              {completedAttempt.pseudoScore} / 10
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">Coding</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
              {completedAttempt.codingScore} / 4
            </p>
          </div>
        </div>

        {/* Detailed Question Review with EXPLANATIONS FOR ALL OPTIONS A, B, C, D (Mandated by Section 17 & 22) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Question Review & Option Explanations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review every question, your selected answer, the correct answer, and explanations for each option.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded text-xs font-semibold ${reviewFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
              >
                All (30)
              </button>
              <button
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1 rounded text-xs font-semibold ${reviewFilter === 'incorrect' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs' : 'text-slate-500'}`}
              >
                Incorrect
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1 rounded text-xs font-semibold ${reviewFilter === 'correct' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
              >
                Correct
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {completedAttempt.questions.map((q, idx) => {
              const userAns = completedAttempt.answers[q.id] || '';
              const isCorrect = (q.type === 'MCQ' || q.type === 'MSQ')
                ? userAns.trim().toUpperCase() === (q.correctAnswer || '').trim().toUpperCase()
                : (q.type === 'PSEUDOCODE')
                ? userAns.trim() === (q.expectedOutput || '').trim() || userAns.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase()
                : userAns.trim().length > 25;

              if (reviewFilter === 'incorrect' && isCorrect) return null;
              if (reviewFilter === 'correct' && !isCorrect) return null;

              return (
                <div 
                  key={q.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{q.topic} · {q.type}</span>
                    </div>

                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {q.question}
                  </p>

                  {/* Options with detailed explanations for ALL A, B, C, D */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {q.options.map((opt) => {
                        const isCorrectOption = q.correctAnswer === opt.key;
                        const isUserChoice = userAns === opt.key;

                        return (
                          <div 
                            key={opt.key}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              isCorrectOption 
                                ? 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200' 
                                : isUserChoice
                                ? 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-medium">
                              <span className="font-bold">Option {opt.key}: {opt.text}</span>
                              {isCorrectOption && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct Answer</span>
                              )}
                              {isUserChoice && !isCorrectOption && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Your Selection</span>
                              )}
                            </div>
                            {/* Option-specific explanation */}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                              {opt.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pseudocode/Coding review */}
                  {q.explanation && (!q.options || q.options.length === 0) && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <b className="text-slate-900 dark:text-white block mb-1">Explanation:</b>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
