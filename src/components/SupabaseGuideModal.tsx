import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  ShieldCheck, 
  Key, 
  Code2, 
  Terminal,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server
} from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection, supabaseUrl } from '../services/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: err?.message || 'Connection test encountered an unexpected error.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const steps = [
    {
      num: 1,
      title: '1. Create a NEW Supabase Project',
      content: 'Navigate to https://supabase.com and sign in. Click "+ New project". Name it "nova-notes-prep", select a secure password, and pick the region closest to your users (e.g., ap-south-1 Mumbai for India). DO NOT touch or delete your old Nova Notes projects.',
    },
    {
      num: 2,
      title: '2. Execute Database Migration in SQL Editor',
      content: 'In your Supabase project left sidebar, click "SQL Editor" (>_ icon). Click "+ New query". Copy the entire 322-line SQL schema from "/supabase/schema.sql" in this project and click "Run". This bootstraps all 16 production tables, custom enums, and Row Level Security (RLS) policies.',
    },
    {
      num: 3,
      title: '3. Copy API Credentials into Environment',
      content: 'In Supabase left sidebar, click "Project Settings" (gear icon) -> "API". Copy the "Project URL" and the "anon public" API Key. Place them in your environment variables or ".env" file as shown below:',
      code: `VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"\nVITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\nADMIN_EMAIL="bathrinarayanan53@gmail.com"`,
    },
    {
      num: 4,
      title: '4. Optional Google OAuth Setup (Supabase Auth)',
      content: 'In Supabase under Authentication -> Providers -> Google, toggle ON. Under Google Cloud Console Credentials, create an OAuth 2.0 Web Client with the callback URL provided by Supabase.',
      code: 'https://<your-project-ref>.supabase.co/auth/v1/callback',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Database Connection &amp; Health Monitor</span>
              </h2>
              <p className="text-xs text-slate-400">
                Supabase PostgreSQL 16-Table Schema &bull; Review Safety Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status & Diagnostic Panel */}
        <div className="p-5 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-white">
                  Database Mode: {isSupabaseConfigured ? 'Live Supabase PostgreSQL Cloud' : 'Isolated Express & Local Storage Engine'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {isSupabaseConfigured
                  ? `Connected endpoint: ${supabaseUrl}`
                  : 'Operating in High-Reliability Local Mode. Ready to connect external Supabase credentials anytime.'}
              </p>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Probing Database...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
              testResult.connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold block">
                  {testResult.connected ? 'Connection Verified' : 'Diagnostic Notice'}
                </span>
                <p className="text-[11px] leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Review Presentation Safety Note */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>College Review Safety Architecture:</strong> The platform features dual-mode database tolerance. If external Supabase keys are disconnected or unconfigured during a presentation, the application seamlessly operates using user-isolated local state and backend REST endpoints with zero data loss or downtime.
            </p>
          </div>
        </div>

        {/* Scrollable Setup Steps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Supabase 4-Step Connection Procedure
            </span>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Open Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {steps.map((step, idx) => (
            <div key={step.num} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                  {step.num}
                </span>
                <h3 className="font-semibold text-white text-sm">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                {step.content}
              </p>
              {step.code && (
                <div className="pl-8 pt-1">
                  <div className="relative group bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{step.code}</pre>
                    <button
                      onClick={() => copyToClipboard(step.code!, idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            PostgreSQL schema located at: <code>supabase/schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
