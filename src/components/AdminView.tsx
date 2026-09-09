import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  BarChart2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Sparkles, 
  AlertTriangle,
  Play,
  ArrowRight,
  Settings,
  Lock
} from 'lucide-react';
import { Difficulty, PlacementRole, Question, QuestionType, UserProfile } from '../types';
import { db } from '../services/db';
import { NavTab } from './Sidebar';

interface AdminViewProps {
  profile: UserProfile;
  roles: PlacementRole[];
  setActiveTab: (tab: NavTab) => void;
}

type AdminTab = 'overview' | 'students' | 'questions' | 'testing' | 'settings';

export const AdminView: React.FC<AdminViewProps> = ({ profile, roles, setActiveTab }) => {
  const isAdmin = profile.role === 'admin';

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [questions, setQuestions] = useState<Question[]>(() => db.getAllQuestions());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // New Question Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<QuestionType>('MCQ');
  const [newRole, setNewRole] = useState(profile.selectedRole);
  const [newTopic, setNewTopic] = useState('Python');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newPseudocode, setNewPseudocode] = useState('');
  const [newExpectedOutput, setNewExpectedOutput] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newCodeTemplate, setNewCodeTemplate] = useState('');

  // MCQ Options state
  const [optA, setOptA] = useState({ text: '', exp: '' });
  const [optB, setOptB] = useState({ text: '', exp: '' });
  const [optC, setOptC] = useState({ text: '', exp: '' });
  const [optD, setOptD] = useState({ text: '', exp: '' });

  // Settings
  const [config, setConfig] = useState(() => db.getConfig());

  // If user is not admin, show Access Denied as strictly mandated by Sections 7 & 37
  if (!isAdmin) {
    return (
      <div id="admin-access-denied" className="p-8 max-w-lg mx-auto my-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The Admin Panel is strictly reserved for the designated administrator (<code className="text-blue-600 font-mono">bathrinarayanan53@gmail.com</code>). Students are barred from accessing administrative tools.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || q.type === filterType;
    const matchesRole = filterRole === 'ALL' || q.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesType && matchesRole;
  });

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      db.deleteQuestion(id);
      setQuestions(db.getAllQuestions());
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    let options: any[] | undefined = undefined;
    if (newType === 'MCQ' || newType === 'MSQ') {
      options = [
        { key: 'A', text: optA.text || 'Option A', explanation: optA.exp || 'Explanation for Option A' },
        { key: 'B', text: optB.text || 'Option B', explanation: optB.exp || 'Explanation for Option B' },
        { key: 'C', text: optC.text || 'Option C', explanation: optC.exp || 'Explanation for Option C' },
        { key: 'D', text: optD.text || 'Option D', explanation: optD.exp || 'Explanation for Option D' },
      ];
    }

    db.addQuestion({
      role: newRole,
      type: newType,
      topic: newTopic,
      skill: newTopic,
      difficulty: newDifficulty,
      question: newQuestionText,
      correctAnswer: newCorrectAnswer,
      options,
      pseudocode: newPseudocode || undefined,
      expectedOutput: newExpectedOutput || undefined,
      explanation: newExplanation || undefined,
      codeTemplate: newCodeTemplate || undefined,
    });

    setQuestions(db.getAllQuestions());
    setIsAddModalOpen(false);

    // Reset fields
    setNewQuestionText('');
    setOptA({ text: '', exp: '' });
    setOptB({ text: '', exp: '' });
    setOptC({ text: '', exp: '' });
    setOptD({ text: '', exp: '' });
  };

  const handleUpdatePassMark = (threshold: number) => {
    const updated = db.updateConfig({ qualificationThreshold: threshold });
    setConfig(updated);
  };

  const attempts = db.getAttempts();

  return (
    <div id="admin-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Administrator Portal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                Single Admin
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage questions, monitor student cohorts, configure scoring thresholds, and test features.
            </p>
          </div>
        </div>

        {/* Admin Nav Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['overview', 'students', 'questions', 'testing', 'settings'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeAdminTab === tab
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB: OVERVIEW ==================== */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400">Total Enrolled Students</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1</p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Active Placement Batch</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400">Total Assessments Taken</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{attempts.length}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Across all tracks</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400">Question Bank Size</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{questions.length}</p>
              <span className="text-[11px] text-blue-600 font-medium mt-1 block">MCQ, Output & Coding</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400">Qualification Threshold</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{config.qualificationThreshold}%</p>
              <span className="text-[11px] text-purple-600 font-medium mt-1 block">Required to unlock interview</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Administrative Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setActiveAdminTab('questions');
                  setIsAddModalOpen(true);
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-colors"
              >
                <Plus className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Add New Question</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Add MCQ with 4 option explanations, Pseudocode, or Coding</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('students')}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-colors"
              >
                <Users className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Inspect Student Journey</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Review attempts, weakness trends, and interview scores</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('testing')}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-colors"
              >
                <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Proctor & Test Suite</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Launch direct test assessments and interview flows</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: STUDENTS ==================== */}
      {activeAdminTab === 'students' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Enrolled Candidate Roster
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Role Target</th>
                    <th className="py-3 px-4">Readiness</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Weak Areas</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{profile.fullName}</p>
                        <p className="text-[11px] text-slate-400">{profile.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {profile.selectedRole}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {profile.placementReadiness}%
                      </span>
                    </td>
                    <td className="py-4 px-4">{attempts.length} attempts</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.needsImprovement.map((w) => (
                          <span key={w} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {profile.assessmentStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: QUESTIONS ==================== */}
      {activeAdminTab === 'questions' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by topic or text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs w-64"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="ALL">All Question Types</option>
                <option value="MCQ">MCQ</option>
                <option value="PSEUDOCODE">Pseudocode</option>
                <option value="CODING">Coding</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <option value="ALL">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>
            </div>

            <button
              id="admin-add-question-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                      {q.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {q.role} · {q.topic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {q.question}
                </p>

                {/* Options display with explanations */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-lg border ${
                          q.correctAnswer === opt.key
                            ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="font-bold mr-1">({opt.key})</span> {opt.text}
                        <p className="text-[10px] text-slate-400 mt-1 italic pl-3 border-l border-slate-300 dark:border-slate-700">
                          {opt.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB: TESTING ==================== */}
      {activeAdminTab === 'testing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Developer & Proctor Direct Testing Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct testing enables rapid verification of application flows without prerequisite barriers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Direct Assessment</h4>
                <p className="text-[11px] text-slate-400">Launch 30-question assessment immediately.</p>
                <button
                  onClick={() => setActiveTab('assessment')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Test Assessment
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Direct AI Interview</h4>
                <p className="text-[11px] text-slate-400">Test AI HR mock interview voice/chat independently.</p>
                <button
                  onClick={() => setActiveTab('interview')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                >
                  Test Interview
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Interactive Sandbox</h4>
                <p className="text-[11px] text-slate-400">Practice questions with instant option explanations.</p>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold"
                >
                  Test Sandbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: SETTINGS ==================== */}
      {activeAdminTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 max-w-xl">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            System & Examination Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Assessment Qualification Threshold (%)
              </label>
              <input
                type="number"
                min={30}
                max={90}
                value={config.qualificationThreshold}
                onChange={(e) => handleUpdatePassMark(parseInt(e.target.value) || 70)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Students scoring above this pass mark qualify and unlock the AI HR Interview.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add New Question to Question Bank
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="PSEUDOCODE">Pseudocode</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter clear, comprehensive question prompt..."
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* MCQ Options with mandatory explanations */}
              {newType === 'MCQ' && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Option Choices & Explanations (All A, B, C, D)
                  </h4>

                  {/* Option A */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option A Text"
                      value={optA.text}
                      onChange={(e) => setOptA({ ...optA, text: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Option A Explanation"
                      value={optA.exp}
                      onChange={(e) => setOptA({ ...optA, exp: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Option B */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option B Text"
                      value={optB.text}
                      onChange={(e) => setOptB({ ...optB, text: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Option B Explanation"
                      value={optB.exp}
                      onChange={(e) => setOptB({ ...optB, exp: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Option C */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option C Text"
                      value={optC.text}
                      onChange={(e) => setOptC({ ...optC, text: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Option C Explanation"
                      value={optC.exp}
                      onChange={(e) => setOptC({ ...optC, exp: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  {/* Option D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Option D Text"
                      value={optD.text}
                      onChange={(e) => setOptD({ ...optD, text: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Option D Explanation"
                      value={optD.exp}
                      onChange={(e) => setOptD({ ...optD, exp: e.target.value })}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Correct Answer</label>
                    <select
                      value={newCorrectAnswer}
                      onChange={(e) => setNewCorrectAnswer(e.target.value)}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              )}

              {newType === 'PSEUDOCODE' && (
                <div className="space-y-2">
                  <label className="block font-medium">Pseudocode Block</label>
                  <textarea
                    rows={4}
                    value={newPseudocode}
                    onChange={(e) => setNewPseudocode(e.target.value)}
                    className="w-full p-2 font-mono text-xs rounded-lg bg-slate-950 text-emerald-400"
                    placeholder="FUNCTION solve(n)..."
                  />
                  <label className="block font-medium">Expected Output</label>
                  <input
                    type="text"
                    value={newExpectedOutput}
                    onChange={(e) => setNewExpectedOutput(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              {newType === 'CODING' && (
                <div className="space-y-2">
                  <label className="block font-medium">Starter Code Template</label>
                  <textarea
                    rows={4}
                    value={newCodeTemplate}
                    onChange={(e) => setNewCodeTemplate(e.target.value)}
                    className="w-full p-2 font-mono text-xs rounded-lg bg-slate-950 text-emerald-400"
                    placeholder="def solution(nums):"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
