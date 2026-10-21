import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { spawn, execFile } from 'child_process';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ==================== PERSISTENT BACKEND DATABASE & AUTH ====================
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const DSA_PROGRESS_FILE = path.join(DATA_DIR, 'dsa_progress.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.json');
const INTERVIEWS_FILE = path.join(DATA_DIR, 'interviews.json');
const SYSTEM_CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');
const VERIFICATION_FILE = path.join(DATA_DIR, 'verification_codes.json');

const DEFAULT_CONFIG = {
  assessmentTimeMinutes: 30,
  qualificationThreshold: 70,
  cooldownMinutes: 120, // 2-hour waiting period between completed assessment attempts
};

function getSystemConfig() {
  return loadJsonFile(SYSTEM_CONFIG_FILE, DEFAULT_CONFIG);
}

// Generate secure 6-digit numeric OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function logAuditAction(action: string, performedBy: string, details: any) {
  try {
    const logs = loadJsonFile<any[]>(AUDIT_LOGS_FILE, []);
    logs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    });
    // Keep last 500 audit entries
    if (logs.length > 500) logs.pop();
    saveJsonFile(AUDIT_LOGS_FILE, logs);
  } catch {}
}

function calculateBackendReadinessScore(
  latestScore: number,
  practiceCount: number,
  interviewScore: number
): number {
  const assessmentWeight = Math.min(100, Math.max(0, latestScore)) * 0.5;
  const practiceWeight = Math.min(100, (Math.max(0, practiceCount) / 50) * 100) * 0.25;
  const interviewWeight =
    (interviewScore > 0 ? interviewScore : latestScore >= 70 ? 70 : 20) * 0.25;
  return Math.round(assessmentWeight + practiceWeight + interviewWeight);
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function loadJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function saveJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial seed users if database is fresh
function initUserDatabase() {
  const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
  const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});

  const adminEmail = (process.env.ADMIN_EMAIL || 'bathrinarayanan53@gmail.com').toLowerCase();
  if (!users[adminEmail]) {
    const salt = crypto.randomBytes(16).toString('hex');
    const adminId = 'usr_admin_101';
    users[adminEmail] = {
      id: adminId,
      email: adminEmail,
      fullName: 'Bathri Narayanan S',
      role: 'admin',
      salt,
      passwordHash: hashPassword('Admin@123', salt),
      college: 'Nova Institute of Technology',
      themePreference: 'light',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles[adminId] = {
      id: adminId,
      email: adminEmail,
      fullName: 'Bathri Narayanan S',
      role: 'admin',
      selectedRole: 'Python Developer',
      college: 'Nova Institute of Technology',
      themePreference: 'light',
      memberSince: '8/22/2026',
      placementReadiness: 88,
      sessionsCount: 65,
      activeTimeMinutes: 45,
      practiceMinutes: 30,
      assessmentMinutes: 40,
      interviewMinutes: 25,
      practiceQuestionsCount: 42,
      assessmentStatus: 'Qualified (85%)',
      interviewStatus: 'unlocked',
      strongSkills: ['Python', 'System Architecture', 'DSA'],
      needsImprovement: ['SQL Optimization'],
      updatedAt: new Date().toISOString(),
    };
  }

  const studentEmail = 'student.candidate@novanotes.edu';
  if (!users[studentEmail]) {
    const salt = crypto.randomBytes(16).toString('hex');
    const studentId = 'usr_student_102';
    users[studentEmail] = {
      id: studentId,
      email: studentEmail,
      fullName: 'Placement Candidate',
      role: 'student',
      salt,
      passwordHash: hashPassword('Student@123', salt),
      college: 'Engineering Institute of Technology',
      themePreference: 'light',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles[studentId] = {
      id: studentId,
      email: studentEmail,
      fullName: 'Placement Candidate',
      role: 'student',
      selectedRole: 'Python Developer',
      college: 'Engineering Institute of Technology',
      themePreference: 'light',
      memberSince: '9/01/2026',
      placementReadiness: 32,
      sessionsCount: 12,
      activeTimeMinutes: 15,
      practiceMinutes: 20,
      assessmentMinutes: 30,
      interviewMinutes: 0,
      practiceQuestionsCount: 25,
      assessmentStatus: '2% In Progress',
      interviewStatus: 'locked',
      strongSkills: [],
      needsImprovement: ['Python', 'OOP', 'DSA', 'SQL'],
      updatedAt: new Date().toISOString(),
    };
  }

  const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
  const adminId = 'usr_admin_101';
  if (!attemptsMap[adminId]) {
    attemptsMap[adminId] = [
      {
        id: 'att-admin-6',
        attemptNumber: 6,
        studentId: adminId,
        role: 'Python Developer',
        date: '9/7/2026',
        timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 5).toISOString(),
        score: 85,
        percentage: 85,
        isQualified: true,
        mcqScore: 14,
        aptitudeScore: 9,
        pseudoScore: 8,
        codingScore: 4,
        totalQuestions: 39,
        correctCount: 35,
        durationMinutes: 24,
        questions: [],
        answers: {},
        topicBreakdown: {
          Python: { total: 15, correct: 14, percentage: 93 },
          DSA: { total: 10, correct: 9, percentage: 90 },
          SQL: { total: 10, correct: 8, percentage: 80 },
          SystemArchitecture: { total: 4, correct: 4, percentage: 100 },
        },
        weakTopics: ['SQL Optimization'],
        strongTopics: ['Python', 'DSA', 'System Architecture'],
        isAdaptive: true,
        status: 'Qualified',
      },
    ];
  }

  saveJsonFile(USERS_FILE, users);
  saveJsonFile(PROFILES_FILE, profiles);
  saveJsonFile(ATTEMPTS_FILE, attemptsMap);
  const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});
  saveJsonFile(INTERVIEWS_FILE, interviewsMap);
}

initUserDatabase();

// Email validation helper: strictly rejects abc, abc@, abc@gmail, @gmail.com, test@, test@gmail.
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Valid email regex requiring valid local part, @, valid domain, and at least 2 char TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return false;
  
  // Explicitly guard against trailing dot or incomplete domain
  if (trimmed.endsWith('.') || trimmed.includes('..')) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (!domain.includes('.')) return false;
  const domainParts = domain.split('.');
  if (domainParts[domainParts.length - 1].length < 2) return false;

  return true;
}

// 1. SIGNUP ENDPOINT (Requires Email Verification OTP)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, college } = req.body;

    // Validate Full Name
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (minimum 2 characters).' });
    }

    // Validate Email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address (e.g., student@example.com or user@gmail.com). Incomplete formats like "abc@", "test@gmail.", or "@gmail.com" are not permitted.',
      });
    }

    // Validate Password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters long.' });
    }

    // Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please re-enter your password confirmation.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});

    if (users[cleanEmail]) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in instead.' });
    }

    // Generate 6-digit OTP code for email verification
    const otp = generateOtp();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    
    const salt = crypto.randomBytes(16).toString('hex');
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const role = cleanEmail === (process.env.ADMIN_EMAIL || 'bathrinarayanan53@gmail.com').toLowerCase() ? 'admin' : 'student';

    verificationMap[cleanEmail] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      type: 'signup',
      lastSentAt: Date.now(),
      pendingUser: {
        id: userId,
        email: cleanEmail,
        fullName: cleanName,
        role,
        college: college ? String(college).trim() : 'Engineering Institute of Technology',
        salt,
        passwordHash: hashPassword(password, salt),
        themePreference: 'light',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    saveJsonFile(VERIFICATION_FILE, verificationMap);

    console.log(`[EMAIL_VERIFICATION] 6-Digit Verification Code for ${cleanEmail}: ${otp}`);
    logAuditAction('SIGNUP_VERIFICATION_SENT', cleanEmail, { email: cleanEmail, expiresMinutes: 10 });

    res.status(200).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter the code to complete registration.`,
      // Expose code in development payload if SMTP is not configured
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred during signup.' });
  }
});

// 2. VERIFY EMAIL AND ACTIVATE ACCOUNT
app.post('/api/auth/verify-email', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    const record = verificationMap[cleanEmail];

    if (!record || record.type !== 'signup') {
      return res.status(400).json({ error: 'No pending verification found for this email. Please sign up first.' });
    }

    if (Date.now() > record.expiresAt) {
      delete verificationMap[cleanEmail];
      saveJsonFile(VERIFICATION_FILE, verificationMap);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.code !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
    }

    // Code is valid! Commit user to database
    const pendingUser = record.pendingUser;
    delete verificationMap[cleanEmail];
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});

    const newUser = {
      ...pendingUser,
      isEmailVerified: true,
      updatedAt: new Date().toISOString(),
    };

    const newProfile = {
      id: pendingUser.id,
      email: cleanEmail,
      fullName: pendingUser.fullName,
      role: pendingUser.role,
      selectedRole: 'Python Developer',
      college: pendingUser.college,
      themePreference: 'light',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      placementReadiness: 0,
      sessionsCount: 1,
      activeTimeMinutes: 0,
      practiceMinutes: 0,
      assessmentMinutes: 0,
      interviewMinutes: 0,
      practiceQuestionsCount: 0,
      dsaSolvedCount: 0,
      assessmentStatus: 'Not Started',
      interviewStatus: 'locked',
      strongSkills: [],
      needsImprovement: [],
      isEmailVerified: true,
      updatedAt: new Date().toISOString(),
    };

    users[cleanEmail] = newUser;
    profiles[pendingUser.id] = newProfile;

    // Initialize user-isolated storage entries
    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    attemptsMap[pendingUser.id] = [];
    saveJsonFile(ATTEMPTS_FILE, attemptsMap);

    const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});
    interviewsMap[pendingUser.id] = [];
    saveJsonFile(INTERVIEWS_FILE, interviewsMap);

    const dsaMap = loadJsonFile<Record<string, any>>(DSA_PROGRESS_FILE, {});
    dsaMap[pendingUser.id] = {};
    saveJsonFile(DSA_PROGRESS_FILE, dsaMap);

    saveJsonFile(USERS_FILE, users);
    saveJsonFile(PROFILES_FILE, profiles);

    logAuditAction('USER_REGISTERED_VERIFIED', cleanEmail, { userId: pendingUser.id, role: pendingUser.role });

    res.status(201).json({
      success: true,
      message: 'Email verified and account created successfully!',
      user: {
        id: pendingUser.id,
        email: cleanEmail,
        fullName: pendingUser.fullName,
        role: pendingUser.role,
      },
      profile: newProfile,
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email address.' });
  }
});

// 3. RESEND VERIFICATION OTP
app.post('/api/auth/resend-otp', (req, res) => {
  try {
    const { email, type = 'signup' } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    const existing = verificationMap[cleanEmail];

    // Rate limit: 30 seconds
    if (existing && Date.now() - (existing.lastSentAt || 0) < 30000) {
      const waitSec = Math.ceil((30000 - (Date.now() - existing.lastSentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting a new code.` });
    }

    const otp = generateOtp();
    verificationMap[cleanEmail] = {
      ...(existing || {}),
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      lastSentAt: Date.now(),
      type,
    };
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    console.log(`[EMAIL_SERVICE] Fresh OTP Code for ${cleanEmail} (${type}): ${otp}`);
    res.json({
      success: true,
      message: `A fresh 6-digit verification code has been sent to ${cleanEmail}.`,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to resend code.' });
  }
});

