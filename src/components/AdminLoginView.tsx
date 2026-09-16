import React, { useState } from 'react';
import { db } from '../services/db';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Mail,
  Key,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Lock,
  X,
  Plus
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';

interface AdminLoginViewProps {
  onLoginSuccess: (profile: UserProfile, targetRole: 'admin') => void;
  onReturnToStudent: () => void;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatarText: string;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onReturnToStudent }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Account Chooser Modal State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const availableGoogleAccounts: GoogleAccount[] = [
    {
      name: 'Bathri Narayanan S (Admin)',
      email: 'bathrinarayanan53@gmail.com',
      avatarText: 'BN',
    },
    {
      name: 'Student Candidate',
      email: 'student.candidate@novanotes.edu',
      avatarText: 'SC',
    },
  ];

  const verifyAndLoginAdmin = async (targetEmail: string, targetName: string) => {
    setIsLoading(true);
    setAccessDeniedMessage(null);
    setErrorMessage(null);

    try {
      // Server-side authorization verification
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();

      if (!data.isAuthorized) {
        setIsLoading(false);
        setAccessDeniedMessage(
          `Administrative Access Denied: The email "${targetEmail}" is not authorized. Access to this portal is restricted to authorized platform administrators.`
        );
        return;
      }

      // Record profile and log in as admin
      const updatedProfile = db.updateProfile({
        email: targetEmail,
        fullName: targetName || 'System Administrator',
        role: 'admin',
      });

      setIsLoading(false);
      setShowGoogleChooser(false);
      onLoginSuccess(updatedProfile, 'admin');
    } catch (err) {
      setIsLoading(false);
      setAccessDeniedMessage(`Verification failed for "${targetEmail}". Please check server connection.`);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }
    verifyAndLoginAdmin(email.trim(), email.split('@')[0]);
  };

  const handleOpenGoogleFlow = () => {
    setAccessDeniedMessage(null);
    setErrorMessage(null);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      }).catch(() => {
        setShowGoogleChooser(true);
      });
      return;
    }
    setShowGoogleChooser(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans antialiased">
      {/* Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              NOVA NOTES
            </span>
            <p className="text-xs text-purple-400 font-semibold">Administrative Access Gateway</p>
          </div>
        </div>

        <button
          onClick={onReturnToStudent}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
        >
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>Go to Student Portal</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mt-2">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400">
              Restricted portal. Server-side validation requires verified administrator credentials.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-200">Restricted Administration</p>
              <p className="text-[11px] text-purple-300/80 mt-0.5 leading-relaxed">
                Only verified platform administrators can authenticate here. Normal students cannot register or bypass access controls.
              </p>
            </div>
          </div>

          {/* Access Denied Alert */}
          {accessDeniedMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Authorization Verification Failed</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {accessDeniedMessage}
              </p>
              <div className="pt-1">
                <button
                  onClick={onReturnToStudent}
                  className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Return to Student Portal</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <button
            onClick={handleOpenGoogleFlow}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-lg bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate with Google Admin'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              or administrator credentials
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Administrator Key / Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
            >
              <span>{isLoading ? 'Verifying Clearance...' : 'Verify & Enter Admin Portal'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Google Account Chooser Modal */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-sm">Select Administrative Account</span>
              </div>
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an account to verify administrative clearance:
            </p>

            <div className="space-y-1.5 pt-1">
              {availableGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => verifyAndLoginAdmin(acc.email, acc.name)}
                  disabled={isLoading}
                  className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {acc.avatarText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}

              {!showCustomGoogleInput ? (
                <button
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors text-purple-600 dark:text-purple-400 text-xs font-semibold"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-purple-400 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Enter another administrative email</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                  <input
                    type="email"
                    placeholder="Enter admin email address"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
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
                        if (customGoogleEmail && customGoogleEmail.includes('@')) {
                          verifyAndLoginAdmin(
                            customGoogleEmail.trim(),
                            customGoogleName.trim() || customGoogleEmail.split('@')[0]
                          );
                        }
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[11px] font-bold"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
        <p>Nova Notes Administration &bull; Server-Enforced Security Protocols</p>
      </footer>
    </div>
  );
};
