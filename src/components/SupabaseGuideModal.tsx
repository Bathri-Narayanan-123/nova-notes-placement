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
  BookOpen
} from 'lucide-react';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Where to create the project',
      content: 'Go to https://supabase.com and click "Sign in" or "Start your project" using your GitHub or Google account.',
    },
    {
      num: 2,
      title: 'What to click',
      content: 'Click the green "New Project" button in the Supabase organization dashboard. Name it "nova-notes", choose your nearest region (e.g., ap-south-1 Mumbai or us-east-1), and set a secure database password.',
    },
    {
      num: 3,
      title: 'Where to enable Google Authentication',
      content: 'In your Supabase project left sidebar, click "Authentication" (icon with a lock or user). Under "Configuration", click "Providers". Scroll down to "Google" and toggle "Enable Google provider" to ON.',
    },
    {
      num: 4,
      title: 'Where to configure OAuth (Google Cloud Console)',
      content: 'Go to Google Cloud Console (console.cloud.google.com) -> APIs & Services -> Credentials -> Create Credentials -> OAuth client ID. Select "Web application". Add your authorized JavaScript origins and Redirect URI.',
    },
    {
      num: 5,
      title: 'What redirect URL to use',
      content: 'In Supabase under Authentication -> Providers -> Google, copy the "Callback URL (for OAuth)". It looks like: https://<your-project-ref>.supabase.co/auth/v1/callback. Paste this into Google Cloud Console as an "Authorized redirect URI".',
      code: 'https://<your-project-id>.supabase.co/auth/v1/callback',
    },
    {
      num: 6,
      title: 'Where to get the Project URL',
      content: 'In Supabase left sidebar, click "Project Settings" (gear icon) -> "API". Copy the "Project URL" under Project API configuration.',
      code: 'https://<your-project-ref>.supabase.co',
    },
    {
      num: 7,
      title: 'Where to get the publishable / anon key',
      content: 'In the same "Project Settings" -> "API" page, look under "Project API Keys" and copy the "anon public" key (starts with "eyJ...").',
      code: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    {
      num: 8,
      title: 'Where to put each environment variable',
      content: 'In the project root, open or create ".env" or configure the AI Studio Settings secrets panel. Set: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and ADMIN_EMAIL.',
      code: `VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
ADMIN_EMAIL=bathrinarayanan53@gmail.com`,
    },
    {
      num: 9,
      title: 'How to run migrations',
      content: 'In Supabase left sidebar, click "SQL Editor" (>_ icon). Click "New query". Copy the entire content from "/supabase/schema.sql" and click "Run". This creates all 16 tables, custom types, triggers, and Row Level Security policies.',
    },
    {
      num: 10,
      title: 'How to seed the database',
      content: 'The schema script automatically includes initial placement roles, default question bank, and system configurations. You can also run additional inserts from "supabase/schema.sql".',
    },
    {
      num: 11,
      title: 'How to create the first account',
      content: 'On the Nova Notes Login page, click "Student Login" -> "Continue with Google". Complete the Google sign-in. The Supabase auth trigger automatically creates your record in public.profiles with default role "student".',
    },
    {
      num: 12,
      title: 'How to promote the project owner to admin (Single Admin Mandate)',
      content: 'In the Supabase SQL Editor, run this single SQL command to grant sole administrative privileges to your authenticated account:',
      code: `UPDATE public.profiles
SET role = 'admin'
WHERE email = 'bathrinarayanan53@gmail.com';`,
    },
    {
      num: 13,
      title: 'How to test Student Login',
      content: 'On the Nova Notes Login page, ensure "Student Login" is selected. Click "Continue with Google". You will immediately be routed to the Student Dashboard with placement readiness, assessment history, practice, and AI interview modules.',
    },
    {
      num: 14,
      title: 'How to test Admin Login',
      content: 'Switch to "Admin Login". Click "Continue with Google". If your email matches ADMIN_EMAIL ("bathrinarayanan53@gmail.com"), you enter the Admin Dashboard. If any other email attempts Admin Login, the application rejects it with the "Admin Access Denied" card.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Supabase Cloud & Auth Setup Guide</h2>
              <p className="text-xs text-slate-400">Complete 14-Step Deployment & Configuration Instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm divide-y divide-slate-800/60">
          {steps.map((step, idx) => (
            <div key={step.num} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
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
            Also documented in <code>SUPABASE_SETUP.md</code> in project root.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