// 4. PASSWORDLESS EMAIL OTP LOGIN REQUEST
app.post('/api/auth/otp-login-request', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    const user = users[cleanEmail];

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please sign up first.' });
    }

    const otp = generateOtp();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    verificationMap[cleanEmail] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      type: 'login',
      lastSentAt: Date.now(),
      userId: user.id,
    };
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    console.log(`[EMAIL_SERVICE] Login OTP Code for ${cleanEmail}: ${otp}`);
    logAuditAction('LOGIN_OTP_REQUESTED', cleanEmail, { email: cleanEmail });

    res.json({
      success: true,
      message: `A 6-digit login code has been sent to ${cleanEmail}.`,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to request login OTP.' });
  }
});

// 5. PASSWORDLESS EMAIL OTP LOGIN VERIFY
app.post('/api/auth/otp-login-verify', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    const record = verificationMap[cleanEmail];

    if (!record || record.type !== 'login') {
      return res.status(400).json({ error: 'No pending login code found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      delete verificationMap[cleanEmail];
      saveJsonFile(VERIFICATION_FILE, verificationMap);
      return res.status(400).json({ error: 'Login code has expired. Please request a new code.' });
    }

    if (record.code !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid login code. Please check your email and try again.' });
    }

    delete verificationMap[cleanEmail];
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const user = users[cleanEmail];

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const profile = profiles[user.id] || {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      selectedRole: 'Python Developer',
      themePreference: user.themePreference || 'light',
    };

    logAuditAction('USER_LOGGED_IN_OTP', cleanEmail, { userId: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful via Email OTP',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify login OTP.' });
  }
});

