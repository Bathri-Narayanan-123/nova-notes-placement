import React from 'react';
import { 
  TrendingUp, 
  Award, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { AssessmentAttempt, UserProfile } from '../types';

interface ProgressViewProps {
  profile: UserProfile;
  attempts: AssessmentAttempt[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, attempts }) => {
  // Calculate skill performances based on attempts
  const skills = [
    { name: 'Python', score: 35, color: 'bg-blue-600' },
    { name: 'OOP', score: 20, color: 'bg-indigo-600' },
    { name: 'DSA', score: 25, color: 'bg-amber-500' },
    { name: 'SQL', score: 40, color: 'bg-emerald-500' },
    { name: 'Problem Solving', score: 30, color: 'bg-purple-600' },
  ];

  // Calculate improvement metric
  const firstScore = attempts[attempts.length - 1]?.score || 0;
  const latestScore = attempts[0]?.score || 0;
  const delta = latestScore - firstScore;

  return (
    <div id="progress-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Progress
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your placement preparation journey.
        </p>
      </div>

      {/* 4 Top Metric Cards matching Page 6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Readiness */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Placement Readiness
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {profile.placementReadiness}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, profile.placementReadiness)}%` }}
            />
          </div>
        </div>

        {/* Assessment Attempts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Assessment Attempts
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {attempts.length}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            Completed total
          </span>
        </div>

        {/* Practice Questions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Practice Questions
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {profile.practiceQuestionsCount}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            Questions solved
          </span>
        </div>

        {/* Improvement */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Improvement
          </span>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </p>
            {delta >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-500" />
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
            Score trend delta
          </span>
        </div>
      </div>

      {/* Split Cards: Assessment History & Skill Performance (Page 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Assessment History */}
        <div 
          id="assessment-history-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Assessment History
          </h2>

          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Attempt {attempt.attemptNumber} · {attempt.role}
                  </p>
                  <p className="text-xs text-slate-400">
                    {attempt.date} · {attempt.durationMinutes} min
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {attempt.score}%
                  </span>
                  <div className="mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      attempt.isQualified
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                    }`}>
                      {attempt.isQualified ? 'Qualified' : 'Not qualified'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Skill Performance */}
        <div 
          id="skill-performance-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Skill Performance
          </h2>

          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{skill.name}</span>
                  <span>{skill.score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Skill scores are continually calibrated based on your accuracy in assessment and practice questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
