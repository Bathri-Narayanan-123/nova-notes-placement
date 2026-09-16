import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { UserProfile, PlacementRole, Question, ProgrammingLanguage } from '../types';
import { ALL_ROLE_QUESTIONS } from '../data/roleQuestions';
import { APTITUDE_QUESTION_BANK, AptitudeQuestion } from '../data/aptitudeBank';
import {
  COMMON_INTERVIEW_PREP,
  INTERVIEW_ETIQUETTE_GUIDE,
  INTERVIEW_DOS_AND_DONTS_VISUAL,
  InterviewQuestionPrep,
  EtiquetteGuideItem
} from '../data/interviewPreparationData';
import { DSA_PRACTICE_TOPICS, DsaTopic, DsaProblem } from '../data/dsaPracticeData';
import {
  ROLE_CODING_CHALLENGES,
  RoleCodingChallenge,
  SQL_PRACTICE_CHALLENGES,
  SqlPracticeChallenge
} from '../data/roleCodingPractice';
import {
  BookOpen,
  HelpCircle,
  Terminal,
  Code2,
  Database,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Check,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  FileText,
  Video,
  Clock,
  Layers,
  Flame,
  ChevronRight,
  ShieldCheck,
  Code
} from 'lucide-react';

interface PracticeViewProps {
  profile: UserProfile;
  roles: PlacementRole[];
}

type PracticeCategory = 'mcq' | 'aptitude' | 'dsa' | 'pseudocode' | 'coding' | 'sql' | 'interview-prep';