// 6. PASSWORD RESET REQUEST
app.post('/api/auth/reset-password-request', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    if (!users[cleanEmail]) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    const otp = generateOtp();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    verificationMap[cleanEmail] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      type: 'reset',
      lastSentAt: Date.now(),
    };
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    console.log(`[EMAIL_SERVICE] Password Reset Code for ${cleanEmail}: ${otp}`);
    logAuditAction('PASSWORD_RESET_REQUESTED', cleanEmail, { email: cleanEmail });

    res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`,
      devOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to request password reset code.' });
  }
});

// 7. PASSWORD RESET VERIFY & SET NEW PASSWORD
app.post('/api/auth/reset-password-verify', (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const verificationMap = loadJsonFile<Record<string, any>>(VERIFICATION_FILE, {});
    const record = verificationMap[cleanEmail];

    if (!record || record.type !== 'reset') {
      return res.status(400).json({ error: 'No password reset request found for this email.' });
    }

    if (Date.now() > record.expiresAt) {
      delete verificationMap[cleanEmail];
      saveJsonFile(VERIFICATION_FILE, verificationMap);
      return res.status(400).json({ error: 'Password reset code has expired. Please request a new code.' });
    }

    if (record.code !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid reset code. Please check your email and try again.' });
    }

    delete verificationMap[cleanEmail];
    saveJsonFile(VERIFICATION_FILE, verificationMap);

    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    const user = users[cleanEmail];
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    user.salt = salt;
    user.passwordHash = hashPassword(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    saveJsonFile(USERS_FILE, users);

    logAuditAction('PASSWORD_RESET_COMPLETED', cleanEmail, { userId: user.id });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 8. STANDARD PASSWORD LOGIN ENDPOINT
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, portalTab = 'student' } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});

    const user = users[cleanEmail];
    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email address. Please verify your email or sign up.',
      });
    }

    // Check Administrator portal authorization
    const adminEmail = (process.env.ADMIN_EMAIL || 'bathrinarayanan53@gmail.com').toLowerCase();
    if (portalTab === 'admin' && cleanEmail !== adminEmail && user.role !== 'admin') {
      return res.status(403).json({
        error: `Access Denied: Only authorized administrator (${adminEmail}) has Administrator privileges.`,
      });
    }

    // Verify Password Hash
    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      if (user.password && user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password. Please verify your credentials and try again.' });
      } else if (!user.password && computedHash !== user.passwordHash) {
        return res.status(401).json({ error: 'Incorrect password. Please verify your credentials and try again.' });
      }
    }

    // Fetch user profile
    const profile = profiles[user.id] || {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      selectedRole: 'Python Developer',
      themePreference: user.themePreference || 'light',
    };

    logAuditAction('USER_LOGGED_IN_PASSWORD', cleanEmail, { userId: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

// ==================== PLACEMENT STAFF & INSTITUTIONAL PORTAL API ====================

// Middleware helper to ensure staff or admin authorization
function verifyStaffOrAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userRole = req.headers['x-user-role'] as string;
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || 'bathrinarayanan53@gmail.com').toLowerCase();

  if (userRole === 'staff' || userRole === 'admin' || userEmail === adminEmail) {
    return next();
  }

  return res.status(403).json({
    error: 'Access Denied: Placement Staff or Administrator privileges are required to access this institutional endpoint.',
  });
}

// Get Students Roster for Placement Staff
app.get('/api/staff/students', verifyStaffOrAdmin, (req, res) => {
  try {
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});

    const studentList = Object.values(profiles).map((p: any) => {
      const userAttempts = attemptsMap[p.id] || [];
      const userInterviews = interviewsMap[p.id] || [];
      const latestAttempt = userAttempts[0] || null;

      return {
        id: p.id,
        fullName: p.fullName || 'Unknown Student',
        email: p.email,
        college: p.college || 'Engineering Institute of Technology',
        selectedRole: p.selectedRole || 'Python Developer',
        role: p.role || 'student',
        placementReadiness: p.placementReadiness || 0,
        assessmentStatus: p.assessmentStatus || 'Not Started',
        interviewStatus: p.interviewStatus || 'locked',
        attemptsCount: userAttempts.length,
        latestScore: latestAttempt ? latestAttempt.score : null,
        latestAttemptDate: latestAttempt ? (latestAttempt.date || latestAttempt.timestamp) : null,
        isQualified: latestAttempt ? !!latestAttempt.isQualified : false,
        interviewsCount: userInterviews.length,
        dsaSolvedCount: p.dsaSolvedCount || 0,
        memberSince: p.memberSince || 'N/A',
      };
    });

    res.json({ success: true, students: studentList });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve students roster for placement staff.' });
  }
});

// Get Individual Student Detailed Preparation Report for Staff
app.get('/api/staff/student/:studentId/report', verifyStaffOrAdmin, (req, res) => {
  try {
    const { studentId } = req.params;
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});
    const dsaMap = loadJsonFile<Record<string, any>>(DSA_PROGRESS_FILE, {});

    const profile = profiles[studentId];
    if (!profile) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const attempts = attemptsMap[studentId] || [];
    const interviews = interviewsMap[studentId] || [];
    const dsaProgress = dsaMap[studentId] || {};

    res.json({
      success: true,
      profile,
      attempts,
      interviews,
      dsaProgress,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate student report.' });
  }
});

// Assign Placement Assessment to Student or Group
app.post('/api/staff/assign-assessment', verifyStaffOrAdmin, (req, res) => {
  try {
    const { title, targetRole, studentId, studentName, deadline, instructions, assignedBy } = req.body;

    if (!title || !targetRole || !deadline) {
      return res.status(400).json({ error: 'Title, target role, and deadline are required.' });
    }

    const assignments = loadJsonFile<any[]>(ASSIGNMENTS_FILE, []);
    const newAssignment = {
      id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: String(title).trim(),
      targetRole: String(targetRole).trim(),
      studentId: studentId ? String(studentId).trim() : undefined,
      studentName: studentName ? String(studentName).trim() : 'All Students',
      deadline: String(deadline).trim(),
      instructions: instructions ? String(instructions).trim() : 'Complete the diagnostic placement assessment prior to campus recruitment rounds.',
      assignedBy: assignedBy || 'Placement Office',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    assignments.unshift(newAssignment);
    saveJsonFile(ASSIGNMENTS_FILE, assignments);

    logAuditAction('ASSESSMENT_ASSIGNED', assignedBy || 'Staff', { assignmentId: newAssignment.id, title, studentId });

    res.status(201).json({
      success: true,
      message: 'Assessment assigned successfully to student(s).',
      assignment: newAssignment,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign assessment.' });
  }
});

// Get Placement Assignments List
app.get('/api/staff/assignments/:studentId?', (req, res) => {
  try {
    const assignments = loadJsonFile<any[]>(ASSIGNMENTS_FILE, []);
    const studentId = req.params.studentId;

    if (studentId) {
      // Filter for specific student or broadcast assignments (studentId undefined or matching)
      const userAssignments = assignments.filter((a) => !a.studentId || a.studentId === studentId);
      return res.json({ success: true, assignments: userAssignments });
    }

    res.json({ success: true, assignments });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve assignments.' });
  }
});

// Export Students Readiness Summary to CSV
app.get('/api/staff/export-csv', verifyStaffOrAdmin, (req, res) => {
  try {
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});

    const headers = ['Student ID', 'Full Name', 'Email', 'College', 'Target Role', 'Placement Readiness (%)', 'Assessment Status', 'Latest Score (%)', 'Total Attempts', 'DSA Problems Solved', 'Interview Status', 'Member Since'];
    const rows = [headers.join(',')];

    Object.values(profiles).forEach((p: any) => {
      const userAttempts = attemptsMap[p.id] || [];
      const latest = userAttempts[0];
      const row = [
        `"${p.id || ''}"`,
        `"${p.fullName || ''}"`,
        `"${p.email || ''}"`,
        `"${p.college || ''}"`,
        `"${p.selectedRole || ''}"`,
        p.placementReadiness || 0,
        `"${p.assessmentStatus || 'Not Started'}"`,
        latest ? latest.score : 0,
        userAttempts.length,
        p.dsaSolvedCount || 0,
        `"${p.interviewStatus || 'locked'}"`,
        `"${p.memberSince || ''}"`,
      ];
      rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="placement_readiness_report.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// 3. PROFILE ENDPOINTS
app.get('/api/profile/:id?', (req, res) => {
  try {
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const id = req.params.id;
    if (id && profiles[id]) {
      return res.json({ success: true, profile: profiles[id] });
    }
    // Return first profile or default
    const firstId = Object.keys(profiles)[0];
    res.json({ success: true, profile: firstId ? profiles[firstId] : null });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    const updates = req.body;
    if (!updates || !updates.id) {
      return res.status(400).json({ error: 'User id is required to update profile' });
    }
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const users = loadJsonFile<Record<string, any>>(USERS_FILE, {});

    const existing = profiles[updates.id] || {};
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    profiles[updates.id] = updated;
    saveJsonFile(PROFILES_FILE, profiles);

    // If full_name or email changed, update users table as well
    if (updates.email && users[updates.email.toLowerCase()]) {
      const u = users[updates.email.toLowerCase()];
      if (updates.fullName) u.fullName = updates.fullName;
      if (updates.themePreference) u.themePreference = updates.themePreference;
      u.updatedAt = new Date().toISOString();
      saveJsonFile(USERS_FILE, users);
    }

    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Output normalization helper for test cases, pseudocode, and coding outputs
function normalizeOutputForComparison(actual: string, expected: string): boolean {
  if (typeof actual !== 'string' || typeof expected !== 'string') {
    return String(actual ?? '').trim() === String(expected ?? '').trim();
  }
  const normActual = actual.trim().replace(/\r\n/g, '\n');
  const normExpected = expected.trim().replace(/\r\n/g, '\n');
  if (normActual === normExpected) return true;
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  try {
    const jsonA = JSON.parse(normActual.replace(/'/g, '"'));
    const jsonB = JSON.parse(normExpected.replace(/'/g, '"'));
    if (JSON.stringify(jsonA) === JSON.stringify(jsonB)) return true;
  } catch {}

  const numA = Number(normActual);
  const numB = Number(normExpected);
  if (!isNaN(numA) && !isNaN(numB) && Math.abs(numA - numB) < 1e-6) return true;

  if (normActual.replace(/\s+/g, '') === normExpected.replace(/\s+/g, '')) return true;

  return false;
}

// ==================== SYSTEM CONFIG ENDPOINTS ====================
app.get('/api/system/config', (req, res) => {
  res.json({ success: true, config: getSystemConfig() });
});

app.put('/api/system/config', (req, res) => {
  try {
    const current = getSystemConfig();
    const updated = { ...current, ...req.body };
    saveJsonFile(SYSTEM_CONFIG_FILE, updated);
    res.json({ success: true, config: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update system config' });
  }
});

// ==================== ASSESSMENT & COOLDOWN ENDPOINTS ====================

// Check Cooldown Status for a specific user
app.get('/api/assessment/cooldown/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    const userAttempts = attemptsMap[userId] || [];
    const config = getSystemConfig();
    const cooldownMinutes = Number(config.cooldownMinutes) || 120;
    const cooldownMs = cooldownMinutes * 60 * 1000;

    if (!userAttempts || userAttempts.length === 0) {
      return res.json({
        inCooldown: false,
        remainingSeconds: 0,
        nextEligibleTime: null,
        cooldownMinutes,
        lastAttemptTime: null,
        totalAttempts: 0,
      });
    }

    // Sort descending by timestamp
    const sorted = [...userAttempts].sort((a, b) => {
      const tA = new Date(a.timestamp || a.date).getTime();
      const tB = new Date(b.timestamp || b.date).getTime();
      return tB - tA;
    });

    const latest = sorted[0];
    const latestTime = new Date(latest.timestamp || latest.date).getTime();
    const now = Date.now();
    const elapsed = now - latestTime;

    if (elapsed < cooldownMs) {
      const remainingSeconds = Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000));
      const nextEligibleTime = new Date(latestTime + cooldownMs).toISOString();
      return res.json({
        inCooldown: true,
        remainingSeconds,
        nextEligibleTime,
        cooldownMinutes,
        lastAttemptTime: new Date(latestTime).toISOString(),
        latestAttemptNumber: latest.attemptNumber,
        latestScore: latest.score,
        totalAttempts: userAttempts.length,
      });
    }

    return res.json({
      inCooldown: false,
      remainingSeconds: 0,
      nextEligibleTime: null,
      cooldownMinutes,
      lastAttemptTime: new Date(latestTime).toISOString(),
      latestAttemptNumber: latest.attemptNumber,
      latestScore: latest.score,
      totalAttempts: userAttempts.length,
    });
  } catch (error: any) {
    console.error('Cooldown check error:', error);
    res.status(500).json({ error: 'Failed to verify assessment cooldown status' });
  }
});

// Submit Assessment: Authoritative backend scoring & cooldown enforcement
app.post('/api/assessment/submit', async (req, res) => {
  try {
    const {
      studentId,
      role = 'Python Developer',
      questions = [],
      answers = {},
      codingDrafts = {},
      codingEvaluations = {},
      elapsedMinutes = 25,
      isAdaptive = false,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required for assessment submission' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions payload is required' });
    }

    const config = getSystemConfig();
    const cooldownMinutes = Number(config.cooldownMinutes) || 120;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const threshold = Number(config.qualificationThreshold) || 70;

    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    const userAttempts = attemptsMap[studentId] || [];

    // Backend Cooldown Validation
    if (userAttempts.length > 0) {
      const sorted = [...userAttempts].sort((a, b) => {
        const tA = new Date(a.timestamp || a.date).getTime();
        const tB = new Date(b.timestamp || b.date).getTime();
        return tB - tA;
      });
      const latest = sorted[0];
      const latestTime = new Date(latest.timestamp || latest.date).getTime();
      const elapsed = Date.now() - latestTime;

      if (elapsed < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
        const nextEligibleTime = new Date(latestTime + cooldownMs).toISOString();
        return res.status(429).json({
          error: `Assessment attempt is locked by the waiting cooldown. Please wait before reattempting.`,
          inCooldown: true,
          remainingSeconds,
          nextEligibleTime,
        });
      }
    }

    // Authoritative scoring calculation
    let mcqScore = 0;
    let aptitudeScore = 0;
    let pseudoScore = 0;
    let codingScore = 0;
    let correctCount = 0;

    const topicBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};

    for (const q of questions) {
      const topic = q.topic || 'Core Placement';
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0, percentage: 0 };
      }
      topicBreakdown[topic].total += 1;

      const userAns = answers[q.id] || codingDrafts[q.id] || '';
      let isCorrect = false;

      const qType = String(q.type || 'MCQ').toUpperCase();

      if (qType === 'MCQ' || qType === 'MSQ' || qType === 'DSA') {
        const expected = String(q.correctAnswer || '').trim().toUpperCase();
        const actual = String(userAns || '').trim().toUpperCase();
        if (expected && actual && expected === actual) {
          mcqScore += 1;
          isCorrect = true;
        }
      } else if (qType === 'APTITUDE') {
        const expected = String(q.correctAnswer || '').trim().toUpperCase();
        const actual = String(userAns || '').trim().toUpperCase();
        if (expected && actual && expected === actual) {
          aptitudeScore += 1;
          isCorrect = true;
        }
      } else if (qType === 'PSEUDOCODE') {
        const expectedAns = String(q.correctAnswer || '').trim().toUpperCase();
        const expectedOut = String(q.expectedOutput || '').trim();
        const actual = String(userAns || '').trim();

        if (
          (expectedAns && actual.toUpperCase() === expectedAns) ||
          (expectedOut && normalizeOutputForComparison(actual, expectedOut)) ||
          normalizeOutputForComparison(actual, String(q.correctAnswer || ''))
        ) {
          pseudoScore += 1;
          isCorrect = true;
        }
      } else if (qType === 'CODING') {
        // Evaluate coding answer
        const evalResult = codingEvaluations[q.id];
        if (evalResult?.allPassed || (evalResult?.passedCount > 0 && evalResult?.passedCount === evalResult?.totalCount)) {
          codingScore += 1;
          isCorrect = true;
        } else if (evalResult && evalResult.passedCount > 0 && evalResult.passedCount >= Math.ceil(evalResult.totalCount * 0.75)) {
          codingScore += 1;
          isCorrect = true;
        } else if (userAns && userAns.trim().length > 25 && !userAns.includes('pass') && (userAns.includes('return') || userAns.includes('SELECT') || userAns.includes('print') || userAns.includes('System.out') || userAns.includes('cout') || userAns.includes('printf'))) {
          codingScore += 1;
          isCorrect = true;
        }
      }

      if (isCorrect) {
        correctCount += 1;
        topicBreakdown[topic].correct += 1;
      }
    }

    const totalQuestions = questions.length || 39;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    const isQualified = finalScore >= threshold;

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    Object.entries(topicBreakdown).forEach(([topic, data]) => {
      data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      if (data.percentage < threshold) {
        weakTopics.push(topic);
      } else {
        strongTopics.push(topic);
      }
    });

    const nextAttemptNumber = userAttempts.length > 0 
      ? Math.max(...userAttempts.map((a: any) => a.attemptNumber || 0)) + 1 
      : 1;

    const newAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      attemptNumber: nextAttemptNumber,
      studentId,
      role,
      date: new Date().toLocaleDateString('en-US'),
      timestamp: new Date().toISOString(),
      score: finalScore,
      percentage: finalScore,
      isQualified,
      mcqScore,
      aptitudeScore,
      pseudoScore,
      codingScore,
      totalQuestions,
      correctCount,
      durationMinutes: Math.max(1, Number(elapsedMinutes) || 25),
      questions,
      answers: { ...answers, ...codingDrafts },
      topicBreakdown,
      weakTopics,
      strongTopics,
      isAdaptive: !!isAdaptive,
      status: isQualified ? 'Qualified' : 'Not Qualified',
    };

    userAttempts.unshift(newAttempt);
    attemptsMap[studentId] = userAttempts;
    saveJsonFile(ATTEMPTS_FILE, attemptsMap);

    // Synchronize User Profile
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    const profile = profiles[studentId] || {
      id: studentId,
      fullName: 'Placement Candidate',
      role: 'student',
      selectedRole: role,
    };

    const newReadiness = calculateBackendReadinessScore(
      finalScore,
      profile.practiceQuestionsCount || 0,
      isQualified ? 75 : 20
    );

    profile.assessmentStatus = `${finalScore}% ${isQualified ? 'Qualified' : 'Not Qualified'}`;
    profile.interviewStatus = isQualified ? 'unlocked' : (profile.interviewStatus === 'unlocked' ? 'unlocked' : 'locked');
    profile.placementReadiness = newReadiness;
    profile.needsImprovement = weakTopics.length > 0 ? weakTopics : (profile.needsImprovement || []);
    profile.strongSkills = strongTopics.length > 0 ? strongTopics : (profile.strongSkills || []);
    profile.assessmentMinutes = (profile.assessmentMinutes || 0) + (newAttempt.durationMinutes || 25);
    profile.updatedAt = new Date().toISOString();

    profiles[studentId] = profile;
    saveJsonFile(PROFILES_FILE, profiles);

    res.json({
      success: true,
      attempt: newAttempt,
      profile,
    });
  } catch (error: any) {
    console.error('Assessment submission error:', error);
    res.status(500).json({ error: 'Failed to record assessment submission', details: error?.message });
  }
});

// Get User-Isolated Attempts
app.get('/api/assessment/attempts/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    const userAttempts = attemptsMap[userId] || [];
    res.json({
      success: true,
      attempts: userAttempts,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch assessment attempts' });
  }
});

// Get Specific Attempt by ID
app.get('/api/assessment/attempt/:id', (req, res) => {
  try {
    const id = req.params.id;
    const attemptsMap = loadJsonFile<Record<string, any[]>>(ATTEMPTS_FILE, {});
    
    for (const userId of Object.keys(attemptsMap)) {
      const match = attemptsMap[userId]?.find((a: any) => a.id === id);
      if (match) {
        return res.json({ success: true, attempt: match });
      }
    }

    res.status(404).json({ error: 'Assessment attempt not found' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to find assessment attempt' });
  }
});

// ==================== USER-ISOLATED DSA PROGRESS ENDPOINTS ====================
app.get('/api/dsa/progress/:userId?', (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const dsaStore = loadJsonFile<Record<string, any>>(DSA_PROGRESS_FILE, {});
    
    // Check if store is keyed by userId
    let userMap: Record<string, any> = {};
    if (dsaStore[userId] && typeof dsaStore[userId] === 'object') {
      userMap = dsaStore[userId];
    } else if (!req.params.userId) {
      userMap = dsaStore;
    }

    res.json({ success: true, progress: userMap });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load DSA progress' });
  }
});

app.post('/api/dsa/progress', (req, res) => {
  try {
    const {
      userId = 'default',
      problemId,
      status,
      attemptsCount,
      successfulSubmissions,
      lastAttemptedAt,
      submittedCode,
      language
    } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' });
    }

    const dsaStore = loadJsonFile<Record<string, any>>(DSA_PROGRESS_FILE, {});
    if (!dsaStore[userId]) {
      dsaStore[userId] = {};
    }

    const existing = dsaStore[userId][problemId] || {
      problemId,
      status: 'Not Started',
      attemptsCount: 0,
      successfulSubmissions: 0,
    };

    const updated = {
      ...existing,
      status: status || existing.status,
      attemptsCount: attemptsCount !== undefined ? attemptsCount : existing.attemptsCount,
      successfulSubmissions: successfulSubmissions !== undefined ? successfulSubmissions : existing.successfulSubmissions,
      lastAttemptedAt: lastAttemptedAt || new Date().toISOString(),
      submittedCode: submittedCode || existing.submittedCode,
      language: language || existing.language || 'python',
    };

    dsaStore[userId][problemId] = updated;
    saveJsonFile(DSA_PROGRESS_FILE, dsaStore);

    // Update user profile solved count
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    if (profiles[userId]) {
      const solvedCount = Object.values(dsaStore[userId]).filter((p: any) => p.status === 'Solved').length;
      profiles[userId].dsaSolvedCount = solvedCount;
      profiles[userId].updatedAt = new Date().toISOString();
      saveJsonFile(PROFILES_FILE, profiles);
    }

    res.json({ success: true, progress: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save DSA progress' });
  }
});

// ==================== INTERVIEW PERSISTENCE & HISTORY ENDPOINTS ====================
app.post('/api/ai/interview/save', (req, res) => {
  try {
    const { studentId, role, messages = [], transcript = [], evaluation, score = 80, isDirectTest = false } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});
    if (!interviewsMap[studentId]) {
      interviewsMap[studentId] = [];
    }

    const newInterview = {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      role: role || 'Software Engineer',
      date: new Date().toISOString(),
      score: score || evaluation?.overallScore || 80,
      status: 'completed',
      transcript: transcript.length > 0 ? transcript : messages.map((m: any) => ({
        speaker: m.role || m.speaker,
        message: m.text || m.message,
        timestamp: m.timestamp || new Date().toLocaleTimeString(),
      })),
      evaluation,
      isDirectTest: !!isDirectTest,
    };

    interviewsMap[studentId].unshift(newInterview);
    saveJsonFile(INTERVIEWS_FILE, interviewsMap);

    // Update Profile
    const profiles = loadJsonFile<Record<string, any>>(PROFILES_FILE, {});
    if (profiles[studentId]) {
      profiles[studentId].interviewStatus = 'completed';
      profiles[studentId].interviewMinutes = (profiles[studentId].interviewMinutes || 0) + 15;
      const latestScore = 80;
      profiles[studentId].placementReadiness = calculateBackendReadinessScore(
        latestScore,
        profiles[studentId].practiceQuestionsCount || 0,
        newInterview.score
      );
      profiles[studentId].updatedAt = new Date().toISOString();
      saveJsonFile(PROFILES_FILE, profiles);
    }

    res.json({ success: true, interview: newInterview });
  } catch (error: any) {
    console.error('Interview save error:', error);
    res.status(500).json({ error: 'Failed to save interview session' });
  }
});

app.get('/api/ai/interview/history/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required' });
    }

    const interviewsMap = loadJsonFile<Record<string, any[]>>(INTERVIEWS_FILE, {});
    res.json({
      success: true,
      interviews: interviewsMap[userId] || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load interview history' });
  }
});


// Smart fallback generator that creates follow-up questions directly derived from the candidate's answer
function generateAdaptiveFollowUp(
  candidateAnswer: string,
  role: string,
  round: string,
  turnIndex: number
): string {
  const lower = (candidateAnswer || '').toLowerCase().trim();
  const isEvasive = 
    lower === 'skip' || 
    lower === 'pass' || 
    lower.includes("don't know") || 
    lower.includes('dont know') || 
    lower.includes('no idea') || 
    lower.includes('not sure') || 
    lower.length < 8;

  if (isEvasive) {
    if (turnIndex === 0) {
      return `Welcome to your technical placement interview for the ${role} position! To start, could you introduce yourself, highlight your core technical skills, and share a recent project you built?`;
    }
    return `That's completely fine — placement interviews cover a wide breadth. Let's pivot to a foundational area for ${role}: Could you describe how you approach debugging an unexpected issue or runtime exception in your code, and what tools or logging practices you rely on?`;
  }

  // 1. Caching & In-Memory Stores
  if (lower.includes('cache') || lower.includes('redis') || lower.includes('memcached')) {
    return `You mentioned utilizing caching in your architecture. In high-throughput distributed systems, how do you manage cache invalidation, prevent cache stampede (thundering herd), and guarantee data consistency with your primary database?`;
  }

  // 2. Databases & SQL Optimization
  if (lower.includes('sql') || lower.includes('database') || lower.includes('postgres') || lower.includes('mysql') || lower.includes('mongodb') || lower.includes('query') || lower.includes('index')) {
    return `Regarding your experience with databases and query execution: how do you decide between B-Tree and Hash indexing, what causes full table scans in query execution plans, and how do you handle database transaction isolation levels to prevent race conditions?`;
  }

  // 3. React, Frontend & State Management
  if (lower.includes('react') || lower.includes('redux') || lower.includes('state') || lower.includes('hook') || lower.includes('component') || lower.includes('frontend')) {
    return `You highlighted your work with state management and component architecture. What techniques do you employ to prevent unnecessary re-renders in deep component hierarchies, and how do you handle asynchronous race conditions when multiple API calls resolve out of order?`;
  }

  // 4. Python Specifics
  if (lower.includes('python') || lower.includes('gil') || lower.includes('django') || lower.includes('fastapi') || lower.includes('flask') || lower.includes('asyncio')) {
    return `Building on your explanation of Python development: can you elaborate on how Python handles memory management with reference counting and cyclic garbage collection, and how you architect CPU-bound tasks around the Global Interpreter Lock (GIL)?`;
  }

  // 5. Java / JVM / Spring
  if (lower.includes('java') || lower.includes('jvm') || lower.includes('spring') || lower.includes('multithreading') || lower.includes('thread')) {
    return `You touched on Java and application scalability. Could you explain the differences between the Young and Old generation memory spaces in the JVM, how garbage collection cycles are triggered, and how you prevent memory leaks in long-running services?`;
  }

  // 6. Data Structures & Algorithms
  if (lower.includes('tree') || lower.includes('graph') || lower.includes('binary search') || lower.includes('dp') || lower.includes('dynamic programming') || lower.includes('recursion') || lower.includes('sorting') || lower.includes('array') || lower.includes('hash map')) {
    return `Reflecting on the algorithmic logic and data structures you discussed: what are the precise worst-case time and space complexities, and what specific edge cases (such as cycles, duplicates, or boundary overflows) must be guarded against in production?`;
  }

  // 7. Machine Learning / Data Science
  if (lower.includes('model') || lower.includes('train') || lower.includes('overfitting') || lower.includes('dataset') || lower.includes('regression') || lower.includes('classification') || lower.includes('feature')) {
    return `In your explanation of model evaluation: how do you distinguish between high variance and high bias in your validation metrics, and what regularization or feature selection strategies do you apply when dealing with severe class imbalance?`;
  }

  // 8. APIs, Microservices & Concurrency
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('rest') || lower.includes('microservice') || lower.includes('docker') || lower.includes('concurrency')) {
    return `You noted building and integrating service endpoints. How do you implement idempotency for mutation requests, and what rate-limiting or backpressure strategies do you implement to prevent cascading failures across downstream services?`;
  }

  // 9. Testing & Debugging
  if (lower.includes('test') || lower.includes('debug') || lower.includes('bug') || lower.includes('error') || lower.includes('exception')) {
    return `You described tracking down bugs and verifying reliability. What systematic debugging workflow do you follow when reproducing intermittent, non-deterministic bugs or race conditions under high concurrent load?`;
  }

  // 10. Behavioral & Project Trade-offs
  if (lower.includes('team') || lower.includes('project') || lower.includes('deadline') || lower.includes('conflict') || lower.includes('client')) {
    return `In that project scenario you described, what was the most significant technical trade-off you had to make between implementation speed and long-term code maintainability, and what quantifiable outcome resulted from your decision?`;
  }

  // General adaptive extraction: grab a snippet of candidate's actual answer and probe deeper
  const sentences = candidateAnswer.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  const snippet = sentences.length > 0 ? sentences[0] : candidateAnswer.slice(0, 80);
  const cleanSnippet = snippet.replace(/["'\n]/g, '').trim();

  return `You mentioned that "${cleanSnippet}" — could you dive deeper into the technical mechanics of that decision, explain what trade-offs you evaluated, and describe how you would test its behavior under high traffic or unexpected inputs?`;
}

// AI HR Interview API: generates the next interviewer question or opening prompt
app.post('/api/ai/interview', async (req, res) => {
  try {
    const { role = 'Python Developer', round = 'Introduction & Background', studentProfile } = req.body;
    const conversationHistory = req.body.conversationHistory || req.body.history || [];
    const candidateAnswer = req.body.candidateAnswer || '';
    const ai = getAI();

    // Extract the candidate's last answer from history if not passed directly
    let lastAnswer = candidateAnswer;
    if (!lastAnswer && conversationHistory.length > 0) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const item = conversationHistory[i];
        if (item.speaker === 'candidate' || item.role === 'candidate') {
          lastAnswer = item.text || item.message || '';
          break;
        }
      }
    }

    const turnIndex = conversationHistory.length;
    const fallbackReply = generateAdaptiveFollowUp(lastAnswer, role, round, turnIndex);

    if (!ai) {
      return res.json({
        question: fallbackReply,
        isCompleted: turnIndex >= 8,
        source: 'smart-adaptive-fallback',
      });
    }

    const systemPrompt = `You are a Senior Technical and Hiring Committee Placement Interviewer for Nova Notes, conducting a live, realistic placement interview for the role: "${role || 'Software Engineer'}".
