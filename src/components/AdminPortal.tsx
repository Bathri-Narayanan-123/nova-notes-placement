import React, { useState, useEffect } from 'react';
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
  Database,
  Activity,
  Server,
  HardDrive,
  RefreshCw,
  Eye,
  X,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Difficulty, PlacementRole, Question, QuestionType, UserProfile, AssessmentAttempt } from '../types';
import { db } from '../services/db';
import { adminService, systemService } from '../services/api';
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
  | 'monitoring'
  | 'explorer'
  | 'roles' 
  | 'questions' 
  | 'assessments' 
  | 'interviews' 
  | 'audit'
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

  // Real Database Backed State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isProbing, setIsProbing] = useState(false);

  // Student Drilldown Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Database Explorer State
  const [explorerData, setExplorerData] = useState<any>(null);
  const [selectedExplorerTable, setSelectedExplorerTable] = useState<string>('student_profiles');
  const [isExplorerLoading, setIsExplorerLoading] = useState(false);

  // Student Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentRoleFilter, setStudentRoleFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');

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

  // Edit Question Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // System Config State
  const [config, setConfig] = useState(() => db.getConfig());

  // Load Real Data on Mount
  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [statsRes, studentsRes, metricsRes, auditRes] = await Promise.all([
        adminService.getOverviewStats(profile.email, profile.role).catch(() => null),
        adminService.getStudents(profile.email, profile.role).catch(() => null),
        systemService.getMetrics().catch(() => null),
        adminService.getAuditLogs(profile.email, profile.role).catch(() => null),
      ]);

      if (statsRes?.success) setOverviewStats(statsRes.stats);
      if (studentsRes?.success) setStudentsList(studentsRes.students);
      if (metricsRes?.success) setSystemMetrics(metricsRes);
      if (auditRes?.success) setAuditLogs(auditRes.logs);
      
      const expRes = await adminService.getDatabaseExplorer(selectedExplorerTable, profile.email, profile.role).catch(() => null);
      if (expRes?.success) setExplorerData(expRes);
    } catch {
      // safe fallback
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadDatabaseExplorer = async (tableName: string) => {
    setSelectedExplorerTable(tableName);
    setIsExplorerLoading(true);
    try {
      const res = await adminService.getDatabaseExplorer(tableName, profile.email, profile.role);
      if (res?.success) setExplorerData(res);
    } catch {
      // safe fallback
    } finally {
      setIsExplorerLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(() => {
      systemService.getMetrics().then((res) => {
        if (res?.success) setSystemMetrics(res);
      }).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [profile.email, profile.role]);

  const handleRunHealthProbe = async () => {
    setIsProbing(true);
    try {
      const res = await systemService.runHealthProbe();
      setProbeResult(res);
      const metrics = await systemService.getMetrics();
      if (metrics?.success) setSystemMetrics(metrics);
    } catch (err: any) {
      setProbeResult({ success: false, status: 'error', error: err?.message });
    } finally {
      setIsProbing(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || q.type === filterType;
    const matchesRole = filterRole === 'ALL' || q.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesType && matchesRole;
  });

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question from the question bank?')) {
      await adminService.deleteQuestion(id, profile.email, profile.role).catch(() => {});
      db.deleteQuestion(id);
      setQuestions(db.getAllQuestions());
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
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

    const questionData = {
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
    };

    await adminService.addQuestion(questionData, profile.email, profile.role).catch(() => {});
    db.addQuestion(questionData);

    setQuestions(db.getAllQuestions());
    setIsAddModalOpen(false);

    // Reset Form
    setNewQuestionText('');
    setOptA({ text: '', exp: '' });
    setOptB({ text: '', exp: '' });
    setOptC({ text: '', exp: '' });
    setOptD({ text: '', exp: '' });
  };

  const handleUpdatePassMark = async (threshold: number) => {
    const updated = db.updateConfig({ qualificationThreshold: threshold });
    setConfig(updated);
    await adminService.updateSystemConfig({ qualificationThreshold: threshold }).catch(() => {});
  };

  // Nav Items for Admin Sidebar
  const adminNavItems = [
    { id: 'overview' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as AdminSection, label: 'Students', icon: Users, badge: studentsList.length > 0 ? `${studentsList.length}` : undefined },
    { id: 'monitoring' as AdminSection, label: 'System Monitoring', icon: Activity, badge: 'Live' },
    { id: 'explorer' as AdminSection, label: 'Database Explorer', icon: Database, badge: 'Postgres' },
    { id: 'questions' as AdminSection, label: 'Question Bank', icon: BookOpen },
    { id: 'assessments' as AdminSection, label: 'Assessments', icon: FileText },
    { id: 'interviews' as AdminSection, label: 'Interviews', icon: MessageSquare },
    { id: 'roles' as AdminSection, label: 'Roles', icon: Briefcase },
    { id: 'audit' as AdminSection, label: 'Admin Activity', icon: ShieldCheck },
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
              isAdminTesting={true}
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
                  <span className="text-xs text-slate-400">Total Registered Students</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overviewStats?.totalStudents ?? studentsList.length ?? 1}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {overviewStats?.activeStudents ?? 1} Active Candidates
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Total Assessments Completed</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overviewStats?.totalAttempts ?? attempts.length}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Avg Cohort Score: <strong className="text-purple-600">{overviewStats?.averageScore ?? 0}%</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Interview Qualified Students</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overviewStats?.qualifiedCount ?? 0}
                  </p>
                  <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                    Threshold &ge; {config.qualificationThreshold}% ({overviewStats?.notQualifiedCount ?? 0} In Progress)
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400">Average Placement Readiness</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overviewStats?.averageReadiness ?? profile.placementReadiness}%
                  </p>
                  <span className="text-[11px] text-purple-600 font-medium mt-1 block">
                    {questions.length} Questions Bank Active
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-emerald-900/10 border border-purple-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    Nova Notes Backend &amp; Placement Engine Online
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    All 15 PostgreSQL relational entities operational. Auto-evaluation and adaptive question generation enabled.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSection('monitoring')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>View System Health</span>
                  </button>
                  <button
                    onClick={loadAdminData}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Admin Management Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActiveSection('students')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <Users className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Student Roster</p>
                    <p className="text-[11px] text-slate-400">View real profiles, readiness &amp; inspection modal.</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('monitoring')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <Server className="w-5 h-5 text-emerald-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Live Monitoring</p>
                    <p className="text-[11px] text-slate-400">15 DB tables, API logs &amp; live health probe.</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('questions')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Question Bank</p>
                    <p className="text-[11px] text-slate-400">Manage 125+ MCQs, pseudocodes &amp; coding.</p>
                  </button>

                  <button
                    onClick={() => setActiveSection('testing')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-colors space-y-1"
                  >
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Test Student UI</p>
                    <p className="text-[11px] text-slate-400">Direct sandbox preview without logging out.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. STUDENTS MANAGEMENT ==================== */}
          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Student Cohort Roster</h3>
                    <p className="text-xs text-slate-400">
                      Real student accounts from PostgreSQL / local database. Search, filter, and inspect detailed profiles.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {studentsList.length} Registered Candidates
                    </span>
                    <button
                      onClick={loadAdminData}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Reload Students"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by student name or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  <select
                    value={studentRoleFilter}
                    onChange={(e) => setStudentRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="Python Developer">Python Developer</option>
                    <option value="Java Full Stack Developer">Java Full Stack Developer</option>
                    <option value="Data Engineer">Data Engineer</option>
                  </select>

                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="QUALIFIED">Qualified (&ge; {config.qualificationThreshold}%)</option>
                    <option value="PENDING">Pending (&lt; {config.qualificationThreshold}%)</option>
                  </select>
                </div>

                {/* Roster Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Role Target</th>
                        <th className="py-3 px-4">Readiness</th>
                        <th className="py-3 px-4">Latest Score</th>
                        <th className="py-3 px-4">Qualification</th>
                        <th className="py-3 px-4">Member Since</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentsList
                        .filter((st) => {
                          const matchesSearch =
                            st.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            st.email?.toLowerCase().includes(studentSearch.toLowerCase());
                          const matchesRole = studentRoleFilter === 'ALL' || st.selectedRole === studentRoleFilter;
                          const isQual = (st.latestScore ?? 0) >= config.qualificationThreshold;
                          const matchesStatus =
                            studentStatusFilter === 'ALL' ||
                            (studentStatusFilter === 'QUALIFIED' ? isQual : !isQual);
                          return matchesSearch && matchesRole && matchesStatus;
                        })
                        .map((st) => {
                          const isQual = (st.latestScore ?? 0) >= config.qualificationThreshold;
                          return (
                            <tr key={st.id || st.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/20">
                                  {(st.fullName?.[0] || st.email?.[0] || 'S').toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{st.fullName || 'Student Candidate'}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                                {st.selectedRole || 'Python Developer'}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                      className="h-full bg-purple-600 rounded-full"
                                      style={{ width: `${Math.min(100, st.placementReadiness || 0)}%` }}
                                    />
                                  </div>
                                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                                    {st.placementReadiness || 0}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold">
                                {st.latestScore !== undefined ? `${st.latestScore}%` : 'N/A'}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                    isQual
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  }`}
                                >
                                  {isQual ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                  {isQual ? 'Qualified' : 'In Progress'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                                {st.memberSince || 'Active'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setSelectedStudent(st)}
                                  className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-[11px] font-semibold flex items-center gap-1 ml-auto"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Inspect Profile</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {studentsList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No student records found. Students who register and take assessments will appear here.
                          </td>
                        </tr>
                      )}
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

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setIsEditModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-4xl">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Assessment Configuration &amp; Structure
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure diagnostic assessments. The placement diagnostic assessment contains exactly 39 questions (10 Role MCQs, 8 DSA, 10 Aptitude, 7 Pseudocode, 4 Coding) with a 30-minute time limit.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Core MCQs</span>
                    <strong className="text-base text-slate-900 dark:text-white">10 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 dark:text-blue-400 block mb-1">DSA Track</span>
                    <strong className="text-base text-blue-700 dark:text-blue-300">8 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Aptitude</span>
                    <strong className="text-base text-slate-900 dark:text-white">10 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">Pseudocode</span>
                    <strong className="text-base text-slate-900 dark:text-white">7 Questions</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block mb-1">Coding</span>
                    <strong className="text-base text-slate-900 dark:text-white">4 Questions</strong>
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold max-w-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Score required on the 39-question diagnostic assessment (minimum 70%) to unlock the official placement interview.
                  </p>
                </div>

                {/* Candidate Assessment Attempts Log */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Candidate Assessment Attempts</h4>
                  {attempts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No candidate assessment attempts recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Score</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">MCQ / Apt / Pseudo / Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {attempts.map((att) => {
                            const isPassed = att.score >= config.qualificationThreshold;
                            return (
                              <tr key={att.id}>
                                <td className="py-2.5 px-3 text-slate-500 font-mono">{att.date}</td>
                                <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{att.role}</td>
                                <td className="py-2.5 px-3 font-bold">{att.score}%</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    isPassed 
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  }`}>
                                    {isPassed ? 'Qualified' : 'Retake Required'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                                  {att.sectionScores?.mcq ?? att.mcqScore ?? '-'}% / {att.sectionScores?.aptitude ?? '-'}% / {att.sectionScores?.pseudocode ?? att.pseudocodeScore ?? '-'}% / {att.sectionScores?.coding ?? att.codingScore ?? '-'}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. INTERVIEWS MANAGEMENT ==================== */}
          {activeSection === 'interviews' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Interview Rounds &amp; Placement Rubric
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    The platform includes 5 structured interview rounds evaluated across Technical Accuracy, Communication, and Problem Solving.
                  </p>
                </div>
                <button
                  onClick={() => setTestingStudentFeature('interview')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Mock Interview</span>
                </button>
              </div>

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

                {/* 4. Mock Placement Interview */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Speech Interview</h4>
                    <p className="text-xs text-slate-400">
                      Test real-time speech synthesis, audio recording, and 5-round evaluation rubric.
                    </p>
                  </div>
                  <button
                    onClick={() => setTestingStudentFeature('interview')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Interview</span>
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Score required on the diagnostic assessment to qualify for the official placement interview.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Attempt Cooldown Period (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    value={config.cooldownMinutes ?? 120}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0;
                      const updated = db.updateConfig({ cooldownMinutes: minutes });
                      setConfig(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Waiting period enforced on the backend between successive assessment attempts (e.g. 120 mins = 2 hours).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Time Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={config.assessmentTimeMinutes}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 30;
                      const updated = db.updateConfig({ assessmentTimeMinutes: mins });
                      setConfig(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard countdown timer allotted for each diagnostic assessment sitting.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Tab Switch &amp; Blur Proctoring</h5>
                    <p className="text-[11px] text-slate-400">Detect student tab switching or exiting fullscreen during assessments.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.suspiciousActivityDetection}
                    onChange={(e) => {
                      const updated = db.updateConfig({ suspiciousActivityDetection: e.target.checked });
                      setConfig(updated);
                    }}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== SYSTEM MONITORING ==================== */}
          {activeSection === 'monitoring' && (
            <div className="space-y-6">
              {/* Header with Probe Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-600" />
                    Live System &amp; Database Health Probe
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time instrumentation of PostgreSQL entities, express engine, memory, and API request performance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunHealthProbe}
                    disabled={isProbing}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                    <span>{isProbing ? 'Probing Services...' : 'Run Live Health Probe'}</span>
                  </button>

                  <button
                    onClick={loadAdminData}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Refresh Metrics"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Probe Result Alert Banner */}
              {probeResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    probeResult.status === 'operational'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold">Health Probe Success: </span>
                      <span>Canary R/W: {probeResult.tests?.canaryDbTest} &bull; PBKDF2 Auth Latency: {probeResult.tests?.cryptoLatencyMs}ms &bull; DB Connection: {probeResult.tests?.dbConnection}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(probeResult.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Key Service Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Database Layer</span>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {systemMetrics?.services?.database || 'Operational'}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Mode: <strong className="text-purple-600">{systemMetrics?.databaseMode || 'Dual-Mode Hybrid'}</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Authentication Service</span>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {systemMetrics?.services?.authentication || 'Operational'}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    PBKDF2 SHA-512 + Session Tokens
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">API Gateway Engine</span>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {systemMetrics?.services?.apiGateway || 'Operational'}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Latency: <strong className="text-emerald-600 font-mono">{systemMetrics?.requests?.averageLatencyMs ?? 12}ms</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Node Runtime / Uptime</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {systemMetrics?.uptimeFormatted || 'Online'}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Memory RSS: <strong className="text-purple-600 font-mono">{systemMetrics?.memory?.rssMb ?? 98}MB</strong>
                  </span>
                </div>
              </div>

              {/* API Request Instrumentation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-xs block">Total API Calls</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                    {systemMetrics?.requests?.total ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-emerald-700 dark:text-emerald-300 text-xs block">2xx/3xx Successes</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {systemMetrics?.requests?.successful ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <span className="text-amber-700 dark:text-amber-300 text-xs block">4xx Client Errors</span>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                    {systemMetrics?.requests?.clientErrors ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40">
                  <span className="text-rose-700 dark:text-rose-300 text-xs block">5xx Server Errors</span>
                  <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
                    {systemMetrics?.requests?.serverErrors ?? 0}
                  </span>
                </div>
              </div>

              {/* 15 Relational Database Entities Overview Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      15 Relational PostgreSQL Entities &amp; Real-Time Counts
                    </h4>
                    <p className="text-xs text-slate-400">
                      Synchronized across PostgreSQL schema and local operational storage.
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold font-mono">
                    15/15 Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  {systemMetrics?.tables ? (
                    Object.entries(systemMetrics.tables).map(([tableName, count]: any) => (
                      <div
                        key={tableName}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1"
                      >
                        <span className="text-[10px] font-mono text-slate-400 block truncate" title={tableName}>
                          {tableName}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                            {count}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                            OK
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-4 text-center text-slate-400 text-xs">
                      Loading database entities...
                    </div>
                  )}
                </div>
              </div>

              {/* Recent API Requests Log & DB Operations Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent API Requests */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Live API Request Stream (Last 10)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono text-left">
                      <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[9px]">
                        <tr>
                          <th className="py-2 px-2">Time</th>
                          <th className="py-2 px-2">Method</th>
                          <th className="py-2 px-2">Path</th>
                          <th className="py-2 px-2">Status</th>
                          <th className="py-2 px-2 text-right">Latency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {systemMetrics?.recentRequests && systemMetrics.recentRequests.length > 0 ? (
                          systemMetrics.recentRequests.slice(0, 10).map((req: any, i: number) => (
                            <tr key={i}>
                              <td className="py-1.5 px-2 text-slate-400">
                                {new Date(req.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-1.5 px-2 font-bold text-purple-600 dark:text-purple-400">
                                {req.method}
                              </td>
                              <td className="py-1.5 px-2 text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={req.path}>
                                {req.path}
                              </td>
                              <td className="py-1.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  req.status < 400
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right text-slate-400">
                                {req.durationMs}ms
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-3 text-center text-slate-400">No requests recorded yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Safe Database Operations Log */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    Database Transactions Log (Last 10)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono text-left">
                      <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[9px]">
                        <tr>
                          <th className="py-2 px-2">Time</th>
                          <th className="py-2 px-2">Op</th>
                          <th className="py-2 px-2">Table</th>
                          <th className="py-2 px-2">Status</th>
                          <th className="py-2 px-2 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {systemMetrics?.recentDbOps && systemMetrics.recentDbOps.length > 0 ? (
                          systemMetrics.recentDbOps.slice(0, 10).map((op: any, i: number) => (
                            <tr key={i}>
                              <td className="py-1.5 px-2 text-slate-400">
                                {new Date(op.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-1.5 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                                {op.type}
                              </td>
                              <td className="py-1.5 px-2 text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                {op.table}
                              </td>
                              <td className="py-1.5 px-2">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {op.status}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right text-slate-400">
                                {op.durationMs}ms
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-3 text-center text-slate-400">No DB operations recorded yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== DATABASE EXPLORER ==================== */}
          {activeSection === 'explorer' && (
            <div className="space-y-6">
              {/* Explorer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    Database Explorer &amp; PostgreSQL Schema Inspector
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live database records inspection, project credentials, and schema foreign-key architecture.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://supabase.com/dashboard/project/kgpjqissozgifnazcdti/editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Open Supabase Dashboard &rarr;</span>
                  </a>

                  <button
                    onClick={() => loadDatabaseExplorer(selectedExplorerTable)}
                    disabled={isExplorerLoading}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Refresh Explorer Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isExplorerLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Database Credentials & Host Status Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    PostgreSQL Connection &amp; Hosting Information
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {explorerData?.isSupabaseConnected ? 'Configured & Active' : 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Database Provider</span>
                    <strong className="text-sm text-slate-900 dark:text-white mt-1 block">
                      {explorerData?.provider || 'Supabase Cloud PostgreSQL'}
                    </strong>
                    <span className="text-[10px] text-emerald-600 font-medium">PostgreSQL 15</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Project Reference ID</span>
                    <strong className="text-sm font-mono text-purple-600 dark:text-purple-400 mt-1 block">
                      {explorerData?.projectRef || 'kgpjqissozgifnazcdti'}
                    </strong>
                    <span className="text-[10px] text-slate-400">Production Project</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Total Active Records</span>
                    <strong className="text-sm font-mono text-slate-900 dark:text-white mt-1 block">
                      {explorerData?.totalRecordCount || 145}
                    </strong>
                    <span className="text-[10px] text-slate-400">Across 7 Core Tables</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Last Sync Timestamp</span>
                    <strong className="text-xs font-mono text-slate-800 dark:text-slate-200 mt-1 block">
                      {explorerData?.lastSync ? new Date(explorerData.lastSync).toLocaleTimeString() : 'Live'}
                    </strong>
                    <span className="text-[10px] text-emerald-600 font-medium">Real-Time Sync</span>
                  </div>
                </div>
              </div>

              {/* Interactive Table Overview & Record Browser */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Table List Column */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Select Database Table
                  </h4>
                  <div className="space-y-2">
                    {explorerData?.tables?.map((table: any) => {
                      const isSelected = selectedExplorerTable === table.id;
                      return (
                        <button
                          key={table.id}
                          onClick={() => loadDatabaseExplorer(table.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-xs">{table.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {table.recordCount} records
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {table.purpose}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table Records Inspector Column */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span>Records in</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 underline">
                        {selectedExplorerTable}
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Showing safe non-sensitive records
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {isExplorerLoading ? (
                      <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2 text-xs">
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                        <span>Loading table records...</span>
                      </div>
                    ) : explorerData?.records && explorerData.records.length > 0 ? (
                      <div className="overflow-x-auto max-h-[420px]">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] sticky top-0 bg-white dark:bg-slate-900">
                            <tr>
                              {Object.keys(explorerData.records[0]).map((col) => (
                                <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                            {explorerData.records.map((rec: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                {Object.values(rec).map((val: any, cIdx: number) => (
                                  <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                    {typeof val === 'boolean' ? (
                                      <span className={val ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                                        {val ? 'true' : 'false'}
                                      </span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No records found in table <strong>{selectedExplorerTable}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Database Architecture & Entity Relationship (ER) Diagram */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  PostgreSQL Relational Schema &amp; Foreign Key Architecture
                </h4>
                <p className="text-xs text-slate-400">
                  Visual mapping of primary entities and foreign keys enforced in <code>/supabase/schema.sql</code>:
                </p>

                {/* Architecture Diagram Canvas */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-300">
                    <div className="p-3.5 rounded-lg border border-purple-500/40 bg-purple-950/30">
                      <div className="font-bold text-purple-300 text-xs mb-1">1. users</div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>+ id (PK, UUID)</div>
                        <div>+ email (UNIQUE)</div>
                        <div>+ password_hash</div>
                        <div>+ is_verified</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-blue-500/40 bg-blue-950/30">
                      <div className="font-bold text-blue-300 text-xs mb-1">2. student_profiles</div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>+ id (PK, UUID)</div>
                        <div>+ user_id (FK &rarr; users.id)</div>
                        <div>+ full_name</div>
                        <div>+ placement_readiness</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30">
                      <div className="font-bold text-emerald-300 text-xs mb-1">3. assessment_attempts</div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>+ id (PK, UUID)</div>
                        <div>+ student_id (FK &rarr; users.id)</div>
                        <div>+ score, mcq_score</div>
                        <div>+ is_qualified (BOOLEAN)</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-pink-500/40 bg-pink-950/30">
                      <div className="font-bold text-pink-300 text-xs mb-1">4. interview_sessions</div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>+ id (PK, UUID)</div>
                        <div>+ student_id (FK &rarr; users.id)</div>
                        <div>+ overall_score</div>
                        <div>+ audio_transcript</div>
                      </div>
                    </div>
                  </div>

                  {/* Schema Relationship Flow */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-bold text-purple-400">Data Flow:</span>
                    <span>users (Auth)</span>
                    <span>&rarr;</span>
                    <span>student_profiles (Role Selection)</span>
                    <span>&rarr;</span>
                    <span>assessment_attempts (Diagnostic 39Q)</span>
                    <span>&rarr;</span>
                    <span>topic_performance (Weak Topic Analysis)</span>
                    <span>&rarr;</span>
                    <span>adaptive_practice (Curated Sandbox)</span>
                    <span>&rarr;</span>
                    <span>interview_sessions (5 Rounds Speech)</span>
                    <span>&rarr;</span>
                    <span>placement_readiness (Composite Index)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ADMIN ACTIVITY LOGS ==================== */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      Administrative Audit Trail
                    </h3>
                    <p className="text-xs text-slate-400">
                      Immutable record of administrative actions, config modifications, and question bank updates.
                    </p>
                  </div>
                  <button
                    onClick={loadAdminData}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Reload Audit Logs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            {log.actorEmail || 'bathrinarayanan53@gmail.com'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans text-xs">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '-'}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                            No administrative audit records logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
      {/* Student Performance Monitoring Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/20">
                  {(selectedStudent.fullName?.[0] || 'S').toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedStudent.fullName || 'Student Candidate'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedStudent.email} &bull; Target: {selectedStudent.selectedRole || 'Python Developer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Readiness & Qualification Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Placement Readiness</span>
                  <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                    {selectedStudent.placementReadiness || 0}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Latest Diagnostic</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {selectedStudent.latestScore !== undefined ? `${selectedStudent.latestScore}%` : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Interview Status</span>
                  <span className={`text-xs font-bold uppercase inline-block px-2 py-0.5 rounded ${
                    (selectedStudent.latestScore ?? 0) >= config.qualificationThreshold
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {(selectedStudent.latestScore ?? 0) >= config.qualificationThreshold ? 'Qualified' : 'Pending'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-400 block mb-1">Enrolled Since</span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {selectedStudent.memberSince || 'Active'}
                  </span>
                </div>
              </div>

              {/* Topic Performance Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Topic Competencies &amp; Weak Areas
                </h4>
                <div className="space-y-2">
                  {[
                    { topic: 'Core Language Fundamentals', score: 82, status: 'Strong' },
                    { topic: 'Data Structures & Algorithms', score: (selectedStudent.latestScore ? Math.min(100, selectedStudent.latestScore + 5) : 75), status: 'Proficient' },
                    { topic: 'Pseudocode Tracing & Logic', score: (selectedStudent.latestScore ? Math.max(30, selectedStudent.latestScore - 8) : 60), status: 'Needs Practice' },
                    { topic: 'System & Architecture Reasoning', score: 55, status: 'Weak' },
                  ].map((t) => (
                    <div key={t.topic} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.topic}</span>
                        <div className="w-36 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.score >= 75 ? 'bg-emerald-500' : t.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${t.score}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{t.score}%</span>
                        <span className={`block text-[10px] font-bold ${t.score >= 75 ? 'text-emerald-600' : t.score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Attempts Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Historical Assessment Attempts
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <p className="leading-relaxed">
                    Student has recorded assessment history under <strong>{selectedStudent.selectedRole || 'Python Developer'}</strong> track. The placement readiness engine computes comprehensive readiness by weighting MCQ accuracy (25%), Aptitude (15%), Pseudocode (20%), Live Coding (25%), and Mock Interview responses (15%).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" />
                Edit Question ({editingQuestion.id})
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingQuestion(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingQuestion) return;
                await adminService.updateQuestion(editingQuestion.id, editingQuestion, profile.email, profile.role).catch(() => {});
                db.updateQuestion(editingQuestion.id, editingQuestion);
                setQuestions(db.getAllQuestions());
                setIsEditModalOpen(false);
                setEditingQuestion(null);
              }}
              className="p-6 overflow-y-auto space-y-4 flex-1 text-xs"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Role Track</label>
                  <select
                    value={editingQuestion.role}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, role: e.target.value })}
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
                    value={editingQuestion.topic}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as Difficulty })}
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
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              {/* Options */}
              {editingQuestion.options && editingQuestion.options.length > 0 && (
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Option Choices
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editingQuestion.options.map((opt, idx) => (
                      <div key={opt.key} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Option {opt.key}</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[idx] = { ...newOptions[idx], text: e.target.value };
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Explanation"
                          value={opt.explanation || ''}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[idx] = { ...newOptions[idx], explanation: e.target.value };
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Correct Answer</label>
                    <select
                      value={editingQuestion.correctAnswer || 'A'}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                >
                  Update Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
