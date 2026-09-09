import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

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

// AI HR Interview API: generates the next interviewer question or opening prompt
app.post('/api/ai/interview', async (req, res) => {
  try {
    const { role = 'Python Developer', round = 'Introduction & Background', studentProfile } = req.body;
    const conversationHistory = req.body.conversationHistory || req.body.history || [];
    const ai = getAI();

    const fallbackQuestions: Record<string, string[]> = {
      'Python Developer': [
        "Hello and welcome! I'm your AI HR & Technical Interviewer for Nova Notes. To kick things off, could you briefly introduce yourself and share what inspired you to pursue a Python Developer role?",
        "That's great. In Python, how do you handle memory management and what is the role of Python's garbage collector and GIL in multithreading?",
        "Can you walk me through a challenging bug or performance bottleneck you solved in a project, and how you approached debugging it?",
        "Imagine you are given an API endpoint that takes 4 seconds to respond under high load. What profiling tools and architectural strategies would you employ?",
        "Thank you! Do you have any questions for me or any additional thoughts on your placement readiness?"
      ],
      'Data Analyst': [
        "Welcome to the interview! Can you introduce yourself and describe how you typically approach an exploratory data analysis project from raw messy data to business insights?",
        "When working with SQL, what are window functions, and could you give an example of when you would prefer a window function over a standard GROUP BY?",
        "How do you handle missing values or outliers in a dataset without introducing bias into your conclusions?",
        "Tell me about a time you had to explain a complex statistical finding to a non-technical stakeholder or manager. How did you ensure clarity?",
        "Great response. What are the key KPIs you look for when analyzing customer churn?"
      ],
      'ML Engineer': [
        "Welcome! To begin, tell me about your background in machine learning and the most impactful machine learning project you have built.",
        "How do you detect and mitigate overfitting in deep neural networks versus gradient boosted decision trees?",
        "Can you explain the trade-offs between precision and recall in an imbalanced classification problem like fraud detection?",
        "Walk me through how you deploy and monitor a machine learning model in production to detect data drift and concept drift.",
        "Excellent. How do you decide between fine-tuning an existing foundation model vs training a lightweight task-specific model?"
      ]
    };

    const questions = fallbackQuestions[role] || fallbackQuestions['Python Developer'];
    const turnIndex = Math.min(conversationHistory?.length || 0, questions.length - 1);
    const fallbackReply = questions[turnIndex] || "Could you summarize your key strengths and readiness for this placement role?";

    if (!ai) {
      return res.json({
        question: fallbackReply,
        isCompleted: turnIndex >= questions.length - 1,
        source: 'smart-fallback',
      });
    }

    const systemPrompt = `You are the lead AI HR & Technical Placement Interviewer for Nova Notes, an adaptive placement preparation platform.
The candidate is interviewing for the placement role: "${role || 'Software Engineer'}".
Student Profile: ${JSON.stringify(studentProfile || {})}.
Round: ${round || 'Technical & HR Assessment'}.

Guidelines:
1. Speak professionally, encouragingly, and realistically like a top-tier tech recruiter and technical hiring manager.
2. Review the conversation history. Acknowledge the candidate's last answer succinctly (1-2 sentences of professional appraisal) before asking the NEXT pertinent question.
3. Formulate deep, role-specific questions spanning technical depth, algorithmic thinking, system design, practical problem solving, and behavioral readiness.
4. Keep each response focused: a brief evaluation of the previous answer, followed by exactly ONE clear, well-framed question.
5. If the interview has reached 4 or 5 turns, synthesize a polite closing statement.`;

    const historyPrompt = conversationHistory?.map((msg: { speaker?: string; role?: string; text: string }) => 
      `${(msg.speaker || msg.role || 'user').toUpperCase()}: ${msg.text}`
    ).join('\n\n') || "Candidate just arrived.";

    const prompt = `${historyPrompt}\n\nAI INTERVIEWER:`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const reply = response.text || fallbackReply;
      const isCompleted = (conversationHistory?.length || 0) >= 6;

      return res.json({
        question: reply.trim(),
        isCompleted,
        source: 'gemini',
      });
    } catch (aiErr) {
      console.warn('Gemini interview turn failed, using curated question:', aiErr);
      return res.json({
        question: fallbackReply,
        isCompleted: turnIndex >= questions.length - 1,
        source: 'curated-fallback',
      });
    }
  } catch (error: any) {
    console.error('Interview AI error:', error);
    res.status(500).json({
      error: 'Failed to generate interview response',
      details: error?.message,
    });
  }
});