Current Round: "${round || 'Technical Competency'}".
Candidate Profile: ${JSON.stringify(studentProfile || {})}.

CRITICAL ADAPTIVE INTERVIEWING DIRECTIVE:
The candidate expects each subsequent question to probe directly into their PREVIOUS ANSWER instead of only asking static, pre-canned questions!
1. Analyze the candidate's latest response from the conversation history:
   - Identify specific technical concepts, tools, decisions, algorithms, projects, architecture, or claims they made.
   - Quote or reference their exact statement in your opening sentence (e.g., "You noted using Redis for session caching...", "Regarding your point about balanced binary trees...").
2. Ask a targeted, incisive follow-up question:
   - Challenge their technical depth, algorithmic trade-offs, edge-case handling, or underlying architectural choices.
   - If their previous answer was high-level or vague, ask them to unpack the exact technical mechanics with a concrete example.
   - If they gave an introductory answer, probe into their highlighted project and their direct architectural contributions.
3. Response Format:
   - 1 concise sentence acknowledging and analyzing their specific answer.
   - Followed by exactly ONE sharp, direct follow-up question grounded firmly in what they just answered.
4. Voice & Tone:
   - Professional, realistic, encouraging, and rigorous — exactly like a senior tech recruiter and principal engineer in a top-tier placement drive.
   - Spoken-friendly (2-4 sentences total).
   - NEVER refer to yourself as an AI, bot, language model, or virtual assistant.`;

    const historyPrompt = conversationHistory?.map((msg: { speaker?: string; role?: string; text?: string; message?: string }) => 
      `${(msg.speaker || msg.role || 'user').toUpperCase()}: ${msg.text || msg.message || ''}`
    ).join('\n\n') || "Candidate just arrived.";

    const prompt = `${historyPrompt}\n\nINTERVIEWER (Ask a focused follow-up question based on the candidate's last answer):`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const reply = response.text?.trim() || fallbackReply;
      const isCompleted = conversationHistory.length >= 8;

      return res.json({
        question: reply,
        isCompleted,
        source: 'gemini',
      });
    } catch (aiErr) {
      console.warn('Gemini interview turn failed, using smart adaptive follow-up:', aiErr);
      return res.json({
        question: fallbackReply,
        isCompleted: turnIndex >= 8,
        source: 'adaptive-fallback',
      });
    }
  } catch (error: any) {
    console.error('Interview turn error:', error);
    res.status(500).json({
      error: 'Failed to generate interview response',
      details: error?.message,
    });
  }
});

