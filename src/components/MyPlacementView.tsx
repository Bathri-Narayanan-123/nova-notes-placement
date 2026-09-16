import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Lock, 
  Unlock, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Database, 
  BarChart3, 
  Brain,
  Check,
  X
} from 'lucide-react';
import { AssessmentAttempt, PlacementRole, UserProfile } from '../types';
import { NavTab } from './Sidebar';
import { db } from '../services/db';

interface MyPlacementViewProps {
  profile: UserProfile;
  roles: PlacementRole[];
  latestAttempt?: AssessmentAttempt;
  setActiveTab: (tab: NavTab) => void;
  onStartAssessment: (isAdaptive: boolean) => void;
}

export const MyPlacementView: React.FC<MyPlacementViewProps> = ({
  profile,
  roles,
  latestAttempt,
  setActiveTab,
  onStartAssessment,
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const currentRole = roles.find(
    (r) => r.title.toLowerCase() === profile.selectedRole.toLowerCase()
  ) || roles[0];

  const isQualified = (latestAttempt?.score || 0) >= 70;
  const isInterviewLocked = profile.interviewStatus === 'locked' && !isQualified;

  const handleSelectRole = (roleTitle: string) => {
    db.setSelectedRole(roleTitle);
    setIsRoleModalOpen(false);
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className="w-6 h-6" />;
      case 'Brain': return <Brain className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      case 'Database': return <Database className="w-6 h-6" />;
      default: return <Code2 className="w-6 h-6" />;
    }
  };

  return (
    <div id="placement-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Placement
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select your target role and track your assessment progress.
        </p>
      </div>

      {/* Selected Role Hero Card (Page 2) */}
      <div 
        id="placement-role-hero"
        className="p-6 md:p-7 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/15"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              {getRoleIcon(currentRole.icon)}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {currentRole.title}
              </h2>
              <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
                {currentRole.description}
              </p>
            </div>
          </div>

          <button
            id="change-role-btn"
            onClick={() => setIsRoleModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold tracking-wide uppercase backdrop-blur-xs transition-colors"
          >
            Change Role
          </button>
        </div>

        {/* Skill Badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          {currentRole.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-white/15 text-white border border-white/20 backdrop-blur-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Split Cards: Optional Practice & Assessment (Page 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Optional Practice */}
        <div 
          id="placement-practice-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Optional Practice
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Practice doesn't affect your assessment qualification, but helps you prepare.
            </p>
          </div>

          <div className="mt-8">
            <button
              id="go-to-practice-btn"
              onClick={() => setActiveTab('practice')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Go to Practice
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Card: Assessment */}
        <div 
          id="placement-assessment-card"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Assessment
              </h3>
              <div className="text-right">
                <span className="text-xs text-slate-400 dark:text-slate-500">Last Score</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {latestAttempt ? `${latestAttempt.score}%` : '0%'}
                </p>
              </div>
            </div>

            {/* Status indicator with red or green dot */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isQualified ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={`font-semibold ${isQualified ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isQualified ? 'Qualified' : 'Not Qualified'}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                · Attempt {latestAttempt ? latestAttempt.attemptNumber : 1}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              id="start-assessment-btn"
              onClick={() => onStartAssessment(true)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-colors flex items-center justify-center gap-2"
            >
              {latestAttempt ? 'Start Adaptive Reattempt' : 'Start Assessment'}
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              10 Role MCQ · 8 DSA · 10 Aptitude · 7 Output · 4 Coding (39 Questions)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Mock HR & Technical Interview Card */}
      <div 
        id="placement-interview-card"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Mock HR &amp; Technical Interview
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                isInterviewLocked
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isInterviewLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isInterviewLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Score at least 70% on the {currentRole.title} assessment to unlock this interview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct testing button as mandated by Rule 27 */}
            <button
              id="direct-test-interview-btn"
              onClick={() => setActiveTab('interview')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Direct Test Interview
            </button>
            {!isInterviewLocked && (
              <button
                onClick={() => setActiveTab('interview')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Launch Interview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Picker Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Select Target Placement Role
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assessments and practice materials will adapt to your chosen role.
                </p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {roles.map((role) => {
                const isSelected = role.title.toLowerCase() === currentRole.title.toLowerCase();
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role.title)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {role.title}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {role.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {role.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
