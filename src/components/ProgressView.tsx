import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  ShieldCheck,
  Sparkles,
  Target,
  ListChecks,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { AssessmentAttempt, UserProfile } from '../types';
import { db } from '../services/db';

interface ProgressViewProps {
  profile: UserProfile;
  attempts: AssessmentAttempt[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, attempts }) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'qualified' | 'not-qualified'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  // Extract distinct roles from attempts
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    attempts.forEach((a) => {
      if (a.role) roles.add(a.role);
    });
    return Array.from(roles);
  }, [attempts]);

  // Filtered and sorted attempts
  const filteredAttempts = useMemo(() => {
    let list = attempts.filter((att) => {
      if (roleFilter !== 'all' && att.role !== roleFilter) return false;
      if (statusFilter === 'qualified' && !att.isQualified) return false;
      if (statusFilter === 'not-qualified' && att.isQualified) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'oldest') {
        return a.attemptNumber - b.attemptNumber;
      }
      if (sortOrder === 'highest') {
        return b.score - a.score;
      }
      if (sortOrder === 'lowest') {
        return a.score - b.score;
      }
      return b.attemptNumber - a.attemptNumber;
    });
  }, [attempts, roleFilter, statusFilter, sortOrder]);
  // Calculate dynamic skill performance based strictly on real assessment attempts
  const skills = useMemo(() => {
    if (!attempts || attempts.length === 0) {
      return [
        { name: 'Technical Core', score: 0, color: 'bg-blue-600' },
        { name: 'Data Structures & Algorithms', score: 0, color: 'bg-amber-500' },
        { name: 'Quantitative Aptitude', score: 0, color: 'bg-emerald-500' },
        { name: 'Pseudocode & Logic', score: 0, color: 'bg-purple-600' },
      ];
    }

    // Accumulate topic breakdowns from attempts
    const topicTotals: Record<string, { total: number; correct: number }> = {};
    attempts.forEach((att) => {
      if (att.topicBreakdown) {
        Object.entries(att.topicBreakdown).forEach(([topic, data]: [string, { total: number; correct: number; percentage?: number }]) => {
          if (!topicTotals[topic]) {
            topicTotals[topic] = { total: 0, correct: 0 };
          }
          topicTotals[topic].total += data.total;
          topicTotals[topic].correct += data.correct;
        });
      }
    });

    const palette = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-600', 'bg-sky-500'];
    const entries = Object.entries(topicTotals);

    if (entries.length === 0) {
      // Fallback from latest attempt scores
      const latest = attempts[0];
      return [
        { name: 'Technical MCQs', score: Math.round(((latest.mcqScore || 0) / 15) * 100), color: 'bg-blue-600' },
        { name: 'Aptitude & Logic', score: Math.round(((latest.aptitudeScore ?? 0) / 10) * 100), color: 'bg-emerald-500' },
        { name: 'Pseudocode Tracing', score: Math.round(((latest.pseudoScore || 0) / 10) * 100), color: 'bg-purple-600' },
        { name: 'Coding & SQL Tasks', score: Math.round(((latest.codingScore || 0) / 4) * 100), color: 'bg-amber-500' },
      ];
    }

    return entries.map(([name, data], idx) => {
      const score = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return {
        name,
        score,
        color: palette[idx % palette.length],
      };
    });
  }, [attempts]);

  // Genuine ML Readiness Prediction from Database Service
  const prediction = useMemo(() => {
    return db.predictPlacementReadiness(profile, attempts[0]);
  }, [profile, attempts]);

  // Calculate improvement metric between oldest and newest attempt
  const firstScore = attempts.length > 0 ? attempts[attempts.length - 1].score : 0;
  const latestScore = attempts.length > 0 ? attempts[0].score : 0;
  const delta = latestScore - firstScore;

  return (
    <div id="progress-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Progress &amp; Placement Readiness
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time performance analytics, adaptive tracking, and statistical readiness modeling.
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
              className={`h-full rounded-full transition-all duration-500 ${
                profile.placementReadiness >= 70 ? 'bg-emerald-500' : profile.placementReadiness >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
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

      {/* ML PLACEMENT READINESS PREDICTION MODULE (Phase 16) */}
      <div className="p-6 md:p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/60 text-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ML Placement Probability Model</h2>
              <p className="text-xs text-indigo-200/80">
                Multi-Feature Logistic Regressor &bull; Status: <span className="text-emerald-400 font-semibold">{prediction.modelStatus}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-indigo-300">Model Confidence</span>
            <p className="text-xl font-bold text-indigo-100">{prediction.confidence}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Probability Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-indigo-200">Predicted Placement Probability</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{prediction.probability}%</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                prediction.probability >= 70 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {prediction.verdict}
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  prediction.probability >= 70 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${prediction.probability}%` }}
              />
            </div>
          </div>

          {/* Feature Weights Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-indigo-200">Learned Feature Weights</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-100">
              <div>Assessment: <b className="text-white">{prediction.weights.assessment}</b></div>
              <div>Coding Tasks: <b className="text-white">{prediction.weights.coding}</b></div>
              <div>Aptitude: <b className="text-white">{prediction.weights.aptitude}</b></div>
              <div>Practice Rate: <b className="text-white">{prediction.weights.practice}</b></div>
            </div>
            <p className="text-[11px] text-indigo-300/70 pt-1">
              Coefficients calibrated for {profile.selectedRole} campus drives.
            </p>
          </div>

          {/* Missing Requirements Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-indigo-200">Placement Milestones Checklist</span>
            {prediction.missingRequirements.length > 0 ? (
              <ul className="space-y-1 text-xs text-rose-200">
                {prediction.missingRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                All placement milestones satisfied! Candidate is recruitment-ready.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Split Cards: Assessment History & Skill Performance (Page 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Assessment History with Cross-Role Retention and Filtering */}
        <div 
          id="assessment-history-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Assessment History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
                  {filteredAttempts.length} of {attempts.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Retained permanently across all job roles and assessment attempts.
              </p>
            </div>
            {attempts.length > 0 && (
              <button
                onClick={() => {
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setSortOrder('newest');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Filtering Controls */}
          {attempts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Role Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Job Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Job Roles ({availableRoles.length})</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Outcomes</option>
                  <option value="qualified">Qualified (&ge; 70%)</option>
                  <option value="not-qualified">Not Qualified (&lt; 70%)</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Score</option>
                  <option value="lowest">Lowest Score</option>
                </select>
              </div>
            </div>
          )}

          {/* Attempt List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredAttempts.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {attempts.length === 0 ? 'No assessment attempts recorded yet.' : 'No assessments match the selected filters.'}
                </p>
                <p className="text-xs text-slate-500">
                  {attempts.length === 0 
                    ? 'Complete your first diagnostic test to establish your baseline.' 
                    : 'Try selecting All Job Roles or All Outcomes to view past attempts.'}
                </p>
              </div>
            ) : (
              filteredAttempts.map((attempt) => {
                const isExpanded = expandedAttemptId === attempt.id;
                return (
                  <div
                    key={attempt.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div 
                      onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Attempt #{attempt.attemptNumber}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                            {attempt.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {attempt.date} · {attempt.durationMinutes} min · {attempt.totalQuestions || 39} Questions
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
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
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Drilldown Breakdown */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-150 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block">MCQs</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{attempt.mcqScore ?? 0} / 15</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block">Aptitude</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{attempt.aptitudeScore ?? 0} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block">Pseudocode</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{attempt.pseudoScore ?? 0} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block">Coding Tasks</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{attempt.codingScore ?? 0} / 4</span>
                          </div>
                        </div>

                        {attempt.strongTopics && attempt.strongTopics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mr-1">Strong:</span>
                            {attempt.strongTopics.map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px]">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {attempt.weakTopics && attempt.weakTopics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mr-1">Focus Areas:</span>
                            {attempt.weakTopics.map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px]">
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Real Skill Performance based on actual question attempts */}
        <div 
          id="skill-performance-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Skill &amp; Domain Performance
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
              Domain scores are dynamically calculated from your actual submissions in {profile.selectedRole} assessments and practice sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