// Interview Evaluation API: detailed scoring, diagnostic rubric, and actionable focus areas
app.post(['/api/ai/evaluate', '/api/ai/interview/evaluate'], async (req, res) => {
  try {
    const { role = 'Software Engineer', transcript = [] } = req.body;
    const ai = getAI();

    // Fallback focus areas tailored to the role
    const fallbackFocusAreas = [
      {
        topic: `${role} Core Architecture & Runtime Mechanics`,
        observation: `In your responses discussing ${role}, the solutions outlined the happy path but did not fully explain internal memory management, thread safety, or runtime trade-offs.`,
        recommendation: `You should focus on mastering underlying framework lifecycles, memory allocation, and concurrency handling for ${role}.`
      },
      {
        topic: 'Algorithmic Complexity & Edge-Case Analysis',
        observation: 'When walking through problem-solving approaches, answers lacked explicit Big-O time and space complexity evaluations and corner-case handling.',
        recommendation: 'You should focus on calculating worst-case/average-case Big-O complexities upfront, and proactively articulating boundary checks (empty inputs, null values, integer limits).'
      },
      {
        topic: 'STAR Method & Quantifiable Project Impact',
        observation: 'Project and behavioral explanations focused on tools used rather than measurable outcomes, specific engineering challenges overcome, or quantifiable metrics.',
        recommendation: 'You should focus on structuring responses with Situation, Task, Action, and Result, highlighting specific metrics (e.g. latency drop, throughput, team velocity).'
      }
    ];

    const fallbackWhatYouShouldFocusOn = [
      `You should focus on ${role} Core Mechanics: Deepen your understanding of runtime execution, state management, and memory optimization.`,
      'You should focus on Algorithmic Complexity: Proactively compute Big-O time and space complexity and practice edge cases in the DSA Practice tab.',
      'You should focus on Structured Project Articulation: Use the STAR framework to explain architectural decisions and cite quantifiable outcomes.',
      'You should focus on Technical Trade-offs: Prepare clear justifications for why you chose specific tools or data structures over alternative options.'
    ];

    if (!ai) {
      return res.json({
        overallScore: 82,
        technicalScore: 85,
        communicationScore: 80,
        problemSolvingScore: 82,
        relevanceScore: 84,
        clarityConfidenceScore: 79,
        strengths: [
          'Solid understanding of core role concepts and technical terminology',
          'Good responsiveness to follow-up questions probing deeper into projects',
          'Professional, composed demeanor throughout the technical exchange'
        ],
        weaknesses: [
          'Could articulate more specific performance metrics (latency, QPS, scale) from past projects',
          'Pacing in explaining complex algorithms could be slightly more structured'
        ],
        suggestions: [
          'Practice explaining time/space complexities with the STAR method',
          'Deepen knowledge on real-world caching, indexing, and distributed systems scenarios',
          'Complete targeted practice in weak domains under the Practice mode'
        ],
        focusAreas: fallbackFocusAreas,
        whatYouShouldFocusOn: fallbackWhatYouShouldFocusOn,
        verdict: 'QUALIFIED FOR CAMPUS PLACEMENT',
        source: 'smart-fallback',
      });
    }

    const evaluationPrompt = `You are a Senior Technical Hiring Committee Lead and Placement Director evaluating a candidate's Mock Placement Interview for the position of "${role}".
Transcript of the interview:
${JSON.stringify(transcript, null, 2)}

Provide a thorough, honest, and constructive evaluation in valid JSON format.
Pay special attention to identifying EXACTLY what the candidate should focus on to improve their placement outcomes.

Required JSON Schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "relevanceScore": number (0-100),
  "clarityConfidenceScore": number (0-100),
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "suggestions": ["string", "string", "string"],
  "focusAreas": [
    {
      "topic": "string (e.g. Dynamic Programming & Recursion, Database Query Optimization, System Concurrency)",
      "observation": "string (Specific observation from their answers highlighting why this was identified)",
      "recommendation": "string (Clear, direct advice starting with 'You should focus on...')"
    }
  ],
  "whatYouShouldFocusOn": [
    "You should focus on [Topic 1]: [Specific actionable guidance]",
    "You should focus on [Topic 2]: [Specific actionable guidance]",
    "You should focus on [Topic 3]: [Specific actionable guidance]"
  ],
  "verdict": "RECOMMENDED FOR PLACEMENT (CLEAR PASS)" or "CONDITIONAL PASS - TARGETED PRACTICE RECOMMENDED" or "NEEDS FURTHER PRACTICE"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Ensure focusAreas and whatYouShouldFocusOn are populated
    const result = {
      overallScore: parsed.overallScore || 80,
      technicalScore: parsed.technicalScore || 80,
      communicationScore: parsed.communicationScore || 80,
      problemSolvingScore: parsed.problemSolvingScore || 80,
      relevanceScore: parsed.relevanceScore || 80,
      clarityConfidenceScore: parsed.clarityConfidenceScore || 80,
      strengths: parsed.strengths || ['Good foundational understanding of role requirements'],
      weaknesses: parsed.weaknesses || ['Could provide more concrete metrics in technical answers'],
      suggestions: parsed.suggestions || ['Review algorithmic complexities and practice with timed coding'],
      focusAreas: (parsed.focusAreas && parsed.focusAreas.length > 0) ? parsed.focusAreas : fallbackFocusAreas,
      whatYouShouldFocusOn: (parsed.whatYouShouldFocusOn && parsed.whatYouShouldFocusOn.length > 0) ? parsed.whatYouShouldFocusOn : fallbackWhatYouShouldFocusOn,
      verdict: parsed.verdict || 'RECOMMENDED FOR PLACEMENT (CLEAR PASS)',
      source: 'gemini',
    };

    res.json(result);
  } catch (error: any) {
    console.error('Evaluation AI error:', error);
    res.status(500).json({
      error: 'Failed to evaluate interview',
      details: error?.message,
    });
  }
});

// AI Adaptive Recommendations
app.post('/api/ai/adaptive-recommendation', async (req, res) => {
  try {
    const { role, score, weakTopics, attemptCount } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        recommendation: `Based on your recent assessment score (${score}%), focus your practice on ${weakTopics?.join(', ') || 'core concepts'}. Reviewing pseudocode tracing and solving 5-10 practice problems in these domains will significantly boost your readiness score.`,
        focusAreas: weakTopics || ['Data Structures', 'Algorithmic Optimization'],
        actionPlan: [
          'Review the option-by-option explanations in your previous assessment review.',
          'Complete 15 targeted practice MCQs in weak topics under Practice mode.',
          'Solve 2 coding challenges focusing on edge-case constraints.'
        ]
      });
    }

    const prompt = `Candidate for role "${role}" scored ${score}% on Assessment Attempt #${attemptCount}.
Identified weak topics: ${weakTopics?.join(', ')}.
Generate a highly targeted adaptive recommendation and 3-step action plan in JSON:
{
  "recommendation": "string",
  "focusAreas": ["string", "string"],
  "actionPlan": ["step 1", "step 2", "step 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Adaptive recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

// ==================== AUTH & ADMIN AUTHORIZATION ====================
// Verifies user authorization against server-side ADMIN_EMAIL config.
app.post('/api/auth/verify-admin', (req, res) => {
  const { email } = req.body;
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'bathrinarayanan53@gmail.com').trim().toLowerCase();
  const candidateEmail = (email || '').trim().toLowerCase();

  if (!candidateEmail) {
    return res.status(400).json({ 
      isAuthorized: false, 
      error: 'Candidate email is required for verification.' 
    });
  }

  const isAuthorized = candidateEmail === configuredAdminEmail;

  res.json({
    isAuthorized,
    email: candidateEmail,
    adminEmailConfigured: !!process.env.ADMIN_EMAIL,
    message: isAuthorized 
      ? 'Admin authorization verified successfully.' 
      : 'Admin Access Denied: This portal is strictly reserved for the designated administrator.'
  });
});

// Returns public server auth configuration
app.get('/api/auth/config', (req, res) => {
  res.json({
    adminConfigured: !!process.env.ADMIN_EMAIL,
    supabaseConfigured: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ==================== MULTI-LANGUAGE CODE COMPILER ENGINE ====================
// Supports Python, JavaScript, Java, C, C++, and SQL
interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileError?: string | null;
  runtimeError?: string | null;
  timedOut: boolean;
  exitCode: number | null;
  durationMs: number;
}

function executeProcess(
  cmd: string,
  args: string[],
  stdinInput: string,
  timeoutMs = 4000
): Promise<{ stdout: string; stderr: string; timedOut: boolean; exitCode: number | null; durationMs: number }> {
  return new Promise((resolve) => {
    let timedOut = false;
    let stdout = '';
    let stderr = '';
    const start = Date.now();

    const cleanEnv: Record<string, string> = {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: '/tmp',
      LANG: 'en_US.UTF-8',
      PYTHONUNBUFFERED: '1',
    };

    const proc = spawn(cmd, args, {
      env: cleanEnv,
      cwd: '/tmp',
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch {}
    }, timeoutMs);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 50000) proc.kill('SIGKILL');
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 10000) proc.kill('SIGKILL');
    });

    if (proc.stdin) {
      try {
        proc.stdin.write(stdinInput || '');
        proc.stdin.end();
      } catch {}
    }

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      const durationMs = Date.now() - start;
      resolve({ stdout, stderr, timedOut, exitCode, durationMs });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      const durationMs = Date.now() - start;
      resolve({ stdout: '', stderr: err.message, timedOut: false, exitCode: 1, durationMs });
    });
  });
}

async function runMultiLanguageCode(
  language: string,
  code: string,
  stdinInput: string,
  timeoutMs = 4000
): Promise<ExecutionResult> {
  const lang = (language || 'python').toLowerCase().trim();
  const execId = `prog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // 1. PYTHON
  if (lang === 'python' || lang === 'py') {
    let runnableCode = code;
    const hasStdinRead = /sys\.stdin|input\(/.test(code);
    const fnMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (!hasStdinRead && fnMatch && !code.includes(`if __name__ == '__main__':`)) {
      const fnName = fnMatch[1];
      runnableCode = `${code}

import sys, json

if __name__ == '__main__':
    try:
        raw_in = sys.stdin.read().strip()
        if raw_in:
            try:
                parsed = json.loads('[' + raw_in + ']')
                res = ${fnName}(*parsed)
            except Exception:
                lines = raw_in.splitlines()
                if len(lines) == 1:
                    try:
                        res = ${fnName}(json.loads(lines[0]))
                    except Exception:
                        res = ${fnName}(lines[0])
                else:
                    res = ${fnName}(*lines)
            if res is not None:
                if isinstance(res, (list, dict, bool)):
                    print(json.dumps(res))
                else:
                    print(res)
        else:
            res = ${fnName}()
            if res is not None:
                print(res)
    except Exception as e:
        sys.stderr.write(f"RuntimeError: {e}\\n")
        sys.exit(1)
`;
    }
    const result = await executeProcess('python3', ['-c', runnableCode], stdinInput, timeoutMs);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      runtimeError: result.exitCode !== 0 ? result.stderr : null,
      timedOut: result.timedOut,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    };
  }

  // 2. JAVASCRIPT / NODE
  if (lang === 'javascript' || lang === 'js') {
    let runnableCode = code;
    const hasStdinRead = /readline|readFileSync|fs\.read/.test(code);
    const fnMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*\(/);
    const fnName = fnMatch ? (fnMatch[1] || fnMatch[2]) : null;

    if (!hasStdinRead && fnName) {
      runnableCode = `${code}

const fs = require('fs');
try {
  const rawIn = fs.readFileSync(0, 'utf-8').trim();
  if (rawIn) {
    let parsed;
    try {
      parsed = JSON.parse('[' + rawIn + ']');
    } catch {
      parsed = rawIn.split('\\n');
    }
    const res = ${fnName}(...parsed);
    if (res !== undefined) {
      console.log(typeof res === 'object' ? JSON.stringify(res) : res);
    }
  } else {
    const res = ${fnName}();
    if (res !== undefined) console.log(res);
  }
} catch (e) {
  console.error("RuntimeError: " + e.message);
  process.exit(1);
}
`;
    }
    const result = await executeProcess('node', ['-e', runnableCode], stdinInput, timeoutMs);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      runtimeError: result.exitCode !== 0 ? result.stderr : null,
      timedOut: result.timedOut,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    };
  }

  // 3. C (gcc)
  if (lang === 'c') {
    const srcPath = path.join('/tmp', `${execId}.c`);
    const binPath = path.join('/tmp', execId);
    try {
      await fs.promises.writeFile(srcPath, code, 'utf-8');
      const compile = await executeProcess('gcc', ['-O2', srcPath, '-o', binPath, '-lm'], '', 4000);
      if (compile.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compile.stderr,
          compileError: compile.stderr,
          timedOut: false,
          exitCode: compile.exitCode,
          durationMs: compile.durationMs,
        };
      }
      const run = await executeProcess(binPath, [], stdinInput, timeoutMs);
      return {
        stdout: run.stdout,
        stderr: run.stderr,
        runtimeError: run.exitCode !== 0 ? run.stderr : null,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
      };
    } finally {
      try { await fs.promises.unlink(srcPath); } catch {}
      try { await fs.promises.unlink(binPath); } catch {}
    }
  }

  // 4. C++ (g++)
  if (lang === 'cpp' || lang === 'c++') {
    const srcPath = path.join('/tmp', `${execId}.cpp`);
    const binPath = path.join('/tmp', execId);
    try {
      await fs.promises.writeFile(srcPath, code, 'utf-8');
      const compile = await executeProcess('g++', ['-O2', '-std=c++17', srcPath, '-o', binPath], '', 5000);
      if (compile.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compile.stderr,
          compileError: compile.stderr,
          timedOut: false,
          exitCode: compile.exitCode,
          durationMs: compile.durationMs,
        };
      }
      const run = await executeProcess(binPath, [], stdinInput, timeoutMs);
      return {
        stdout: run.stdout,
        stderr: run.stderr,
        runtimeError: run.exitCode !== 0 ? run.stderr : null,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
      };
    } finally {
      try { await fs.promises.unlink(srcPath); } catch {}
      try { await fs.promises.unlink(binPath); } catch {}
    }
  }

  // 5. JAVA
  if (lang === 'java') {
    // Extract public class name or use Main
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    const className = classMatch ? classMatch[1] : 'Main';
    const classDir = path.join('/tmp', execId);
    const javaSrc = path.join(classDir, `${className}.java`);

    try {
      await fs.promises.mkdir(classDir, { recursive: true });
      let runnableJava = code;
      if (!classMatch && !code.includes('class Main')) {
        runnableJava = `public class Main {\n${code}\n}`;
      }
      await fs.promises.writeFile(javaSrc, runnableJava, 'utf-8');

      // Compile with javac
      const compile = await executeProcess('javac', [javaSrc], '', 6000);
      if (compile.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compile.stderr,
          compileError: compile.stderr,
          timedOut: false,
          exitCode: compile.exitCode,
          durationMs: compile.durationMs,
        };
      }

      // Run with java
      const run = await executeProcess('java', ['-cp', classDir, className], stdinInput, timeoutMs);
      return {
        stdout: run.stdout,
        stderr: run.stderr,
        runtimeError: run.exitCode !== 0 ? run.stderr : null,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
      };
    } finally {
      try { await fs.promises.rm(classDir, { recursive: true, force: true }); } catch {}
    }
  }

  // 6. SQL (Executed using SQLite embedded in Python)
  if (lang === 'sql') {
    const pythonSqlRunner = `
import sqlite3, sys, json

try:
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Pre-seed standard placement database schema
    cursor.executescript('''
    CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL,
        location TEXT,
        budget INTEGER
    );
    INSERT INTO departments VALUES 
        (1, 'Engineering', 'Bangalore', 5000000),
        (2, 'Data Science', 'Hyderabad', 4200000),
        (3, 'Product', 'Pune', 3100000),
        (4, 'Quality Assurance', 'Chennai', 2400000);

    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dept_id INTEGER,
        salary INTEGER,
        hire_date TEXT,
        job_title TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );
    INSERT INTO employees VALUES
        (101, 'Aarav Patel', 1, 85000, '2022-01-15', 'Backend Engineer'),
        (102, 'Diya Sharma', 2, 92000, '2021-06-20', 'Data Scientist'),
        (103, 'Rohan Verma', 1, 78000, '2023-03-10', 'Full Stack Developer'),
        (104, 'Ananya Iyer', 3, 95000, '2020-11-01', 'Product Manager'),
        (105, 'Karthik Rao', 4, 65000, '2022-08-14', 'QA Engineer'),
        (106, 'Pooja Nair', 2, 88000, '2023-01-05', 'ML Engineer'),
        (107, 'Vikram Singh', 1, 105000, '2019-04-12', 'Principal Architect');

    CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        student_id INTEGER,
        name TEXT NOT NULL,
        department TEXT,
        branch TEXT,
        cgpa REAL,
        placement_status TEXT,
        email TEXT
    );
    INSERT INTO students VALUES
        (1, 1, 'Vikram Malhotra', 'CSE', 'CSE', 8.9, 'Placed', 'vikram@example.com'),
        (2, 2, 'Sneha Joshi', 'IT', 'IT', 8.2, 'Placed', 'sneha@example.com'),
        (3, 3, 'Rahul Sen', 'ECE', 'ECE', 7.4, 'Eligible', 'rahul@example.com'),
        (4, 4, 'Meera Nambiar', 'CSE', 'CSE', 9.4, 'Placed', 'meera@example.com'),
        (5, 5, 'Aditya Roy', 'EEE', 'EEE', 6.8, 'In Training', 'aditya@example.com'),
        (6, 6, 'Priya Kulkarni', 'CSE', 'CSE', 9.1, 'Placed', 'priya@example.com'),
        (7, 7, 'Tanmay Bhat', 'IT', 'IT', 7.8, 'Eligible', 'tanmay@example.com');

    CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL
    );
    INSERT INTO products VALUES
        (201, 'Laptop Pro 15', 'Electronics', 1200.0, 45),
        (202, 'Wireless Mouse', 'Electronics', 25.5, 200),
        (203, 'Mechanical Keyboard', 'Electronics', 85.0, 110),
        (204, 'Office Desk Chair', 'Furniture', 180.0, 60),
        (205, 'Standing Desk', 'Furniture', 350.0, 25),
        (206, 'USB-C Monitor 27"', 'Electronics', 280.0, 75);

    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        loyalty_points INTEGER DEFAULT 0
    );
    INSERT INTO customers VALUES
        (301, 'TechCorp India', 'Bangalore', 'India', 450),
        (302, 'Global Innovations', 'San Francisco', 'USA', 1200),
        (303, 'Nexus Analytics', 'London', 'UK', 780),
        (304, 'Apex Solutions', 'Singapore', 'Singapore', 320),
        (305, 'Alpha Enterprises', 'Hyderabad', 'India', 90);

    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    INSERT INTO orders VALUES
        (401, 301, 201, '2024-01-10', 5, 6000.0),
        (402, 302, 203, '2024-01-12', 10, 850.0),
        (403, 303, 206, '2024-01-15', 3, 840.0),
        (404, 301, 202, '2024-01-18', 20, 510.0),
        (405, 304, 205, '2024-02-01', 2, 700.0),
        (406, 302, 201, '2024-02-05', 3, 3600.0);
    ''')

    user_query = sys.stdin.read().strip()
    if not user_query:
        print(json.dumps({"columns": [], "rows": [], "rowCount": 0}))
        sys.exit(0)

    cursor.execute(user_query)
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description] if cursor.description else []
    
    print(json.dumps({
        "columns": columns,
        "rows": rows,
        "rowCount": len(rows)
    }))
    conn.commit()
    conn.close()
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;
    const result = await executeProcess('python3', ['-c', pythonSqlRunner], code, timeoutMs);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      runtimeError: result.exitCode !== 0 ? result.stderr : null,
      timedOut: result.timedOut,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    };
  }

  // Fallback
  return {
    stdout: '',
    stderr: `Unsupported language: ${language}`,
    timedOut: false,
    exitCode: 1,
    durationMs: 0,
  };
}

