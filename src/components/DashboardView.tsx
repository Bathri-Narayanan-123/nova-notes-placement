import React from 'react';
import { 
  Code2, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AssessmentAttempt, UserProfile } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  profile: UserProfile;
  attempts: AssessmentAttempt[];
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  attempts,
  setActiveTab,
}) => {
  const firstName = profile.fullName.split(' ')[0] || 'Student';
  const isInterviewLocked = profile.interviewStatus === 'locked';

  // Format progress bar color
  const getReadinessColor = (val: number) => {
    if (val >= 70) return 'bg-emerald-500';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div id="dashboard-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back 👋 {firstName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your placement preparation overview.
        </p>
      </div>

      {/* 4 Top Metric Cards (Page 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Role */}
        <div 
          id="metric-current-role"
          onClick={() => setActiveTab('placement')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Current Role
          </span>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {profile.selectedRole}
            </span>
          </div>
        </div>

        {/* Card 2: Assessment */}
        <div 
          id="metric-assessment"
          onClick={() => setActiveTab('assessment')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Assessment
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
              {profile.assessmentStatus}
            </span>
          </div>
        </div>

        {/* Card 3: AI HR Interview */}
        <div 
          id="metric-interview"
          onClick={() => setActiveTab('interview')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            AI HR Interview
          </span>
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isInterviewLocked
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isInterviewLocked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 text-emerald-500" />}
              {isInterviewLocked ? 'Locked' : 'Unlocked'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            {isInterviewLocked ? 'Pass the assessment to unlock' : 'Ready to begin your mock interview'}
          </p>
        </div>

        {/* Card 4: Placement Readiness */}
        <div 
          id="metric-readiness"
          onClick={() => setActiveTab('progress')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Placement Readiness
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.placementReadiness}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getReadinessColor(profile.placementReadiness)}`}
              style={{ width: `${Math.min(100, profile.placementReadiness)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Row: Strong Skills & Needs Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Skills */}
        <div 
          id="dashboard-strong-skills"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Strong Skills
          </h2>
          <div className="mt-4">
            {profile.strongSkills && profile.strongSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.strongSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3">
                Complete an assessment to see strong skills
              </p>
            )}
          </div>
        </div>

        {/* Needs Improvement */}
        <div 
          id="dashboard-needs-improvement"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Needs Improvement
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.needsImprovement && profile.needsImprovement.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Activity & Recent Attempts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Activity */}
        <div 
          id="dashboard-today-activity"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Today's Activity
            </h2>
            <div className="mt-4 flex items-baseline gap-6">
              <div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  1
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                  Sessions
                </span>
              </div>
              <div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.activeTimeMinutes}m
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">
                  Active Time
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Practice {profile.practiceMinutes}m</span>
            <span>Assessment {profile.assessmentMinutes}m</span>
            <span>Interview {profile.interviewMinutes}m</span>
          </div>
        </div>

        {/* Recent Attempts */}
        <div 
          id="dashboard-recent-attempts"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Attempts
            </h2>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {attempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-none"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Assessment Attempt {attempt.attemptNumber}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {attempt.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {attempt.score}%
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    attempt.isQualified
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                  }`}>
                    {attempt.isQualified ? 'Qualified' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
