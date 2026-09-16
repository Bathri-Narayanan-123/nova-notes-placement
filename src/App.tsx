import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MyPlacementView } from './components/MyPlacementView';
import { PracticeView } from './components/PracticeView';
import { AssessmentView } from './components/AssessmentView';
import { InterviewView } from './components/InterviewView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { AdminPortal } from './components/AdminPortal';
import { LoginView } from './components/LoginView';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { db } from './services/db';
import { AssessmentAttempt, PlacementRole, UserProfile } from './types';
import { Menu, X, BookOpen, Database } from 'lucide-react';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as NavTab;
      const validTabs: NavTab[] = ['dashboard', 'placement', 'practice', 'assessment', 'interview', 'progress', 'profile'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'dashboard';
  });
  const [profile, setProfile] = useState<UserProfile>(() => db.getProfile());
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>(() => db.getAttempts());
  const [roles, setRoles] = useState<PlacementRole[]>(() => db.getRoles());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAssessmentAdaptive, setIsAssessmentAdaptive] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Synchronize activeTab with window history and hash for back/forward browser support
  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      if (window.location.hash !== `#${tab}`) {
        window.history.pushState({ tab }, '', `#${tab}`);
      }
    }
  };

  // Browser Back / Forward navigation listener
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const hash = (window.location.hash.replace('#', '') || (event.state?.tab)) as NavTab;
      const validTabs: NavTab[] = ['dashboard', 'placement', 'practice', 'assessment', 'interview', 'progress', 'profile'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Subscribe to reactive database changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setProfile(db.getProfile());
      setAttempts(db.getAttempts());
      setRoles(db.getRoles());
    });
    return unsubscribe;
  }, []);

  const handleLoginSuccess = (userProfile: UserProfile, targetRole: 'student' | 'admin') => {
    setProfile(userProfile);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleStartAssessment = (isAdaptive: boolean = false) => {
    setIsAssessmentAdaptive(isAdaptive);
    setActiveTab('assessment');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // 1. If not authenticated, always display Login/Welcome page first
  if (!isAuthenticated) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenSetupGuide={() => setShowSetupGuide(true)}
        />
        <SupabaseGuideModal
          isOpen={showSetupGuide}
          onClose={() => setShowSetupGuide(false)}
        />
      </>
    );
  }

  // 2. If authenticated as ADMIN, render the dedicated Admin Portal directly
  if (profile.role === 'admin') {
    return (
      <>
        <AdminPortal
          profile={profile}
          roles={roles}
          attempts={attempts}
          onLogout={handleLogout}
        />
        <SupabaseGuideModal
          isOpen={showSetupGuide}
          onClose={() => setShowSetupGuide(false)}
        />
      </>
    );
  }

  // 3. Authenticated as STUDENT - Render Student Dashboard & Experience
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070c17] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-xs bg-white dark:bg-[#0b1320] h-full shadow-2xl">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              profile={profile}
              onLogout={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Student Helper bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-2.5 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>
              Signed in as <strong className="text-slate-900 dark:text-white font-semibold">{profile.fullName || profile.email}</strong> &bull; Candidate Track: <strong className="text-blue-600 dark:text-blue-400">{profile.selectedRole}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="hover:text-rose-500 transition-colors text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Header Bar */}
        <header className="md:hidden h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Nova Notes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Student View Switcher */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              attempts={attempts}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'placement' && (
            <MyPlacementView
              profile={profile}
              roles={roles}
              latestAttempt={attempts[0]}
              setActiveTab={setActiveTab}
              onStartAssessment={handleStartAssessment}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeView
              profile={profile}
              roles={roles}
            />
          )}

          {activeTab === 'assessment' && (
            <AssessmentView
              profile={profile}
              attempts={attempts}
              setActiveTab={setActiveTab}
              initialAdaptive={isAssessmentAdaptive}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewView
              profile={profile}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              profile={profile}
              attempts={attempts}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      <SupabaseGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