// Single Run Endpoint (Used by interactive code playground and compiler)
app.post('/api/code/run', async (req, res) => {
  try {
    const { language = 'python', code = '', stdin = '' } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await runMultiLanguageCode(language, code, stdin, 4000);
    res.json(result);
  } catch (error: any) {
    console.error('Code run error:', error);
    res.status(500).json({ error: 'Failed to run code', details: error?.message });
  }
});

// Dedicated SQL Query Run Endpoint with Safety Protection
app.post('/api/sql/run', async (req, res) => {
  try {
    const { query = '' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Security check: Block destructive SQL operations
    const upper = query.toUpperCase();
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'ALTER', 'TRUNCATE', 'ATTACH', 'DETACH', 'PRAGMA'];
    const foundDangerous = dangerousKeywords.find((k) => new RegExp(`\\b${k}\\b`, 'i').test(upper));
    if (foundDangerous) {
      return res.json({
        success: false,
        error: `Security Policy Violation: Destructive statement '${foundDangerous}' is blocked. Nova Notes assessment only permits safe queries (SELECT, JOIN, WHERE, GROUP BY, HAVING, ORDER BY).`,
        durationMs: 0,
      });
    }

    const result = await runMultiLanguageCode('sql', query, '', 3000);
    if (result.exitCode !== 0) {
      return res.json({
        success: false,
        error: result.stderr || 'SQL execution failed',
        durationMs: result.durationMs,
      });
    }

    try {
      const parsed = JSON.parse(result.stdout || '{}');
      res.json({
        success: true,
        ...parsed,
        durationMs: result.durationMs,
      });
    } catch {
      res.json({
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        rawOutput: result.stdout,
        durationMs: result.durationMs,
      });
    }
  } catch (error: any) {
    console.error('SQL query error:', error);
    res.status(500).json({ error: 'SQL execution failed', details: error?.message });
  }
});

