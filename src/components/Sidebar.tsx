import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Terminal, 
  ClipboardCheck, 
  MessageSquare, 
  TrendingUp, 
  User, 
  Lock, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Laptop, 
  LogOut,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 
  | 'dashboard' 
  | 'placement' 
  | 'practice' 
  | 'assessment' 
  | 'interview' 
  | 'progress' 
  | 'profile' 
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: UserProfile;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme();

  const isInterviewLocked = profile.interviewStatus === 'locked';
  const isAdmin = profile.role === 'admin';

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'placement' as NavTab, label: 'My Placement', icon: Briefcase },
    { id: 'practice' as NavTab, label: 'Practice', icon: Terminal },
    { id: 'assessment' as NavTab, label: 'Assessments', icon: ClipboardCheck },
    { id: 'interview' as NavTab, label: 'Interview', icon: MessageSquare },
    { id: 'progress' as NavTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'S';
  };

  return (
    <aside 
      id="app-sidebar"
      className="w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 min-h-screen transition-colors duration-200"
    >
      {/* Top Header & Brand */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Nova Notes
            </h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Placement Prep</p>
          </div>
        </div>

        {/* Navigation items matching screenshots */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Theme toggle, Profile, Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
        {/* Theme switcher */}
        <div className="bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">Theme</span>
          <div className="flex items-center gap-0.5">
            <button
              id="theme-light-btn"
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-dark-btn"
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              id="theme-system-btn"
              onClick={() => setTheme('system')}
              title="System Default"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Card matching screenshots */}
        <div 
          id="sidebar-profile-card"
          onClick={() => setActiveTab('profile')}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-blue-500/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
            {getInitials(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {profile.fullName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
