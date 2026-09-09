import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  Shield, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Edit2,
  Save
} from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../services/db';

interface ProfileViewProps {
  profile: UserProfile;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.fullName);

  const handleSaveName = () => {
    db.updateProfile({ fullName: name });
    setIsEditing(false);
  };

  const handleToggleAdmin = () => {
    const nextRole = profile.role === 'admin' ? 'student' : 'admin';
    db.switchRole(nextRole);
  };

  return (
    <div id="profile-view" className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your account information.
        </p>
      </div>

      {/* User Hero Card (Page 7) */}
      <div 
        id="profile-hero-card"
        className="p-6 md:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.fullName}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                {profile.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {profile.email}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {profile.selectedRole}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member Since {profile.memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Switcher for Testing (Mandated by Section 37) */}
        <div>
          <button
            onClick={handleToggleAdmin}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Switch to {profile.role === 'admin' ? 'Student View' : 'Admin View'}
          </button>
        </div>
      </div>

      {/* Account Statistics Card (Page 7) */}
      <div 
        id="profile-statistics-card"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Account Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xl font-bold text-slate-900 dark:text-white">6</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assessments</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {profile.practiceQuestionsCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Practice Solved</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {profile.interviewStatus === 'completed' ? '1' : '0'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interviews</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {profile.sessionsCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sessions</p>
          </div>
        </div>
      </div>

      {/* Account Details Card (Page 8) */}
      <div 
        id="profile-details-card"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Account Details
        </h3>

        <div className="space-y-4">
          {/* Email */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-400">Email Address</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {profile.email}
              </p>
            </div>
            <Mail className="w-4 h-4 text-slate-400" />
          </div>

          {/* Full Name */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="space-y-0.5 flex-1 mr-4">
              <span className="text-xs font-medium text-slate-400">Full Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {profile.fullName}
                </p>
              )}
            </div>
            {isEditing ? (
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User ID */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-400">User ID</span>
              <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                {profile.id}
              </p>
            </div>
            <User className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Logout Button matching Page 8 */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