// Dedicated SQL Query Evaluation endpoint (compares candidate query output with expected solution)
app.post('/api/sql/evaluate', async (req, res) => {
  try {
    const { candidateQuery = '', expectedQuery = '', expectedOutput = '' } = req.body;

    if (!candidateQuery || typeof candidateQuery !== 'string') {
      return res.status(400).json({ error: 'Candidate SQL query is required' });
    }

    // Security check
    const upper = candidateQuery.toUpperCase();
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'ALTER', 'TRUNCATE', 'ATTACH', 'DETACH', 'PRAGMA'];
    const foundDangerous = dangerousKeywords.find((k) => new RegExp(`\\b${k}\\b`, 'i').test(upper));
    if (foundDangerous) {
      return res.json({
        passed: false,
        error: `Security Policy Violation: Forbidden keyword '${foundDangerous}'.`,
      });
    }

    // Run candidate query
    const candResult = await runMultiLanguageCode('sql', candidateQuery, '', 3000);
    if (candResult.exitCode !== 0) {
      return res.json({
        passed: false,
        error: candResult.stderr || 'Query failed to execute',
        durationMs: candResult.durationMs,
      });
    }

    let candData: any = {};
    try {
      candData = JSON.parse(candResult.stdout || '{}');
    } catch {
      return res.json({
        passed: false,
        error: 'Unable to parse SQL output',
      });
    }

    // If expected query is supplied, run expected query and compare rows
    if (expectedQuery) {
      const expResult = await runMultiLanguageCode('sql', expectedQuery, '', 3000);
      if (expResult.exitCode === 0) {
        try {
          const expData = JSON.parse(expResult.stdout || '{}');
          const candNorm = JSON.stringify(candData.rows || []);
          const expNorm = JSON.stringify(expData.rows || []);
          const passed = candNorm === expNorm;

          return res.json({
            passed,
            candidateRows: candData.rows || [],
            candidateColumns: candData.columns || [],
            expectedRows: expData.rows || [],
            expectedColumns: expData.columns || [],
            durationMs: candResult.durationMs,
          });
        } catch {}
      }
    }

    // Otherwise check row count or expected output string match
    const passed = (candData.rowCount || 0) > 0 && (!expectedOutput || candResult.stdout.includes(expectedOutput));
    res.json({
      passed,
      candidateRows: candData.rows || [],
      candidateColumns: candData.columns || [],
      durationMs: candResult.durationMs,
    });
  } catch (error: any) {
    console.error('SQL evaluation error:', error);
    res.status(500).json({ error: 'SQL evaluation failed', details: error?.message });
  }
});

