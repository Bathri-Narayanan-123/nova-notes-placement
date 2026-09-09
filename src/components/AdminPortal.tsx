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
  Lock,
  LogOut,
  Sliders,
  FileText,
  MessageSquare,
  Award,
  Terminal,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Sun,
  Moon,
  Database
} from 'lucide-react';
import { Difficulty, PlacementRole, Question, QuestionType, UserProfile, AssessmentAttempt } from '../types';
import { db } from '../services/db';
import { useTheme } from '../context/ThemeContext';

// Student Views for Admin Test Mode
import { DashboardView } from './DashboardView';
import { MyPlacementView } from './MyPlacementView';
import { PracticeView } from './PracticeView';
import { AssessmentView } from './AssessmentView';
import { InterviewView } from './InterviewView';
import { ProgressView } from './ProgressView';
import { ProfileView } from './ProfileView';

interface AdminPortalProps {
  profile: UserProfile;
  roles: PlacementRole[];
  attempts: AssessmentAttempt[];
  onLogout: () => void;
}

export type AdminSection = 
  | 'overview' 
  | 'students' 
  | 'roles' 
  | 'questions' 
  | 'assessments' 
  | 'interviews' 
  | 'analytics' 
  | 'testing' 
  | 'settings';

export type StudentTestFeature = 
  | 'dashboard' 
  | 'placement' 
  | 'practice' 
  | 'assessment' 
  | 'interview' 
  | 'progress' 
  | 'profile';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  profile,
  roles,
  attempts,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [testingStudentFeature, setTestingStudentFeature] = useState<StudentTestFeature | null>(null);

  // Question Bank State
  const [questions, setQuestions] = useState<Question[]>(() => db.getAllQuestions());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Add Question Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState<QuestionType>('MCQ');
  const [newRole, setNewRole] = useState(profile.selectedRole || 'Python Developer');
  const [newTopic, setNewTopic] = useState('Python');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newPseudocode, setNewPseudocode] = useState('');
  const [newExpectedOutput, setNewExpectedOutput] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newCodeTemplate, setNewCodeTemplate] = useState('');
  const [optA, setOptA] = useState({ text: '', exp: '' });
  const [optB, setOptB] = useState({ text: '', exp: '' });
  const [optC, setOptC] = useState({ text: '', exp: '' });
  const [optD, setOptD] = useState({ text: '', exp: '' });

  // System Config State
  const [config, setConfig] = useState(() => db.getConfig());

  // Filtered Questions
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

    // Reset Form
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

  // Nav Items for Admin Sidebar
  const adminNavItems = [
    { id: 'overview' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as AdminSection, label: 'Students', icon: Users },
    { id: 'roles' as AdminSection, label: 'Roles', icon: Briefcase },
    { id: 'questions' as AdminSection, label: 'Question Bank', icon: BookOpen },
    { id: 'assessments' as AdminSection, label: 'Assessments', icon: FileText },
    { id: 'interviews' as AdminSection, label: 'Interviews', icon: MessageSquare },
    { id: 'analytics' as AdminSection, label: 'Analytics', icon: BarChart2 },
    { id: 'testing' as AdminSection, label: 'Test Features', icon: Sparkles, badge: 'Testing' },
    { id: 'settings' as AdminSection, label: 'Settings', icon: Settings },
  ];

  // If Admin is in Testing Mode, render the Student Feature with a dedicated Top Banner
  if (testingStudentFeature) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070c17] text-slate-900 dark:text-slate-100">
        {/* Admin Testing Mode Top Notification Bar */}
        <div className="bg-purple-900 text-purple-100 px-6 py-3 flex items-center justify-between border-b border-purple-700 shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-300"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold">
              Admin Testing Mode: Previewing <span className="underline uppercase">{testingStudentFeature}</span> as Administrator
            </span>
            <span className="hidden md:inline-block text-xs bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800 text-purple-200">
              bathrinarayanan53@gmail.com
            </span>
          </div>

          <button
            onClick={() => setTestingStudentFeature(null)}
            className="px-4 py-1.5 rounded-xl bg-white text-purple-950 hover:bg-purple-100 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>&larr; Return to Admin Dashboard</span>
          </button>
        </div>

        {/* Embedded Student View */}
        <div className="flex-1 overflow-y-auto">
          {testingStudentFeature === 'dashboard' && (
            <DashboardView
              profile={profile}
              attempts={attempts}
              setActiveTab={(tab: any) => setTestingStudentFeature(tab)}
            />
          )}

          {testingStudentFeature === 'placement' && (
            <MyPlacementView
              profile={profile}
              roles={roles}
              latestAttempt={attempts[0]}
              setActiveTab={(tab: any) => setTestingStudentFeature(tab)}
              onStartAssessment={() => setTestingStudentFeature('assessment')}
            />
          )}

          {testingStudentFeature === 'practice' && (
            <PracticeView
              profile={profile}
              roles={roles}
            />
          )}

          {testingStudentFeature === 'assessment' && (
            <AssessmentView
              profile={profile}
              attempts={attempts}
              setActiveTab={(tab: any) => setTestingStudentFeature(tab)}
              initialAdaptive={false}
            />
          )}

          {testingStudentFeature === 'interview' && (
            <InterviewView
              profile={profile}
              setActiveTab={(tab: any) => setTestingStudentFeature(tab)}
            />
          )}

          {testingStudentFeature === 'progress' && (
            <ProgressView
              profile={profile}
              attempts={attempts}
            />
          )}

          {testingStudentFeature === 'profile' && (
            <ProfileView
              profile={profile}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    );
  }

  // ==================== DEDICATED ADMIN DASHBOARD LAYOUT ====================
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070c17] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Dedicated Admin Sidebar */}
      <aside 
        id="admin-sidebar"
        className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 min-h-screen"
      >
        <div>
          {/* Admin Portal Header Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Admin Portal
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold uppercase">
                Single Admin
              </span>
            </div>
          </div>

          {/* Admin Navigation Menu */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile.fullName || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header Bar */}
        <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {activeSection === 'overview' ? 'Admin Dashboard' : activeSection.replace('-', ' ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized System Administrator Session
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSection('testing')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Test Student Experience</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Section Contents */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          
          {/* ==================== 1. OVERVIEW DASHBOARD ==================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Active Student Accounts</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1</p>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Enrolled in Batch</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Total Assessments Completed</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{attempts.length}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">Across all placement roles</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Total Questions Bank</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{questions.length}</p>
                  <span className="text-[11px] text-blue-600 font-medium mt-1 block">MCQ, Pseudocode, Coding</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Interview Qualification Pass Mark</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{config.qualificationThreshold}%</p>
                  <span className="text-[11px] text-purple-600 font-medium mt-1 block">Required on diagnostic assessment</span>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Admin Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveSection('questions')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Manage Questions</p>
                    <p className="text-[11px] text-slate-400">Add or edit MCQ, pseudocode, and coding exercises.</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('testing')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Test Student Experience</p>
                    <p className="text-[11px] text-slate-400">Directly test all student features without fake accounts.</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('students')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <Users className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Review Student Cohort</p>
                    <p className="text-[11px] text-slate-400">Inspect readiness trajectories and weak topic breakdowns.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. STUDENTS MANAGEMENT ==================== */}
          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Student Cohort Roster</h3>
                    <p className="text-xs text-slate-400">Overview of student profiles, target placement roles, and readiness metrics.</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    1 Active Candidate
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Role Target</th>
                        <th className="py-3 px-4">Readiness</th>
                        <th className="py-3 px-4">Assessments</th>
                        <th className="py-3 px-4">Interview Status</th>
                        <th className="py-3 px-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            S
                          </div>
                          <div>
                            <p>Placement Student Candidate</p>
                            <p className="text-[10px] text-slate-400 font-normal">student.candidate@novanotes.edu</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{profile.selectedRole || 'Python Developer'}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-600">{profile.placementReadiness}%</span>
                        </td>
                        <td className="py-3.5 px-4">{attempts.length} attempts</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            Practice Active
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                            student
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. ROLES CONFIGURATION ==================== */}
          {activeSection === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Placement Career Roles</h3>
                  <p className="text-xs text-slate-400">Manage placement preparation tracks and curriculum skills.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{r.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                        {r.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {r.description}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {r.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 4. QUESTION BANK ==================== */}
          {activeSection === 'questions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs w-64 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <option value="ALL">All Types</option>
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
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
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
                          {q.role} &bull; {q.topic}
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

                    {/* Options Display with Explanations */}
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

          {/* ==================== 5. ASSESSMENTS MANAGEMENT ==================== */}
          {activeSection === 'assessments' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-2xl">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Assessment Configuration &amp; Structure
              </h3>
              <p className="text-xs text-slate-400">
                Configure diagnostic assessments. The placement diagnostic assessment contains 30 questions (20 MCQ, 5 Pseudocode, 5 Coding) with a 30-minute time limit.
              </p>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Total MCQs</span>
                    <strong className="text-base text-slate-900 dark:text-white">20 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Pseudocode</span>
                    <strong className="text-base text-slate-900 dark:text-white">5 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Coding</span>
                    <strong className="text-base text-slate-900 dark:text-white">5 Questions</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qualification Pass Mark (%)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={95}
                    value={config.qualificationThreshold}
                    onChange={(e) => handleUpdatePassMark(parseInt(e.target.value) || 70)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Score required on the 30-question diagnostic assessment to unlock the official placement interview.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. INTERVIEWS MANAGEMENT ==================== */}
          {activeSection === 'interviews' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-2xl">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Interview Rounds &amp; AI Rubric
              </h3>
              <p className="text-xs text-slate-400">
                The platform includes 5 structured interview rounds evaluated across Technical Accuracy, Communication, and Problem Solving.
              </p>

              <div className="space-y-2 text-xs">
                {[
                  '1. Introduction & Background',
                  '2. Technical Competency',
                  '3. Behavioral & STAR Scenarios',
                  '4. Problem Solving & Architecture',
                  '5. Closing & Candidate Questions',
                ].map((round) => (
                  <div key={round} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{round}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 7. ANALYTICS ==================== */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cohort Readiness Distribution</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Python &amp; Core DSA</span>
                      <span className="font-bold text-slate-200">74%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '74%' }} />
                    </div>

                    <div className="flex justify-between text-slate-400 pt-2">
                      <span>SQL &amp; Relational Schema</span>
                      <span className="font-bold text-slate-200">62%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '62%' }} />
                    </div>

                    <div className="flex justify-between text-slate-400 pt-2">
                      <span>System Architecture</span>
                      <span className="font-bold text-slate-200">45%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Assessment Scores</h3>
                  {attempts.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {attempts.slice(0, 3).map((att) => (
                        <div key={att.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{att.role}</p>
                            <p className="text-[10px] text-slate-400">{att.date}</p>
                          </div>
                          <span className={`text-sm font-bold ${att.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {att.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No attempts logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 8. TEST FEATURES (ADMIN TESTING SUITE) ==================== */}
          {activeSection === 'testing' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Admin Feature Testing Suite</span>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed max-w-2xl">
                  Test and verify all student features directly from your Administrator session without needing to create multiple fake student accounts. Click any feature below to launch into preview mode.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Student Dashboard */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Student Dashboard</h4>
                    <p className="text-xs text-slate-400">
                      Test overview metrics, readiness score widgets, skill radar, and quick launch triggers.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('dashboard')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Student Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Practice Sandbox */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Practice Sandbox</h4>
                    <p className="text-xs text-slate-400">
                      Test MCQ question bank, pseudocode output tracing, real coding sandboxes, and interview rehearsal.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('practice')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Practice Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Diagnostic Assessment */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Diagnostic Assessment</h4>
                    <p className="text-xs text-slate-400">
                      Take the 30-question diagnostic examination with interactive timer and answer evaluation.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('assessment')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4. AI Placement Interview */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Speech Interview</h4>
                    <p className="text-xs text-slate-400">
                      Test real-time AI speech synthesis, speech recognition, and 5-round evaluation rubric.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('interview')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch AI Interview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5. Progress Analytics */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Progress Analytics</h4>
                    <p className="text-xs text-slate-400">
                      Inspect student score trajectory, skill breakdowns, and historical assessment summaries.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('progress')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Progress View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 6. Student Profile */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Student Profile</h4>
                    <p className="text-xs text-slate-400">
                      Test target placement role switching, session counter, and student profile preferences.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('profile')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Profile View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. SETTINGS ==================== */}
          {activeSection === 'settings' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-xl">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Platform Security &amp; Authorization Settings
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                  <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Authorized Administrator
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    bathrinarayanan53@gmail.com
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Enforced server-side. Google OAuth logins matching this email receive administrator access.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Qualification Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={95}
                    value={config.qualificationThreshold}
                    onChange={(e) => handleUpdatePassMark(parseInt(e.target.value) || 70)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Score required on the diagnostic assessment to qualify for the official placement interview.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

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
                    onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
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
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  placeholder="Enter the question text..."
                  required
                />
              </div>

              {/* MCQ Options with 4 Mandatory Explanations */}
              {(newType === 'MCQ' || newType === 'MSQ') && (
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Option Choices with Individual Explanations
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Option A</span>
                      <input
                        type="text"
                        placeholder="Option A text"
                        value={optA.text}
                        onChange={(e) => setOptA({ ...optA, text: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Why option A is correct/incorrect"
                        value={optA.exp}
                        onChange={(e) => setOptA({ ...optA, exp: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Option B</span>
                      <input
                        type="text"
                        placeholder="Option B text"
                        value={optB.text}
                        onChange={(e) => setOptB({ ...optB, text: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Why option B is correct/incorrect"
                        value={optB.exp}
                        onChange={(e) => setOptB({ ...optB, exp: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Option C</span>
                      <input
                        type="text"
                        placeholder="Option C text"
                        value={optC.text}
                        onChange={(e) => setOptC({ ...optC, text: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Why option C is correct/incorrect"
                        value={optC.exp}
                        onChange={(e) => setOptC({ ...optC, exp: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Option D</span>
                      <input
                        type="text"
                        placeholder="Option D text"
                        value={optD.text}
                        onChange={(e) => setOptD({ ...optD, text: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Why option D is correct/incorrect"
                        value={optD.exp}
                        onChange={(e) => setOptD({ ...optD, exp: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Correct Answer Key</label>
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

              {/* Pseudocode Question Fields */}
              {newType === 'PSEUDOCODE' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-medium mb-1">Pseudocode Snippet</label>
                    <textarea
                      rows={4}
                      value={newPseudocode}
                      onChange={(e) => setNewPseudocode(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                      placeholder="Write algorithm pseudocode..."
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Expected Output</label>
                    <input
                      type="text"
                      value={newExpectedOutput}
                      onChange={(e) => setNewExpectedOutput(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                      placeholder="e.g. 42"
                    />
                  </div>
                </div>
              )}

              {/* Coding Question Fields */}
              {newType === 'CODING' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-medium mb-1">Starter Code Template</label>
                    <textarea
                      rows={5}
                      value={newCodeTemplate}
                      onChange={(e) => setNewCodeTemplate(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                      placeholder="def solution(nums):..."
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
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
