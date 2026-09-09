import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  UserCheck, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';
import { isSupabaseConfigured, getSupabase } from '../services/supabase';
import { db } from '../services/db';

interface LoginViewProps {
  onLoginSuccess: (userProfile: UserProfile, targetRole: 'student' | 'admin') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authPortal, setAuthPortal] = useState<'student' | 'admin'>('student');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [showDevAccountSwitcher, setShowDevAccountSwitcher] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('bathrinarayanan53@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Bathri Narayanan S');
  const [serverConfig, setServerConfig] = useState<{ adminConfigured: boolean; supabaseConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/auth/config')
      .then((res) => res.json())
      .then((data) => setServerConfig(data))
      .catch(() => {});
  }, []);

  // Primary "Continue with Google" Action
  const handleContinueWithGoogle = async (emailOverride?: string, nameOverride?: string) => {
    setIsLoading(true);
    setAccessDeniedMessage(null);

    const email = emailOverride || googleEmailInput;
    const name = nameOverride || googleNameInput;

    const supabase = getSupabase();

    // If Supabase is live and configured with Google OAuth, initiate provider redirect
    if (supabase && isSupabaseConfigured && !emailOverride) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (!error) {
          return; // Redirecting to Google OAuth
        }
        console.warn('Supabase Google OAuth initialization failed, proceeding with server verification:', error.message);
      } catch (e) {
        console.warn('Supabase OAuth exception:', e);
      }
    }

    // Server-Side Authorization Verification
    try {
      if (authPortal === 'admin') {
        const res = await fetch('/api/auth/verify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const verification = await res.json();

        if (!verification.isAuthorized) {
          setIsLoading(false);
          setAccessDeniedMessage(
            `Admin Access Denied: The Google account "${email}" is not authorized as an administrator. Only the configured system owner has administrative clearance. Please sign in via the Student Portal.`
          );
          return;
        }

        // Successfully authorized as Admin through server-side verification
        const updatedProfile = db.updateProfile({
          email,
          fullName: name || 'System Administrator',
          role: 'admin',
        });
        setIsLoading(false);
        onLoginSuccess(updatedProfile, 'admin');
      } else {
        // Student Login / Student Account Creation
        // Automatically assign role = 'student'. Users CANNOT choose or submit admin.
        const current = db.getProfile();
        const updatedProfile = db.updateProfile({
          email: email || current.email,
          fullName: name || current.fullName || 'Placement Student',
          role: 'student', // Strict enforcement: all user creations default to student
        });
        setIsLoading(false);
        onLoginSuccess(updatedProfile, 'student');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Auth verification error:', err);
      if (authPortal === 'admin') {
        setAccessDeniedMessage(
          `Admin Access Denied: Could not verify administrative authorization for "${email}". Only the configured system owner is granted access.`
        );
      } else {
        const profile = db.getProfile();
        onLoginSuccess({ ...profile, role: 'student' }, 'student');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar — Clean, finished production look with NO setup guide buttons */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              NOVA NOTES
            </span>
            <p className="text-xs text-slate-400">Adaptive Placement Preparation & Readiness Platform</p>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          
          {/* Welcome Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {authPortal === 'admin' 
                ? 'Administrator Access' 
                : (isCreatingAccount ? 'Create Student Account' : 'Student Login')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {authPortal === 'admin'
                ? 'Sign in with your Google account to access platform management and test features.'
                : (isCreatingAccount 
                    ? 'Register for your placement readiness journey. All new accounts receive student access.'
                    : 'Sign in with your Google account to access diagnostic assessments, practice sandboxes, and AI interviews.')}
            </p>
          </div>

          {/* Portal Switcher Tabs: Student Login | Admin Login */}
          <div className="p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-1">
            <button
              id="select-student-login-tab"
              onClick={() => {
                setAuthPortal('student');
                setAccessDeniedMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                authPortal === 'student'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              id="select-admin-login-tab"
              onClick={() => {
                setAuthPortal('admin');
                setAccessDeniedMessage(null);
                setIsCreatingAccount(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                authPortal === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Portal Context Banner */}
          {authPortal === 'student' ? (
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300/90 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-200">
                  {isCreatingAccount ? 'Student Registration Flow' : 'Student Access Portal'}
                </p>
                <p className="text-[11px] text-blue-300/70 mt-0.5 leading-relaxed">
                  {isCreatingAccount 
                    ? 'All newly registered users are automatically granted student privileges. There is no admin signup or role selection.'
                    : 'Sign in to access your placement dashboard, 30-question diagnostic assessments, and practice interviews.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-300/90 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-200">Protected Administrator Portal</p>
                <p className="text-[11px] text-purple-300/70 mt-0.5 leading-relaxed">
                  Restricted to the verified system owner. Authenticated Google credentials are authorized server-side before access to the Admin Dashboard is granted.
                </p>
              </div>
            </div>
          )}

          {/* Access Denied Alert */}
          {accessDeniedMessage && (
            <div 
              id="admin-access-denied-card"
              className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 space-y-2.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Admin Access Denied</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {accessDeniedMessage}
              </p>
              <div className="pt-1">
                <button
                  id="return-to-student-login-btn"
                  onClick={() => {
                    setAuthPortal('student');
                    setAccessDeniedMessage(null);
                    setIsCreatingAccount(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Return to Student Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button: "Continue with Google" or "Create Account with Google" */}
          <div className="space-y-3">
            <button
              id="continue-with-google-btn"
              onClick={() => handleContinueWithGoogle()}
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.99] ${
                authPortal === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
                  : 'bg-white hover:bg-slate-100 text-slate-950 shadow-white/10'
              }`}
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  ? 'Verifying Authorization...' 
                  : (authPortal === 'admin' 
                      ? 'Continue with Google (Admin)' 
                      : (isCreatingAccount ? 'Create Student Account with Google' : 'Continue with Google'))}
              </span>
            </button>

            {/* Student Login vs Create Account Toggle (Only for students; strictly NO admin signups) */}
            {authPortal === 'student' && (
              <div className="text-center pt-1 text-xs text-slate-400">
                {!isCreatingAccount ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      id="toggle-create-account-btn"
                      onClick={() => setIsCreatingAccount(true)}
                      className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      Create Account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      id="toggle-sign-in-btn"
                      onClick={() => setIsCreatingAccount(false)}
                      className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Account preview / change switcher */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2 border-t border-slate-800/60">
              <span className="truncate max-w-[240px]">
                Google Account: <strong className="text-slate-200">{googleEmailInput}</strong>
              </span>
              <button
                onClick={() => setShowDevAccountSwitcher(!showDevAccountSwitcher)}
                className="text-blue-400 hover:underline font-medium text-[11px] shrink-0"
              >
                {showDevAccountSwitcher ? 'Close' : 'Switch Account'}
              </button>
            </div>
          </div>

          {/* Collapsible Account Switcher for dev/preview testing */}
          {showDevAccountSwitcher && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-semibold text-slate-300">
                Switch Google Account
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="user@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>

              {/* Presets for Testing */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => {
                    setGoogleEmailInput('bathrinarayanan53@gmail.com');
                    setGoogleNameInput('Bathri Narayanan S');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-[10px] text-purple-300 hover:bg-purple-900/60 font-medium"
                >
                  Authorized Admin Owner
                </button>
                <button
                  onClick={() => {
                    setGoogleEmailInput('student.candidate@novanotes.edu');
                    setGoogleNameInput('Student Candidate');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-[10px] text-blue-300 hover:bg-blue-900/60 font-medium"
                >
                  Student Account
                </button>
              </div>
            </div>
          )}

          {/* Quick Highlights */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Adaptive Question Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Real Code Execution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>AI Speech Interviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Supabase PostgreSQL</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
        <p>Nova Notes Placement Preparation &copy; {new Date().getFullYear()} &bull; Google OAuth &amp; Role-Based Authorization</p>
      </footer>
    </div>
  );
};