// Multi-Testcase Code Evaluation endpoint: runs candidate code against test cases
app.post('/api/code/evaluate', async (req, res) => {
  try {
    const { language = 'python', code, testCases = [] } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code submission is required' });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'At least one testcase is required' });
    }

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const stdinInput = String(tc.input ?? '');
      const expectedOutput = String(tc.expectedOutput ?? '').trim().replace(/\r\n/g, '\n');

      const exec = await runMultiLanguageCode(language, code, stdinInput, 3500);

      const actualTrimmed = exec.stdout.trim().replace(/\r\n/g, '\n');
      
      const normalizeVal = (s: string) => {
        const cleaned = s.trim().replace(/\r\n/g, '\n');
        try {
          return JSON.stringify(JSON.parse(cleaned));
        } catch {
          // Normalize boolean literals across languages (Python True/False vs JS true/false)
          if (/^true$/i.test(cleaned)) return 'true';
          if (/^false$/i.test(cleaned)) return 'false';
          return cleaned.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').toLowerCase();
        }
      };

      const isPassed = !exec.timedOut && exec.exitCode === 0 && (
        actualTrimmed === expectedOutput ||
        normalizeVal(actualTrimmed) === normalizeVal(expectedOutput)
      );

      if (isPassed) {
        passedCount++;
      }

      results.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden Test Case]' : tc.expectedOutput,
        actualOutput: tc.isHidden && !isPassed 
          ? '[Mismatch on Hidden Test Case]' 
          : (exec.timedOut ? 'Time Limit Exceeded (3.5s)' : (exec.compileError || exec.runtimeError || actualTrimmed)),
        passed: isPassed,
        timedOut: exec.timedOut,
        compileError: exec.compileError || null,
        runtimeError: exec.runtimeError ? exec.runtimeError.slice(0, 300) : null,
        durationMs: exec.durationMs,
        isHidden: !!tc.isHidden,
      });
    }

    res.json({
      passedCount,
      totalCount: testCases.length,
      allPassed: passedCount === testCases.length,
      results,
    });
  } catch (error: any) {
    console.error('Code evaluation error:', error);
    res.status(500).json({ error: 'Internal sandbox execution error', details: error?.message });
  }
});

// ==================== PRACTICE INTERVIEW (DIRECT PREP) ====================
// Generates practice interview questions and turns for any role, category, and difficulty
app.post('/api/ai/practice-interview', async (req, res) => {
  try {
    const { 
      role = 'Python Developer', 
      category = 'Technical', 
      difficulty = 'Medium', 
      conversationHistory = [] 
    } = req.body;
    
    const ai = getAI();

    const categoryQuestions: Record<string, string[]> = {
      'Self Introduction': [
        "Could you please walk me through your background, technical interests, and why you are targeting this role?",
        "How did your academic and project work prepare you for the technical demands of this position?",
        "What are the top three technical strengths you bring to our engineering team?"
      ],
      'Common HR': [
        "Why do you want to join our company specifically, and where do you see your career heading in the next 2-3 years?",
        "Tell me about your greatest technical or professional strength, and give a specific instance of how it made a difference.",
        "What is an area of development or weakness you have actively worked to improve over the last six months?"
      ],
      'Behavioral': [
        "Describe a situation where you had a disagreement with a team member over a technical decision. How did you resolve it?",
        "Tell me about a time you faced a tight project deadline with incomplete specifications. What was your strategy?",
        "Give an example of a project failure or mistake you made. What did you learn and how did you pivot?"
      ],
      'Technical': [
        `For a ${role}, how would you architect a high-throughput API handling thousands of concurrent requests while minimizing latency?`,
        "Explain the difference between horizontal and vertical scaling, and how you would design database caching for hot data.",
        "What data structures would you select to build a real-time autocomplete suggestion engine, and what is its query time complexity?"
      ],
      'Role-Specific': [
        `In your experience with ${role} workflows, how do you approach automated testing, linting, and continuous integration?`,
        "What is the most technically complex challenge you have tackled in your recent projects?",
        "How do you stay current with rapidly evolving libraries, frameworks, and best practices in your stack?"
      ],
      'Situational': [
        "If a critical production bug occurs 30 minutes before release, walk me through your triage, mitigation, and post-mortem process.",
        "How would you handle a stakeholder who requests a major scope change three days before a scheduled delivery milestone?",
        "If you notice an edge-case performance degradation that tests missed, what is your approach to isolating the root cause?"
      ],
      'Communication': [
        "How would you explain the concept of microservices versus a monolith to a non-technical executive or marketing lead?",
        "Describe how you conduct code reviews to give constructive, empathetic, and actionable feedback to teammates.",
        "How do you ensure clear documentation and cross-team alignment when building reusable libraries or APIs?"
      ]
    };

    // If Gemini is not configured, supply high-quality curated category questions
    if (!ai) {
      const qList = categoryQuestions[category] || categoryQuestions['Technical'];
      const questionIndex = conversationHistory.length % qList.length;
      return res.json({
        question: qList[questionIndex],
        source: 'curated-fallback',
        category,
        difficulty
      });
    }

    const prompt = `You are a Senior Technical Hiring Lead conducting an interactive Practice Interview session for a student preparing for campus placement.
Candidate Role: ${role}
Interview Focus Category: ${category}
Difficulty: ${difficulty}

Conversation History so far:
${JSON.stringify(conversationHistory, null, 2)}

Instructions:
1. Formulate the next single, highly realistic, professional question tailored specifically to the Category (${category}) and Role (${role}).
2. If the student previously answered, provide brief, positive 1-sentence acknowledgement before asking the next question.
3. Keep the tone encouraging yet rigorous, exactly like a top-tier tech company interviewer.
4. Output JSON with schema:
{
  "question": "string"
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        question: parsed.question || "Can you tell me about your experience and how it aligns with this role?",
        source: 'gemini',
        category,
        difficulty
      });
    } catch (genErr) {
      console.warn('Gemini generation fallback:', genErr);
      const qList = categoryQuestions[category] || categoryQuestions['Technical'];
      const questionIndex = conversationHistory.length % qList.length;
      return res.json({
        question: qList[questionIndex],
        source: 'curated-fallback',
        category,
        difficulty
      });
    }
  } catch (error: any) {
    console.error('Practice interview error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate practice interview question' });
  }
});

// Setup Vite middleware in dev mode, static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova Notes server running on port ${PORT}`);
  });
}

startServer();
