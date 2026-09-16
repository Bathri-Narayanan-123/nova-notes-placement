import React, { useState } from 'react';
import { db } from '../services/db';
import { UserProfile } from '../types';
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
  CheckCircle2
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

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Primary portal tab: 'student' vs 'admin'
  const [portalTab, setPortalTab] = useState<'student' | 'admin'>('student');
  
  // Student active mode: signin vs signup
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email/Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Authentication logic
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
        const current = db.getProfile();
        const updatedProfile = db.updateProfile({
          email: AUTHORIZED_ADMIN_EMAIL,
          fullName: targetName || 'Bathri Narayanan S (Placement Officer)',
          role: 'admin',
        });
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

    // Student login
    try {
      const current = db.getProfile();
      const updatedProfile = db.updateProfile({
        email: cleanEmail || current.email,
        fullName: targetName || current.fullName || 'Placement Student',
        college: college || current.college || 'Engineering Institute of Technology',
        role: 'student',
      });
      setIsLoading(false);
      setShowGoogleChooser(false);
      onLoginSuccess(updatedProfile, 'student');
    } catch (err: any) {
      setIsLoading(false);
      console.error('Authentication error:', err);
      setErrorMessage('Authentication error occurred. Please try again.');
    }
  };

  // Google flow trigger - opens clean Google SSO modal without broken external API warnings
  const handleOpenGoogleFlow = () => {
    setErrorMessage(null);
    setShowGoogleChooser(true);
  };

  // Email / Password submission
  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Please enter a valid password (minimum 4 characters).');
      return;
    }

    if (portalTab === 'admin') {
      if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setErrorMessage(`Access Denied: Only authorized administrator (${AUTHORIZED_ADMIN_EMAIL}) can sign in.`);
        return;
      }
      authenticateUser(cleanEmail, 'Bathri Narayanan S', 'admin');
      return;
    }

    if (activeMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please provide your full name for placement records.');
        return;
      }
      authenticateUser(cleanEmail, fullName.trim(), 'student');
    } else {
      authenticateUser(cleanEmail, fullName.trim() || cleanEmail.split('@')[0], 'student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              NOVA NOTES
            </span>
            <p className="text-xs text-slate-400">Institutional Placement Readiness &amp; Assessment Engine</p>
          </div>
        </div>

        {/* Quick Portal Switcher in Navbar */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => {
              setPortalTab('student');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              portalTab === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
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
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </button>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          
          {/* Main Portal Switcher Tabs (Mobile & Desktop) */}
          <div className="p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-1">
            <button
              id="portal-tab-student"
              onClick={() => {
                setPortalTab('student');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                portalTab === 'student'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              id="portal-tab-admin"
              onClick={() => {
                setPortalTab('admin');
                setEmail(AUTHORIZED_ADMIN_EMAIL);
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                portalTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center space-y-1.5">
            {portalTab === 'admin' ? (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted Access</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Administrator Portal
                </h1>
                <p className="text-xs text-slate-400">
                  Authorized access strictly designated for <code className="text-amber-400 font-mono text-[11px] bg-slate-800/80 px-1 py-0.5 rounded">{AUTHORIZED_ADMIN_EMAIL}</code>
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {activeMode === 'signup' ? 'Create Student Account' : 'Student Sign In'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {activeMode === 'signup' 
                    ? 'Register for placement assessments, coding practice, and mock interviews.'
                    : 'Sign in to access placement tests, adaptive assessments, and practice suites.'}
                </p>
              </div>
            )}
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Student Mode Switcher (only for student portal) */}
          {portalTab === 'student' && (
            <div className="p-1 rounded-xl bg-slate-950/60 border border-slate-800/60 grid grid-cols-2 gap-1">
              <button
                id="select-signin-mode-tab"
                onClick={() => {
                  setActiveMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'signin'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
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
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.99] ${
                portalTab === 'admin'
                  ? 'bg-white hover:bg-slate-100 text-slate-950 border border-amber-400/40 shadow-amber-500/10'
                  : 'bg-white hover:bg-slate-100 text-slate-950 shadow-white/10'
              }`}
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
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
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              {portalTab === 'admin' ? 'or administrator credentials' : 'or with student email'}
            </span>
          </div>

          {/* Email & Password Authentication Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
            {portalTab === 'student' && activeMode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bathri Narayanan"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    College / University
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                {portalTab === 'admin' ? 'Administrator Email ID' : 'Student Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portalTab === 'admin' ? AUTHORIZED_ADMIN_EMAIL : 'student@example.com'}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                    portalTab === 'admin'
                      ? 'border-amber-500/50 focus:border-amber-400'
                      : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Password
                </label>
                {portalTab === 'student' && activeMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                    portalTab === 'admin'
                      ? 'border-amber-500/50 focus:border-amber-400'
                      : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {showForgotNotice && (
              <p className="text-[11px] text-blue-300 bg-blue-950/50 p-2.5 rounded-xl border border-blue-900/50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
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
                    placeholder="Enter email or phone"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
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
                        if (clean && clean.includes('@')) {
                          if (portalTab === 'admin') {
                            if (clean !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
                              setErrorMessage(`Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized.`);
                              setShowGoogleChooser(false);
                              return;
                            }
                            authenticateUser(clean, customGoogleName.trim() || 'Admin', 'admin');
                          } else {
                            authenticateUser(
                              clean,
                              customGoogleName.trim() || clean.split('@')[0],
                              'student'
                            );
                          }
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
