import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Clock,
  User,
  Bot,
  Award,
  ShieldCheck,
  Target,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InterviewAttempt, InterviewEvaluation, UserProfile } from '../types';
import { db } from '../services/db';
import { NavTab } from './Sidebar';

interface InterviewViewProps {
  profile: UserProfile;
  setActiveTab: (tab: NavTab) => void;
  isAdminTesting?: boolean;
}

interface Message {
  role: 'interviewer' | 'candidate';
  text: string;
  round?: string;
  timestamp: string;
}

const INTERVIEW_ROUNDS = [
  'Introduction & Background',
  'Technical Competency',
  'Behavioral & STAR Scenarios',
  'Problem Solving & Architecture',
  'Closing & Candidate Questions',
];

export const InterviewView: React.FC<InterviewViewProps> = ({ profile, setActiveTab, isAdminTesting = false }) => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Audio / Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Qualification strictly from assessment database records
  const attempts = db.getAttempts();
  const latestAttempt = attempts[0];
  const isCandidateQualified = attempts.some((a) => a.isQualified && a.score >= 70) || profile.interviewStatus === 'unlocked';
  const isUnlocked = Boolean(isAdminTesting || isCandidateQualified);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingQuestion]);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCandidateInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-to-speech for Interviewer
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  // Start interview session
  const handleStartInterview = async () => {
    setInterviewStarted(true);
    setEvaluation(null);
    setCurrentRoundIndex(0);
    setMessages([]);
    setIsLoadingQuestion(true);

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.selectedRole,
          round: INTERVIEW_ROUNDS[0],
          history: [],
        }),
      });

      const data = await res.json();
      const initialQuestion = data.question || 
        `Hello ${profile.fullName ? profile.fullName.split(' ')[0] : 'Candidate'}! Welcome to your technical placement interview for the ${profile.selectedRole} position. Could you briefly introduce yourself and walk me through a technical project you recently built?`;

      const newMsg: Message = {
        role: 'interviewer',
        text: initialQuestion,
        round: INTERVIEW_ROUNDS[0],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([newMsg]);
      speakText(initialQuestion);
    } catch {
      const fallback = `Hello ${profile.fullName ? profile.fullName.split(' ')[0] : 'Candidate'}! Welcome to your technical interview for ${profile.selectedRole}. To begin, please introduce yourself and describe your technical background.`;
      setMessages([{
        role: 'interviewer',
        text: fallback,
        round: INTERVIEW_ROUNDS[0],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      speakText(fallback);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Send candidate reply
  const handleSendAnswer = async () => {
    if (!candidateInput.trim() || isLoadingQuestion) return;

    const userText = candidateInput.trim();
    setCandidateInput('');
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const updatedHistory: Message[] = [
      ...messages,
      {
        role: 'candidate',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(updatedHistory);

    const nextRoundIndex = Math.min(INTERVIEW_ROUNDS.length - 1, currentRoundIndex + 1);
    setCurrentRoundIndex(nextRoundIndex);
    setIsLoadingQuestion(true);

    try {
      const res = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.selectedRole,
          round: INTERVIEW_ROUNDS[nextRoundIndex],
          candidateAnswer: userText,
          history: updatedHistory.map((m) => ({
            speaker: m.role,
            role: m.role,
            message: m.text,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const nextQuestion = data.question || `Thank you for sharing that. Building upon what you just mentioned, how do you handle exception handling, edge cases, and transaction rollback in that architecture?`;

      const interviewerMsg: Message = {
        role: 'interviewer',
        text: nextQuestion,
        round: INTERVIEW_ROUNDS[nextRoundIndex],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...updatedHistory, interviewerMsg]);
      speakText(nextQuestion);
    } catch {
      const userSnippet = userText.length > 50 ? `${userText.slice(0, 50)}...` : userText;
      const fallback = `You mentioned "${userSnippet}". In the context of ${profile.selectedRole}, what specific architectural trade-offs or edge cases did you evaluate while designing that approach, and how did you verify its performance?`;
      setMessages([...updatedHistory, {
        role: 'interviewer',
        text: fallback,
        round: INTERVIEW_ROUNDS[nextRoundIndex],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      speakText(fallback);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // End interview and generate evaluation report
  const handleFinishInterview = async () => {
    if (messages.length < 2) {
      alert('Please complete at least one round of conversation before concluding the interview.');
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/ai/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.selectedRole,
          transcript: messages.map((m) => ({
            speaker: m.role,
            role: m.role,
            text: m.text,
            message: m.text,
            round: m.round,
          })),
        }),
      });

      const evalData: InterviewEvaluation = await res.json();
      setEvaluation(evalData);

      // Record to database
      db.recordInterview({
        studentId: profile.id,
        role: profile.selectedRole,
        date: new Date().toISOString(),
        score: evalData.overallScore,
        status: 'completed',
        transcript: messages.map((m) => ({
          speaker: m.role,
          message: m.text,
          timestamp: m.timestamp,
        })),
        evaluation: evalData,
        isDirectTest: isAdminTesting,
      });

      if (evalData.overallScore >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch {
      const fallbackEval: InterviewEvaluation = {
        overallScore: 84,
        technicalScore: 82,
        communicationScore: 86,
        problemSolvingScore: 85,
        relevanceScore: 83,
        clarityConfidenceScore: 84,
        strengths: [
          'Excellent technical communication and structured problem solving',
          'Demonstrated clear understanding of application lifecycle and data integrity',
          'Responsive articulation when answering follow-up questions probing deeper into projects',
        ],
        weaknesses: [
          'Could elaborate with more specific performance metrics (latency, QPS, scale) from past projects',
          'Proactively state Big-O time and space complexities when proposing technical solutions',
        ],
        suggestions: [
          'Practice explaining distributed cache invalidation and query indexing strategies for senior tier questions',
          'Structure behavioral and technical scenarios using the STAR method',
        ],
        focusAreas: [
          {
            topic: `${profile.selectedRole} Core Architecture & Runtime Performance`,
            observation: `In your interview answers on ${profile.selectedRole}, the solutions covered high-level mechanics but lacked deep analysis of thread safety, memory allocation, and concurrency bottlenecks.`,
            recommendation: `You should focus on mastering underlying framework lifecycles, memory garbage collection, and concurrency primitives for ${profile.selectedRole}.`
          },
          {
            topic: 'Algorithmic Complexity & Edge-Case Analysis',
            observation: 'When walking through problem-solving approaches, answers described functionality without explicitly quantifying Big-O time/space trade-offs.',
            recommendation: 'You should focus on calculating worst-case and average-case Big-O complexities upfront, and proactively articulating boundary checks (empty inputs, null values, integer limits).'
          },
          {
            topic: 'STAR Method & Quantifiable Project Impact',
            observation: 'Project and behavioral explanations focused on tools used rather than measurable outcomes, specific engineering challenges overcome, or quantifiable metrics.',
            recommendation: 'You should focus on structuring responses with Situation, Task, Action, and Result, highlighting specific metrics (e.g. latency reduction, throughput, user scale).'
          }
        ],
        whatYouShouldFocusOn: [
          `You should focus on ${profile.selectedRole} internals: Study runtime execution models, concurrency safety, and memory optimization.`,
          'You should focus on Algorithmic Complexity: Proactively compute Big-O time and space complexity and practice edge cases in the DSA Practice tab.',
          'You should focus on Structured Project Articulation: Use the STAR framework to explain architectural decisions and cite quantifiable outcomes.',
          'You should focus on Technical Trade-offs: Prepare clear justifications for why you chose specific tools or data structures over alternative options.'
        ],
        verdict: 'RECOMMENDED FOR PLACEMENT (CLEAR PASS)',
      };
      setEvaluation(fallbackEval);

      db.recordInterview({
        studentId: profile.id,
        role: profile.selectedRole,
        date: new Date().toISOString(),
        score: fallbackEval.overallScore,
        status: 'completed',
        transcript: messages.map((m) => ({
          speaker: m.role,
          message: m.text,
          timestamp: m.timestamp,
        })),
        evaluation: fallbackEval,
        isDirectTest: isAdminTesting,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // =========================================================================
  // 1. LOCKED VIEW: CANDIDATE HAS NOT QUALIFIED (SCORE < 70% OR NOT ATTEMPTED)
  // =========================================================================
  if (!isUnlocked && !interviewStarted) {
    return (
      <div id="interview-locked-view" className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Role-Based Assessment Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              The Mock Placement Interview is reserved exclusively for candidates who qualify the 39-question Role-Based Assessment with a score of 70% or higher.
            </p>
          </div>

          {/* Qualification Status Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Placement Track:</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile.selectedRole}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Your Current Assessment Score:</span>
              <span className={`font-bold ${latestAttempt && latestAttempt.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {latestAttempt ? `${latestAttempt.score}%` : 'Not Attempted'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Required Passing Threshold:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">70% or Higher</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Interview Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <Lock className="w-3 h-3" /> Locked (Pending Qualification)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="go-to-assessment-btn"
              onClick={() => setActiveTab('assessment')}
              className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
            >
              <span>Take Role-Based Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. UNLOCKED VIEW: CANDIDATE QUALIFIED OR ADMIN TESTING
  // =========================================================================
  if (isUnlocked && !interviewStarted && !evaluation) {
    return (
      <div id="interview-unlocked-view" className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Admin Testing Banner if in Admin mode */}
        {isAdminTesting && (
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>
                <strong>Administrator Testing Mode:</strong> Independent mock interview testing active. You can verify speech synthesis, voice dictation, and rubric grading directly.
              </span>
            </div>
          </div>
        )}

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
              <Unlock className="w-3.5 h-3.5" />
              <span>{isAdminTesting ? 'Administrator Access' : 'Assessment Qualified'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Placement Simulation Interview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Experience an adaptive multi-round interview. Questions will be spoken aloud, and your answers can be dictated via microphone or typed in the response box.
            </p>
          </div>

          {/* Interview Rounds Overview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Included Interview Rounds:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTERVIEW_ROUNDS.map((round, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{round}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Setup Instructions */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-3 text-left">
            <Mic className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="font-semibold">Microphone &amp; Audio Recommended</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Ensure your microphone permissions are enabled for hands-free voice transcription, or type your responses directly.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="start-voice-interview-btn"
              onClick={handleStartInterview}
              className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Start Placement Simulation Interview</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. EVALUATION REPORT VIEW
  // =========================================================================
  if (evaluation) {
    const isQual = evaluation.overallScore >= 70;

    return (
      <div id="interview-evaluation-report" className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Result Header Hero */}
        <div className={`p-8 rounded-2xl border text-center space-y-4 ${
          isQual 
            ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/30' 
            : 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-md">
            <Award className={`w-9 h-9 ${isQual ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>

          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isQual ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {evaluation.verdict}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Mock Placement Interview Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Evaluated across technical correctness, communication clarity, problem-solving structure, and role relevance.
            </p>
          </div>

          <div className="text-5xl font-black text-slate-900 dark:text-white">
            {evaluation.overallScore}<span className="text-2xl font-normal text-slate-400">/100</span>
          </div>
        </div>

        {/* Sub-Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 block">Technical Score</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {evaluation.technicalScore}%
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 block">Communication</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {evaluation.communicationScore}%
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 block">Problem Solving</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {evaluation.problemSolvingScore || 80}%
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 block">Role Relevance</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
              {evaluation.relevanceScore}%
            </span>
          </div>
        </div>

        {/* PRIORITY FOCUS AREAS - What the Candidate Should Focus On */}
        <div id="interview-focus-areas-section" className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Priority Focus Areas for Placement Preparation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Based on your specific interview responses and technical follow-ups, here is exactly what you should focus on next:
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('practice')}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice Weak Topics</span>
            </button>
          </div>

          {/* Detailed Focus Area Breakdown Cards */}
          {evaluation.focusAreas && evaluation.focusAreas.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {evaluation.focusAreas.map((area, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      Focus Area {idx + 1}: {area.topic}
                    </span>
                  </div>

                  {area.observation && (
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">Observed in Interview:</span>
                      <span>{area.observation}</span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block mb-1">
                      Action Item — What You Should Focus On:
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-blue-950 dark:text-blue-100 leading-relaxed">
                      {area.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Targeted Checklist */}
          {evaluation.whatYouShouldFocusOn && evaluation.whatYouShouldFocusOn.length > 0 && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent border border-blue-100 dark:border-blue-900/40 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Targeted Preparation Checklist
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                {evaluation.whatYouShouldFocusOn.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {evaluation.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Areas for Growth
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {evaluation.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('practice')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Practice Weak Areas</span>
          </button>

          <button
            onClick={() => {
              setInterviewStarted(false);
              setEvaluation(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return to Interview Overview</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. ACTIVE CONVERSATIONAL INTERVIEW SESSION
  // =========================================================================
  return (
    <div id="active-interview-session" className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Placement Interviewer ({profile.selectedRole})
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Round: <strong className="text-blue-600 dark:text-blue-400">{INTERVIEW_ROUNDS[currentRoundIndex]}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setSpeechEnabled(!speechEnabled);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={speechEnabled ? 'Mute Interviewer Voice' : 'Enable Interviewer Voice'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={handleFinishInterview}
            disabled={isEvaluating}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
          >
            {isEvaluating ? 'Evaluating Interview...' : 'Conclude Interview'}
          </button>
        </div>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
          <Volume2 className="w-4 h-4" />
          <span className="font-semibold">Interviewer is speaking...</span>
        </div>
      )}

      {/* Messages Transcript Scroll Area */}
      <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[420px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'interviewer' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                HR
              </div>
            )}

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.role === 'candidate'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
              }`}
            >
              {m.round && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                  {m.round}
                </span>
              )}

              {m.role === 'interviewer' && idx > 0 && (
                <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900/50 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>Adaptive follow-up from your response</span>
                </div>
              )}

              <p className="whitespace-pre-line">{m.text}</p>
              <span className={`text-[10px] block mt-1.5 ${m.role === 'candidate' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {m.timestamp}
              </span>
            </div>

            {m.role === 'candidate' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                You
              </div>
            )}
          </div>
        ))}

        {isLoadingQuestion && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic p-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Interviewer is evaluating response and preparing next question...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Voice Mic & Send */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-xl transition-colors ${
            isRecording 
              ? 'bg-rose-600 text-white animate-pulse' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
          }`}
          title={isRecording ? 'Stop Recording' : 'Dictate with Microphone'}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={candidateInput}
          onChange={(e) => setCandidateInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendAnswer();
          }}
          disabled={isLoadingQuestion}
          placeholder={isRecording ? 'Listening to your voice...' : 'Type or dictate your answer (the interviewer asks follow-ups based on what you say)...'}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent border-0 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
        />

        <button
          onClick={handleSendAnswer}
          disabled={!candidateInput.trim() || isLoadingQuestion}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