export const PracticeView: React.FC<PracticeViewProps> = ({ profile, roles }) => {
  const [activeCategory, setActiveCategory] = useState<PracticeCategory>('mcq');

  // Filters State
  const [selectedRole, setSelectedRole] = useState<string>(profile.selectedRole || 'Full Stack Developer');
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Aptitude specific sub-filters
  const [aptitudeCategory, setAptitudeCategory] = useState<'All' | 'Quantitative Aptitude' | 'Logical Reasoning'>('All');
  const [aptitudeSkill, setAptitudeSkill] = useState<string>('All Topics');

  // Question session state (for MCQ, Aptitude, Pseudocode)
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFormulaHint, setShowFormulaHint] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  // ==================== CODING PRACTICE STATE ====================
  const availableCodingChallenges = useMemo(() => {
    const matched = ROLE_CODING_CHALLENGES.filter(
      (c) => c.role.toLowerCase() === selectedRole.toLowerCase() || c.role === 'Full Stack Developer'
    );
    return matched.length > 0 ? matched : ROLE_CODING_CHALLENGES;
  }, [selectedRole]);

  const [selectedCodingChallenge, setSelectedCodingChallenge] = useState<RoleCodingChallenge>(
    availableCodingChallenges[0] || ROLE_CODING_CHALLENGES[0]
  );
  const [codingLanguage, setCodingLanguage] = useState<ProgrammingLanguage>('python');
  const [codingCode, setCodingCode] = useState<string>(
    selectedCodingChallenge.starterCode.python
  );
  const [customStdin, setCustomStdin] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [showCodingSolution, setShowCodingSolution] = useState(false);
  const [codeRunOutput, setCodeRunOutput] = useState<{
    stdout?: string;
    stderr?: string;
    runtimeError?: string | null;
    compileError?: string | null;
    durationMs?: number;
    exitCode?: number | null;
    timedOut?: boolean;
  } | null>(null);

  // Update starter code when challenge or language changes
  const handleSelectCodingChallenge = (challenge: RoleCodingChallenge) => {
    setSelectedCodingChallenge(challenge);
    setShowCodingSolution(false);
    const template = challenge.starterCode[codingLanguage] || challenge.starterCode.python;
    setCodingCode(template);
    setCodeRunOutput(null);
  };

  const handleSelectLanguage = (lang: ProgrammingLanguage) => {
    setCodingLanguage(lang);
    const template = selectedCodingChallenge.starterCode[lang] || selectedCodingChallenge.starterCode.python;
    setCodingCode(template);
    setCodeRunOutput(null);
  };

  // ==================== SQL PRACTICE STATE ====================
  const [selectedSqlChallenge, setSelectedSqlChallenge] = useState<SqlPracticeChallenge>(
    SQL_PRACTICE_CHALLENGES[0]
  );
  const [sqlQuery, setSqlQuery] = useState<string>(SQL_PRACTICE_CHALLENGES[0].sampleQuery);
  const [isRunningSql, setIsRunningSql] = useState(false);
  const [showSqlSolution, setShowSqlSolution] = useState(false);
  const [sqlResult, setSqlResult] = useState<{
    success?: boolean;
    columns?: string[];
    rows?: any[][];
    rowCount?: number;
    error?: string;
    durationMs?: number;
  } | null>(null);

  const handleSelectSqlChallenge = (ch: SqlPracticeChallenge) => {
    setSelectedSqlChallenge(ch);
    setSqlQuery(ch.sampleQuery);
    setShowSqlSolution(false);
    setSqlResult(null);
  };

  // ==================== DSA PRACTICE STATE ====================
  const [selectedDsaTopic, setSelectedDsaTopic] = useState<DsaTopic>(DSA_PRACTICE_TOPICS[0]);
  const [selectedDsaProblem, setSelectedDsaProblem] = useState<DsaProblem>(DSA_PRACTICE_TOPICS[0].problems[0]);
  const [dsaSolutionLang, setDsaSolutionLang] = useState<'python' | 'java' | 'cpp'>('python');
  const [showDsaSolution, setShowDsaSolution] = useState(false);

  // ==================== INTERVIEW PREP STATE ====================
  const [interviewPrepCategory, setInterviewPrepCategory] = useState<'All' | 'HR & Behavioral' | 'Technical Projects' | 'Career & Culture'>('All');
  const [selectedPrepQuestion, setSelectedPrepQuestion] = useState<InterviewQuestionPrep | null>(COMMON_INTERVIEW_PREP[0]);
  const [activePrepTab, setActivePrepTab] = useState<'questions' | 'etiquette'>('questions');

  // Compute available skills for selected role
  const availableSkills = useMemo(() => {
    const roleQuestions = ALL_ROLE_QUESTIONS.filter((q) => q.role === selectedRole || q.role === 'All Roles');
    const skills = new Set<string>();
    roleQuestions.forEach((q) => {
      if (q.skill) skills.add(q.skill);
    });
    return ['All Skills', ...Array.from(skills)];
  }, [selectedRole]);

  // Compute available aptitude sub-topics
  const availableAptitudeTopics = useMemo(() => {
    const filtered = aptitudeCategory === 'All'
      ? APTITUDE_QUESTION_BANK
      : APTITUDE_QUESTION_BANK.filter((q) => q.topic === aptitudeCategory);
    const skills = new Set<string>();
    filtered.forEach((q) => {
      if (q.skill) skills.add(q.skill);
    });
    return ['All Topics', ...Array.from(skills)];
  }, [aptitudeCategory]);

  // Filter questions for active practice
  const practiceQuestions = useMemo(() => {
    if (activeCategory === 'aptitude') {
      return APTITUDE_QUESTION_BANK.filter((q) => {
        const matchesCat = aptitudeCategory === 'All' || q.topic === aptitudeCategory;
        const matchesSkill = aptitudeSkill === 'All Topics' || q.skill === aptitudeSkill;
        const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
        return matchesCat && matchesSkill && matchesDiff;
      });
    }

    let targetType: string = 'MCQ';
    if (activeCategory === 'pseudocode') targetType = 'PSEUDOCODE';

    return ALL_ROLE_QUESTIONS.filter((q) => {
      const matchesType = q.type === targetType;
      const matchesRole = q.role === selectedRole || q.role === 'All Roles';
      const matchesSkill = selectedSkill === 'All Skills' || q.skill === selectedSkill;
      const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchesType && matchesRole && matchesSkill && matchesDiff;
    });
  }, [activeCategory, aptitudeCategory, aptitudeSkill, selectedRole, selectedSkill, selectedDifficulty]);

  const currentQ = practiceQuestions[currentIndex] as (Question | AptitudeQuestion | undefined);

  // Start question practice
  const handleStartPractice = () => {
    if (practiceQuestions.length === 0) return;
    setIsPracticing(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowFormulaHint(false);
    setShowStepByStep(false);
    setUserAnswers({});
    setCorrectCount(0);
    setTotalAttempted(0);
  };

  // Handle option selection
  const handleSelectOption = (optKey: string) => {
    if (!currentQ || selectedOption !== null) return;
    setSelectedOption(optKey);
    const isCorrect = currentQ.correctAnswer === optKey;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optKey }));
    setTotalAttempted((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    db.recordPractice({
      studentId: profile.id,
      role: selectedRole,
      skill: currentQ.skill,
      topic: currentQ.topic,
      difficulty: currentQ.difficulty,
      type: currentQ.type,
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      completedAt: new Date().toISOString(),
    });
  };

  // Next question
  const handleNext = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFormulaHint(false);
      setShowStepByStep(false);
    } else {
      setIsPracticing(false);
    }
  };

  // Run Code in Playground
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeRunOutput(null);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: codingLanguage,
          code: codingCode,
          stdin: customStdin,
        }),
      });
      const data = await res.json();
      setCodeRunOutput(data);
    } catch (err: any) {
      setCodeRunOutput({
        stderr: err?.message || 'Code execution request failed.',
        exitCode: 1,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Run SQL Query
  const handleRunSql = async () => {
    setIsRunningSql(true);
    setSqlResult(null);
    try {
      const res = await fetch('/api/sql/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const data = await res.json();
      setSqlResult(data);
    } catch (err: any) {
      setSqlResult({
        success: false,
        error: err?.message || 'SQL execution failed.',
      });
    } finally {
      setIsRunningSql(false);
    }
  };

  // Filtered interview prep questions (without search input)
  const filteredPrepQuestions = useMemo(() => {
    return COMMON_INTERVIEW_PREP.filter((q) => {
      return interviewPrepCategory === 'All' || q.category === interviewPrepCategory;
    });
  }, [interviewPrepCategory]);

  return (
    <div id="practice-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Practice Suites &amp; Skill Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Independent practice for technical MCQs, quantitative aptitude, Data Structures &amp; Algorithms, coding problems, SQL queries, and interview etiquette.
          </p>
        </div>

        {isPracticing && (
          <button
            onClick={() => setIsPracticing(false)}
            className="self-start px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Exit Practice Session</span>
          </button>
        )}
      </div>

      {/* Main Practice Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'mcq', label: 'Technical MCQ', icon: HelpCircle },
          { id: 'aptitude', label: 'Aptitude Practice', icon: Flame },
          { id: 'dsa', label: 'DSA Practice', icon: Layers },
          { id: 'pseudocode', label: 'Pseudocode Practice', icon: Terminal },
          { id: 'coding', label: 'Coding Practice', icon: Code2 },
          { id: 'sql', label: 'SQL Practice', icon: Database },
          { id: 'interview-prep', label: 'Interview Preparation', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as PracticeCategory);
                setIsPracticing(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. APTITUDE PRACTICE SECTION */}
      {/* ========================================================================= */}
      {activeCategory === 'aptitude' && !isPracticing && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Quantitative Aptitude &amp; Logical Reasoning</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Comprehensive Aptitude Practice
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Master quantitative problem solving, arithmetic, algebra, and logical reasoning with step-by-step derivations and formulas.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {practiceQuestions.length} Questions Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Aptitude Branch</label>
              <select
                value={aptitudeCategory}
                onChange={(e) => {
                  setAptitudeCategory(e.target.value as any);
                  setAptitudeSkill('All Topics');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Branches</option>
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Logical Reasoning">Logical Reasoning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Topic / Pattern</label>
              <select
                value={aptitudeSkill}
                onChange={(e) => setAptitudeSkill(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {availableAptitudeTopics.map((top) => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Instant answer feedback with formula hints and detailed mathematical solutions.
            </div>
            <button
              onClick={handleStartPractice}
              disabled={practiceQuestions.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <span>Start Aptitude Drill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DATA STRUCTURES & ALGORITHMS (DSA PRACTICE) */}
      {/* ========================================================================= */}
      {activeCategory === 'dsa' && (
        <div className="space-y-6">
          {/* DSA Topic Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {DSA_PRACTICE_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedDsaTopic(topic);
                  setSelectedDsaProblem(topic.problems[0]);
                  setShowDsaSolution(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedDsaTopic.id === topic.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{topic.name}</span>
              </button>
            ))}
          </div>

          {/* Topic Overview Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedDsaTopic.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {selectedDsaTopic.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold">
                  {selectedDsaTopic.timeComplexityCheat}
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold">
                  {selectedDsaTopic.spaceComplexityCheat}
                </span>
              </div>
            </div>
          </div>

          {/* Master / Detail Split View for DSA Problems */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Problem List */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
                Problems ({selectedDsaTopic.problems.length})
              </span>
              {selectedDsaTopic.problems.map((prob) => {
                const isSelected = selectedDsaProblem.id === prob.id;
                return (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setSelectedDsaProblem(prob);
                      setShowDsaSolution(false);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300'
                      }`}>
                        {prob.difficulty}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {prob.timeComplexity}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {prob.title}
                    </h4>

                    <div className="flex flex-wrap gap-1">
                      {prob.companyTags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Problem Detail & Solution Card */}
            <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    {selectedDsaProblem.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Frequently Asked in: {selectedDsaProblem.companyTags.join(', ')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedDsaProblem.title}
                </h3>
              </div>

              {/* Problem Description */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {selectedDsaProblem.problemStatement}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Example Input</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedDsaProblem.inputExample}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Expected Output</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedDsaProblem.outputExample}</span>
                  </div>
                </div>
              </div>

              {/* Algorithmic Complexity Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Optimal Time Complexity:</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300">{selectedDsaProblem.timeComplexity}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs space-y-1">
                  <span className="font-bold text-blue-700 dark:text-blue-400">Optimal Space Complexity:</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300">{selectedDsaProblem.spaceComplexity}</p>
                </div>
              </div>

              {/* Core Technique */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs space-y-1">
                <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Key Pattern / Technique:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedDsaProblem.keyTechnique}</p>
              </div>

              {/* Solution Accordion */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setShowDsaSolution(!showDsaSolution)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2"
                >
                  <Code className="w-4 h-4 text-purple-500" />
                  <span>{showDsaSolution ? 'Hide Algorithmic Solution' : 'Reveal Step-by-Step & Code Solution'}</span>
                </button>

                {showDsaSolution && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Step by step explanation */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Optimal Derivation Steps:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {selectedDsaProblem.solutionExplanation.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Language Switcher for Code */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(['python', 'java', 'cpp'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setDsaSolutionLang(lang)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                              dsaSolutionLang === lang
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {lang === 'cpp' ? 'C++' : lang}
                          </button>
                        ))}
                      </div>

                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                        {dsaSolutionLang === 'python'
                          ? selectedDsaProblem.pythonCode
                          : dsaSolutionLang === 'java'
                          ? selectedDsaProblem.javaCode
                          : selectedDsaProblem.cppCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TECHNICAL MCQ & PSEUDOCODE DRILL SETUP */}
      {/* ========================================================================= */}
      {(activeCategory === 'mcq' || activeCategory === 'pseudocode') && !isPracticing && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeCategory === 'mcq' ? 'Technical Role MCQs' : 'Pseudocode & Output Prediction'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Role-aligned questions covering language internals, memory models, object-oriented principles, and algorithm complexity.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {practiceQuestions.length} Questions Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Placement Role</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedSkill('All Skills');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Specific Skill / Topic</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {availableSkills.map((sk) => (
                  <option key={sk} value={sk}>{sk}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Instant feedback with detailed rationales for each option choice.
            </div>
            <button
              onClick={handleStartPractice}
              disabled={practiceQuestions.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <span>Begin Practice Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE QUESTION PRACTICE SESSION */}
      {/* ========================================================================= */}
      {isPracticing && currentQ && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                {currentQ.topic || currentQ.skill}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                currentQ.difficulty === 'Easy'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                  : currentQ.difficulty === 'Medium'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Question {currentIndex + 1} of {practiceQuestions.length}
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line font-mono sm:font-sans">
            {currentQ.question}
          </h3>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options?.map((opt: any) => {
              const isChosen = selectedOption === opt.key;
              const isCorrectOpt = currentQ.correctAnswer === opt.key;
              const hasAnswered = selectedOption !== null;

              let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white';
              if (hasAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200';
                } else if (isChosen && !isCorrectOpt) {
                  btnStyle = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200';
                } else {
                  btnStyle = 'border-slate-200 dark:border-slate-800 opacity-50 bg-white dark:bg-slate-900';
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {opt.key}
                  </span>
                  <span className="flex-1 mt-0.5 leading-relaxed">{opt.text}</span>
                  {hasAnswered && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  {hasAnswered && isChosen && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner when answered */}
          {selectedOption !== null && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Technical Explanation &amp; Rationale:
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {currentQ.explanation || (currentQ.options?.find((o: any) => o.key === currentQ.correctAnswer) as any)?.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>{currentIndex < practiceQuestions.length - 1 ? 'Next Problem' : 'Finish Practice Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CODING PRACTICE (Tailored to Selected Placement Role) */}
      {/* ========================================================================= */}
      {activeCategory === 'coding' && (
        <div className="space-y-6">
          {/* Role & Question Selector Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                Placement Role Track
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Coding Practice: {selectedRole}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>

              <select
                value={codingLanguage}
                onChange={(e) => handleSelectLanguage(e.target.value as ProgrammingLanguage)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="c">C (gcc)</option>
                <option value="cpp">C++ (g++)</option>
              </select>
            </div>
          </div>

          {/* Coding Challenge Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {availableCodingChallenges.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectCodingChallenge(ch)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedCodingChallenge.id === ch.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{ch.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                  ch.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {ch.difficulty}
                </span>
              </button>
            ))}
          </div>

          {/* Problem Statement Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                  {selectedCodingChallenge.difficulty} &bull; {selectedCodingChallenge.role}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedCodingChallenge.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedCodingChallenge.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sample Input</span>
                <pre className="font-mono text-slate-800 dark:text-slate-200">{selectedCodingChallenge.sampleInput}</pre>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sample Output</span>
                <pre className="font-mono text-slate-800 dark:text-slate-200">{selectedCodingChallenge.sampleOutput}</pre>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <strong>Constraints:</strong> {selectedCodingChallenge.constraints}
            </div>
          </div>

          {/* Code Editor & Execution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-t-xl border border-b-0 border-slate-700 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                solution.{codingLanguage === 'python' ? 'py' : codingLanguage === 'javascript' ? 'js' : codingLanguage === 'c' ? 'c' : codingLanguage === 'cpp' ? 'cpp' : 'java'}
              </span>
              <button
                onClick={() => setCodingCode(selectedCodingChallenge.starterCode[codingLanguage] || '')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                Reset to Starter Code
              </button>
            </div>
            <textarea
              rows={12}
              value={codingCode}
              onChange={(e) => setCodingCode(e.target.value)}
              className="w-full p-4 rounded-b-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 leading-relaxed resize-y"
              spellCheck={false}
            />

            {/* Custom Input Stdin */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Custom Standard Input (stdin)
              </label>
              <textarea
                rows={2}
                value={customStdin}
                onChange={(e) => setCustomStdin(e.target.value)}
                placeholder="Optional input passed to program stdin"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Run Button & Solution Reveal */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isRunningCode ? 'Compiling & Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={() => setShowCodingSolution(!showCodingSolution)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {showCodingSolution ? 'Hide Solution Hint' : 'View Solution Hint'}
              </button>
            </div>

            {/* Solution Hint Card */}
            {showCodingSolution && (
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Solution Strategy
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedCodingChallenge.solutionHint}</p>
              </div>
            )}

            {/* Code Output Terminal */}
            {codeRunOutput && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Terminal Output:</span>
                  {codeRunOutput.durationMs !== undefined && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {codeRunOutput.durationMs}ms
                    </span>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap min-h-[80px]">
                  {codeRunOutput.compileError && (
                    <span className="text-rose-400 font-bold block mb-1">
                      Compilation Error:
                      {'\n' + codeRunOutput.compileError}
                    </span>
                  )}
                  {codeRunOutput.runtimeError && (
                    <span className="text-rose-400 block mb-1">
                      Runtime Error:
                      {'\n' + codeRunOutput.runtimeError}
                    </span>
                  )}
                  {codeRunOutput.stdout && (
                    <span className="text-emerald-400 block">
                      {codeRunOutput.stdout}
                    </span>
                  )}
                  {!codeRunOutput.stdout && !codeRunOutput.compileError && !codeRunOutput.runtimeError && (
                    <span className="text-slate-500 italic">Program finished with exit code 0 and no output.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SQL PRACTICE (Real SQLite Database Runner with Structured Questions) */}
      {/* ========================================================================= */}
      {activeCategory === 'sql' && (
        <div className="space-y-6">
          {/* SQL Challenge Selector */}
          <div className="flex flex-wrap gap-2">
            {SQL_PRACTICE_CHALLENGES.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectSqlChallenge(ch)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedSqlChallenge.id === ch.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{ch.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                  ch.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {ch.difficulty}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                  {selectedSqlChallenge.difficulty} &bull; SQLite Query
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {selectedSqlChallenge.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {selectedSqlChallenge.description}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                SQLite 3 Live
              </span>
            </div>

            {/* Database Schema Hint */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Table Schema: <code className="text-blue-600 dark:text-blue-400">students</code>
              </span>
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                id (INTEGER PRIMARY KEY), name (VARCHAR), department (VARCHAR), cgpa (REAL), placement_status (VARCHAR)
              </p>
            </div>

            {/* SQL Query Editor */}
            <div>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-t-xl border border-b-0 border-slate-700 text-xs text-slate-300 font-mono">
                <span>query.sql</span>
                <button
                  onClick={() => setSqlQuery(selectedSqlChallenge.sampleQuery)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Reset Query
                </button>
              </div>
              <textarea
                rows={5}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full p-4 rounded-b-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRunSql}
                disabled={isRunningSql}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Database className="w-4 h-4" />
                <span>{isRunningSql ? 'Executing Query...' : 'Run SQL Query'}</span>
              </button>

              <button
                onClick={() => setShowSqlSolution(!showSqlSolution)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {showSqlSolution ? 'Hide Solution Query' : 'Load Solution Query'}
              </button>
            </div>

            {showSqlSolution && (
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                <span className="font-bold text-blue-700 dark:text-blue-300">Solution Query:</span>
                <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                  {selectedSqlChallenge.solutionQuery}
                </pre>
                <p className="text-slate-600 dark:text-slate-400">{selectedSqlChallenge.explanation}</p>
              </div>
            )}

            {/* SQL Query Result Table */}
            {sqlResult && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Query Results ({sqlResult.rowCount || 0} rows):
                  </span>
                  {sqlResult.durationMs !== undefined && (
                    <span className="text-slate-400 text-xs">Latency: {sqlResult.durationMs}ms</span>
                  )}
                </div>

                {sqlResult.error ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-mono">
                    {sqlResult.error}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          {sqlResult.columns?.map((col, idx) => (
                            <th key={idx} className="p-2.5 font-bold uppercase tracking-wider">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                        {sqlResult.rows && sqlResult.rows.length > 0 ? (
                          sqlResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="p-2.5 text-slate-800 dark:text-slate-200">
                                  {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={sqlResult.columns?.length || 1} className="p-4 text-center text-slate-400 italic font-sans">
                              Query executed successfully (0 rows returned).
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. INTERVIEW PREPARATION (Text & Visual - Model Answers & Etiquette Photos) */}
      {/* ========================================================================= */}
      {activeCategory === 'interview-prep' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePrepTab('questions')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePrepTab === 'questions'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Placement Questions &amp; Model Answers</span>
            </button>

            <button
              onClick={() => setActivePrepTab('etiquette')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activePrepTab === 'etiquette'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Sitting Posture, Setup &amp; Do&apos;s and Don&apos;ts (Visual)</span>
            </button>
          </div>

          {/* TAB 1: PLACEMENT QUESTIONS & MODEL ANSWERS (Search removed as requested) */}
          {activePrepTab === 'questions' && (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs flex-wrap">
                {(['All', 'HR & Behavioral', 'Technical Projects', 'Career & Culture'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInterviewPrepCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      interviewPrepCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Master / Detail Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Questions List */}
                <div className="lg:col-span-5 space-y-3">
                  {filteredPrepQuestions.map((q) => {
                    const isSelected = selectedPrepQuestion?.id === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedPrepQuestion(q)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all space-y-1.5 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                          {q.question}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {q.interviewerExpectation}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Right Question Detail Card */}
                {selectedPrepQuestion && (
                  <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                    <div>
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase">
                        {selectedPrepQuestion.category}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                        {selectedPrepQuestion.question}
                      </h3>
                    </div>

                    {/* What Interviewer Expects */}
                    <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interviewer Evaluation Focus</span>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-100 leading-relaxed">
                        {selectedPrepQuestion.interviewerExpectation}
                      </p>
                    </div>

                    {/* Recommended Sample Answer */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        High-Impact Sample Answer (Target: 60 - 90 seconds)
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-serif italic">
                        {selectedPrepQuestion.sampleAnswer}
                      </div>
                    </div>

                    {/* Key Strategic Points */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Core Answering Strategy:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {selectedPrepQuestion.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Do's and Don'ts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1 text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Do This
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">{selectedPrepQuestion.doAndDont.do}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-1 text-xs">
                        <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Avoid This
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">{selectedPrepQuestion.doAndDont.dont}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SITTING POSTURE, SETUP & VISUAL DO'S AND DON'TS WITH PHOTOS */}
          {activePrepTab === 'etiquette' && (
            <div className="space-y-8">
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Interview Sitting Posture, Environment &amp; Visual Etiquette
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Non-verbal communication, posture, eye alignment, and workspace lighting shape over 60% of an interviewer&apos;s evaluation. Follow these photographic standards.
                </p>
              </div>

              {/* VISUAL DO'S AND DON'TS COMPARISON GRID WITH PHOTOS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Visual Do&apos;s and Don&apos;ts Photographic Guide
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {INTERVIEW_DOS_AND_DONTS_VISUAL.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>

                      {/* Side by side photos */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* DO Card */}
                        <div className="space-y-2">
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-xs">
                            <img
                              src={item.doImageUrl}
                              alt="Do - Recommended Interview Posture"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md">
                              <Check className="w-3 h-3" /> DO
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-950 dark:text-emerald-300 font-medium leading-relaxed">
                            {item.doText}
                          </p>
                        </div>

                        {/* DON'T Card */}
                        <div className="space-y-2">
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-rose-500 shadow-xs">
                            <img
                              src={item.dontImageUrl}
                              alt="Don't - Avoid This Posture"
                              className="w-full h-full object-cover grayscale contrast-125"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md">
                              <XCircle className="w-3 h-3" /> DON&apos;T
                            </div>
                          </div>
                          <p className="text-[11px] text-rose-950 dark:text-rose-300 font-medium leading-relaxed">
                            {item.dontText}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        &quot;{item.ruleSummary}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* POSTURE & TECHNICAL SETUP CHECKLIST */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Setup Checklist &amp; Body Language Guidelines
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INTERVIEW_ETIQUETTE_GUIDE.map((guide) => (
                    <div
                      key={guide.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {guide.imageUrl && (
                          <div className="aspect-16/9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                            <img
                              src={guide.imageUrl}
                              alt={guide.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                            {guide.category}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            {guide.impactScore}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {guide.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {guide.recommendation}
                        </p>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px]">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            Visual Cue
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
                            &quot;{guide.visualCue}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          Execution Checklist:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          {guide.bestPractices.map((bp, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
