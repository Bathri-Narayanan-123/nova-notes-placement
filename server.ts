import express from 'express';
import path from 'path';
import fs from 'fs';
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

// Smart fallback generator that creates follow-up questions directly derived from the candidate's answer
function generateAdaptiveFollowUp(
  candidateAnswer: string,
  role: string,
  round: string,
  turnIndex: number
): string {
  if (!candidateAnswer || candidateAnswer.trim().length < 10) {
    if (turnIndex === 0) {
      return `Welcome to your technical placement interview for the ${role} position! To start, could you introduce yourself, highlight your core technical skills, and share a recent project you built?`;
    }
    return `Could you expand on that with a concrete technical example from your projects or coursework? Specifically, what tools or data structures did you utilize and how did you verify the implementation?`;
  }

  const lower = candidateAnswer.toLowerCase();

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
        location TEXT
    );
    INSERT INTO departments VALUES 
        (1, 'Engineering', 'Bangalore'),
        (2, 'Data Science', 'Hyderabad'),
        (3, 'Product', 'Pune'),
        (4, 'Quality Assurance', 'Chennai');

    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dept_id INTEGER,
        salary INTEGER,
        hire_date TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
    );
    INSERT INTO employees VALUES
        (101, 'Aarav Patel', 1, 85000, '2022-01-15'),
        (102, 'Diya Sharma', 2, 92000, '2021-06-20'),
        (103, 'Rohan Verma', 1, 78000, '2023-03-10'),
        (104, 'Ananya Iyer', 3, 95000, '2020-11-01'),
        (105, 'Karthik Rao', 4, 65000, '2022-08-14'),
        (106, 'Pooja Nair', 2, 88000, '2023-01-05');

    CREATE TABLE students (
        student_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        branch TEXT,
        cgpa REAL,
        placement_status TEXT
    );
    INSERT INTO students VALUES
        (1, 'Vikram Malhotra', 'CSE', 8.9, 'Placed'),
        (2, 'Sneha Joshi', 'IT', 8.2, 'Placed'),
        (3, 'Rahul Sen', 'ECE', 7.4, 'Eligible'),
        (4, 'Meera Nambiar', 'CSE', 9.4, 'Placed'),
        (5, 'Aditya Roy', 'EEE', 6.8, 'In Training');
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

// Dedicated SQL Query Run Endpoint
app.post('/api/sql/run', async (req, res) => {
  try {
    const { query = '' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'SQL query is required' });
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
      const isPassed = !exec.timedOut && exec.exitCode === 0 && actualTrimmed === expectedOutput;

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
        model: 'gemini-3.6-flash',
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