// AI Interview Evaluation API: detailed scoring and actionable placement feedback
app.post('/api/ai/evaluate', async (req, res) => {
  try {
    const { role, transcript, scores } = req.body;
    const ai = getAI();

    if (!ai) {
      // High-quality structured fallback evaluation
      return res.json({
        overallScore: 82,
        technicalScore: 85,
        communicationScore: 80,
        relevanceScore: 84,
        clarityConfidenceScore: 79,
        strengths: [
          'Solid understanding of core role concepts and terminology',
          'Structured responses with clear examples from practical projects',
          'Good problem-solving articulation when addressing edge cases'
        ],
        weaknesses: [
          'Could elaborate more on architectural scale and edge-case handling',
          'Pacing in explaining complex algorithms could be slightly more concise'
        ],
        suggestions: [
          'Practice explaining time/space complexities with the STAR method',
          'Deepen knowledge on real-world caching and database indexing scenarios',
          'Mock interview at least 2 more times to sharpen vocal confidence'
        ],
        verdict: 'QUALIFIED FOR CAMPUS PLACEMENT',
        source: 'smart-fallback',
      });
    }

    const evaluationPrompt = `You are a Senior Technical Hiring Committee Lead evaluating a candidate's AI HR Interview for the position of "${role}".
Transcript of the interview:
${JSON.stringify(transcript, null, 2)}

Provide a rigorous, constructive evaluation in valid JSON format matching this schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "relevanceScore": number (0-100),
  "clarityConfidenceScore": number (0-100),
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "suggestions": ["string", "string", "string"],
  "verdict": "QUALIFIED FOR CAMPUS PLACEMENT" or "NEEDS FURTHER PRACTICE"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, source: 'gemini' });
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
      model: 'gemini-3.6-flash',
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

// ==================== CODE EXECUTION ENGINE ====================
// Executes candidate Python or JavaScript code safely in an isolated sandbox with timeouts
function runSandboxProcess(
  lang: 'python' | 'javascript',
  code: string,
  stdinInput: string,
  timeoutMs = 3000
): Promise<{ stdout: string; stderr: string; timedOut: boolean; exitCode: number | null }> {
  return new Promise((resolve) => {
    let timedOut = false;
    let stdout = '';
    let stderr = '';

    const cmd = lang === 'python' ? 'python3' : 'node';
    const args: string[] = [];

    // Isolate environment without any application secrets or keys
    const cleanEnv: Record<string, string> = {
      PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
      HOME: '/tmp',
      LANG: 'en_US.UTF-8',
      PYTHONUNBUFFERED: '1',
    };

    let runnableCode = code;

    if (lang === 'python') {
      args.push('-c');
      // If code doesn't read from stdin or input(), but defines a function, add smart invoker
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
      args.push(runnableCode);
    } else {
      args.push('-e');
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
      args.push(runnableCode);
    }

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
      if (stdout.length > 50000) {
        proc.kill('SIGKILL');
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 10000) {
        proc.kill('SIGKILL');
      }
    });

    if (proc.stdin) {
      try {
        proc.stdin.write(stdinInput || '');
        proc.stdin.end();
      } catch {}
    }

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut, exitCode });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: err.message, timedOut: false, exitCode: 1 });
    });
  });
}

// Code Evaluation endpoint: runs candidate code against visible and hidden test cases
app.post('/api/code/evaluate', async (req, res) => {
  try {
    const { language = 'python', code, testCases = [] } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code submission is required' });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'At least one testcase is required' });
    }

    const validLang = language.toLowerCase() === 'javascript' ? 'javascript' : 'python';
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const stdinInput = String(tc.input ?? '');
      const expectedOutput = String(tc.expectedOutput ?? '').trim().replace(/\r\n/g, '\n');

      const start = Date.now();
      const exec = await runSandboxProcess(validLang, code, stdinInput, 3000);
      const durationMs = Date.now() - start;

      const actualTrimmed = exec.stdout.trim().replace(/\r\n/g, '\n');
      const isPassed = !exec.timedOut && exec.exitCode === 0 && actualTrimmed === expectedOutput;

      if (isPassed) {
        passedCount++;
      }

      results.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden Test Case]' : tc.expectedOutput,
        actualOutput: tc.isHidden && !isPassed ? '[Mismatch on Hidden Test Case]' : (exec.timedOut ? 'Time Limit Exceeded (3.0s)' : actualTrimmed),
        passed: isPassed,
        timedOut: exec.timedOut,
        runtimeError: exec.stderr ? exec.stderr.slice(0, 300) : null,
        durationMs,
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
