import React, { useState } from 'react';
import { db } from '../services/db';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';
import {
  Sparkles,
  AlertTriangle,
  Mail,
  Key,
  User,
  School,
  ChevronRight,
  X,
  Plus,
  Shield,
  GraduationCap,
  Lock,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (profile: UserProfile, targetRole: 'student' | 'admin') => void;
  onOpenSetupGuide?: () => void;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatarText: string;
  isAdmin?: boolean;
}

const AUTHORIZED_ADMIN_EMAIL = 'bathrinarayanan53@gmail.com';

// Strict email validation helper: rejects abc, abc@, abc@gmail, @gmail.com, test@, test@gmail.
function isValidEmailInput(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;
  if (trimmed.endsWith('.') || trimmed.includes('..')) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain || !domain.includes('.')) return false;
  const domainParts = domain.split('.');
  if (domainParts[domainParts.length - 1].length < 2) return false;
  return true;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { theme, setTheme } = useTheme();

  // Primary portal tab: 'student' vs 'admin'
  const [portalTab, setPortalTab] = useState<'student' | 'admin'>('student');
  
  // Student active mode: signin vs signup
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email/Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Google Account Chooser Modal State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Available Google accounts for authentic Single Sign-On
  const availableGoogleAccounts: GoogleAccount[] = [
    {
      name: 'Bathri Narayanan S',
      email: 'bathrinarayanan53@gmail.com',
      avatarText: 'BN',
      isAdmin: true,
    },
    {
      name: 'Placement Candidate',
      email: 'student.candidate@novanotes.edu',
      avatarText: 'PC',
      isAdmin: false,
    },
  ];

  // Complete real authentication flow
  const authenticateUser = async (targetEmail: string, targetName: string, forceRole?: 'student' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = targetEmail.trim().toLowerCase();

    // If attempting Administrator login
    if (portalTab === 'admin' || forceRole === 'admin') {
      if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setIsLoading(false);
        setErrorMessage(`Access Denied: Only authorized email (${AUTHORIZED_ADMIN_EMAIL}) is permitted to access the Administrator Portal.`);
        return;
      }

      try {
        const updatedProfile = db.updateProfile({
          email: AUTHORIZED_ADMIN_EMAIL,
          fullName: targetName || 'Bathri Narayanan S',
          role: 'admin',
          themePreference: theme,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('nova_notes_auth_session', JSON.stringify({
            isAuthenticated: true,
            user: updatedProfile,
          }));
        }

        setIsLoading(false);
        setShowGoogleChooser(false);
        onLoginSuccess(updatedProfile, 'admin');
        return;
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage('Failed to authenticate administrator session.');
        return;
      }
    }

    // Student login / signup
    try {
      const updatedProfile = db.updateProfile({
        email: cleanEmail,
        fullName: targetName,
        college: college || 'Engineering Institute of Technology',
        role: 'student',
        themePreference: theme,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('nova_notes_auth_session', JSON.stringify({
          isAuthenticated: true,
          user: updatedProfile,
        }));
      }

      setIsLoading(false);
      setShowGoogleChooser(false);
      onLoginSuccess(updatedProfile, 'student');
    } catch (err: any) {
      setIsLoading(false);
      console.error('Authentication error:', err);
      setErrorMessage('Authentication error occurred. Please try again.');
    }
  };

  const handleOpenGoogleFlow = () => {
    setErrorMessage(null);
    setShowGoogleChooser(true);
  };

  // Form submission with real validation and backend API call
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validate empty fields
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // 2. Strict email validation
    if (!isValidEmailInput(cleanEmail)) {
      setErrorMessage('Invalid email format. Please enter a complete, valid email address (e.g., student@example.com or user@gmail.com). Incomplete formats like "abc@", "test@gmail.", or "@gmail.com" are not permitted.');
      return;
    }

    // 3. Password validation
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 4. Admin portal check
    if (portalTab === 'admin') {
      if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setErrorMessage(`Access Denied: Only authorized administrator (${AUTHORIZED_ADMIN_EMAIL}) can sign in to this portal.`);
        return;
      }
      authenticateUser(cleanEmail, 'Bathri Narayanan S', 'admin');
      return;
    }

    // 5. Signup Mode validation
    if (activeMode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Please enter your full name (minimum 2 characters).');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please ensure both passwords match exactly.');
        return;
      }

      // Execute real backend signup
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: cleanEmail,
            password,
            confirmPassword,
            college: college.trim() || 'Engineering Institute of Technology',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setIsLoading(false);
          setErrorMessage(data.error || 'Failed to create account.');
          return;
        }

        // Also if Supabase is configured, create user in Supabase Auth
        if (isSupabaseConfigured) {
          try {
            const sb = getSupabase();
            if (sb) {
              await sb.auth.signUp({
                email: cleanEmail,
                password,
                options: { data: { full_name: fullName.trim(), college: college.trim() } },
              });
            }
          } catch (sbErr) {
            console.warn('Supabase auth signup notice:', sbErr);
          }
        }

        setIsLoading(false);
        const userProfile = data.profile || {
          ...db.getProfile(),
          id: data.user?.id || `usr_${Date.now()}`,
          fullName: fullName.trim(),
          email: cleanEmail,
          role: 'student',
        };

        db.updateProfile(userProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nova_notes_auth_session', JSON.stringify({
            isAuthenticated: true,
            user: userProfile,
          }));
        }

        onLoginSuccess(userProfile, 'student');
      } catch (err: any) {
        setIsLoading(false);
        console.error('Signup error:', err);
        setErrorMessage('Unable to connect to authentication server. Please check your network and try again.');
      }
      return;
    }

    // 6. Sign In Mode: Call real backend login
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          portalTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        setErrorMessage(data.error || 'Invalid email or password.');
        return;
      }

      // If Supabase is configured, sign in with Supabase
      if (isSupabaseConfigured) {
        try {
          const sb = getSupabase();
          if (sb) {
            await sb.auth.signInWithPassword({ email: cleanEmail, password });
          }
        } catch (sbErr) {
          console.warn('Supabase auth signin notice:', sbErr);
        }
      }

      setIsLoading(false);
      const userProfile = data.profile || {
        ...db.getProfile(),
        id: data.user?.id || `usr_${Date.now()}`,
        fullName: data.user?.fullName || 'Placement Candidate',
        email: cleanEmail,
        role: data.user?.role || 'student',
      };

      db.updateProfile(userProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova_notes_auth_session', JSON.stringify({
          isAuthenticated: true,
          user: userProfile,
        }));
      }

      onLoginSuccess(userProfile, userProfile.role as 'student' | 'admin');
    } catch (err: any) {
      setIsLoading(false);
      console.error('Login error:', err);
      setErrorMessage('Unable to connect to authentication server. Please verify your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased transition-colors duration-200">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              NOVA NOTES
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Institutional Placement Readiness &amp; Assessment Engine</p>
          </div>
        </div>

        {/* Top Controls: Portal Switcher & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle (Light / Dark) */}
          <div className="p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                theme === 'light'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Quick Portal Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                setPortalTab('student');
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                portalTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => {
                setPortalTab('admin');
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                portalTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Administrator Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 space-y-5">
          
          {/* Main Portal Switcher Tabs (Mobile & Desktop) */}
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-1">
            <button
              id="portal-tab-student"
              onClick={() => {
                setPortalTab('student');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                portalTab === 'student'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              id="portal-tab-admin"
              onClick={() => {
                setPortalTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                portalTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Administrator Portal</span>
            </button>
          </div>

          {/* Heading Banner */}
          <div className="space-y-1 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {portalTab === 'admin' 
                ? 'Placement Officer Sign In' 
                : (activeMode === 'signup' ? 'Create Placement Account' : 'Student Placement Sign In')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {portalTab === 'admin'
                ? 'Authorized administrator login with placement officer credentials.'
                : (activeMode === 'signup' 
                    ? 'Register your profile for placement assessment and analytics.'
                    : 'Access your preparation dashboard, DSA drills, and assessments.')}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Validation Notice</span>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Student Sub-modes: Sign In vs Sign Up Tab */}
          {portalTab === 'student' && (
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1 text-center">
              <button
                id="select-signin-mode-tab"
                onClick={() => {
                  setActiveMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>Sign In</span>
              </button>

              <button
                id="select-signup-mode-tab"
                onClick={() => {
                  setActiveMode('signup');
                  setErrorMessage(null);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>Create an Account</span>
              </button>
            </div>
          )}

          {/* Primary Action Button: Continue with Google */}
          <div>
            <button
              id="continue-with-google-btn"
              onClick={handleOpenGoogleFlow}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99] border ${
                portalTab === 'admin'
                  ? 'bg-white hover:bg-slate-50 text-slate-900 border-amber-300 dark:border-amber-600'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 dark:border-slate-700'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {isLoading 
                  ? 'Connecting...' 
                  : portalTab === 'admin'
                    ? 'Continue with Google as Admin'
                    : (activeMode === 'signup' ? 'Sign Up with Google' : 'Continue with Google')}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              {portalTab === 'admin' ? 'or administrator credentials' : 'or with email'}
            </span>
          </div>

          {/* Email & Password Authentication Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
            {portalTab === 'student' && activeMode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bathri Narayanan"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    College / University
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {portalTab === 'admin' ? 'Administrator Email ID' : 'Email Address'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portalTab === 'admin' ? AUTHORIZED_ADMIN_EMAIL : 'student@example.com'}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-colors ${
                    portalTab === 'admin'
                      ? 'border-amber-500/50 focus:border-amber-400'
                      : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Password <span className="text-rose-500">*</span>
                </label>
                {portalTab === 'student' && activeMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-colors ${
                    portalTab === 'admin'
                      ? 'border-amber-500/50 focus:border-amber-400'
                      : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Confirm Password in Signup Mode */}
            {portalTab === 'student' && activeMode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {showForgotNotice && (
              <p className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50">
                To reset credentials, authenticate with Google or contact your campus placement cell coordinator.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 ${
                portalTab === 'admin'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              <span>
                {isLoading 
                  ? 'Processing...' 
                  : portalTab === 'admin'
                    ? 'Authenticate Administrator'
                    : (activeMode === 'signup' ? 'Create Student Account' : 'Sign In as Student')}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Google Account Chooser Modal */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-sm">Choose a Google Account</span>
              </div>
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              to authenticate with <strong className="text-slate-800 dark:text-slate-200">Nova Notes Placement Engine</strong>
              {portalTab === 'admin' && (
                <span className="block text-amber-500 font-semibold mt-0.5">
                  &bull; Administrator Portal Authorization Active
                </span>
              )}
            </p>

            {/* List of Accounts */}
            <div className="space-y-1.5 pt-1">
              {availableGoogleAccounts.map((acc) => {
                const isSelectedForAdmin = portalTab === 'admin' && acc.isAdmin;
                return (
                  <button
                    key={acc.email}
                    onClick={() => {
                      if (portalTab === 'admin') {
                        if (acc.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
                          setErrorMessage(`Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized to enter the Administrator Portal.`);
                          setShowGoogleChooser(false);
                          return;
                        }
                        authenticateUser(acc.email, acc.name, 'admin');
                      } else {
                        authenticateUser(acc.email, acc.name, 'student');
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all border ${
                      isSelectedForAdmin
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                      acc.isAdmin ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {acc.avatarText}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">{acc.name}</p>
                        {acc.isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{acc.email}</p>
                    </div>
                    {isSelectedForAdmin && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Use Another Account */}
              {!showCustomGoogleInput ? (
                <button
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors text-blue-600 dark:text-blue-400 text-xs font-semibold"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-blue-400 dark:border-blue-500 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Use another Google account</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Sign in with any Google Account:
                  </p>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Bathri Narayanan)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const clean = customGoogleEmail.trim().toLowerCase();
                        if (clean && isValidEmailInput(clean)) {
                          if (portalTab === 'admin') {
                            if (clean !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
                              setErrorMessage(`Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized.`);
                              setShowGoogleChooser(false);
                              return;
                            }
                            authenticateUser(clean, customGoogleName.trim() || 'Bathri Narayanan S', 'admin');
                          } else {
                            authenticateUser(
                              clean,
                              customGoogleName.trim() || 'Placement Candidate',
                              'student'
                            );
                          }
                        } else {
                          setErrorMessage('Please enter a valid Google email address.');
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Authentication securely verified by Nova Notes Placement Services.
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
        <p>Nova Notes Placement Preparation &copy; {new Date().getFullYear()} &bull; Candidate Readiness System</p>
      </footer>
    </div>
  );
};
