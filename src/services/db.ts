import { 
  AssessmentAttempt, 
  InterviewAttempt, 
  PlacementRole, 
  PracticeSession, 
  Question, 
  SystemConfig, 
  UserProfile 
} from '../types';
import { INITIAL_QUESTION_BANK } from '../data/questionBank';
import { PLACEMENT_ROLES } from '../data/roles';

const STORAGE_KEYS = {
  PROFILE: 'nova_notes_profile',
  ATTEMPTS: 'nova_notes_attempts',
  QUESTIONS: 'nova_notes_questions',
  PRACTICE: 'nova_notes_practice',
  INTERVIEWS: 'nova_notes_interviews',
  ROLES: 'nova_notes_roles',
  CONFIG: 'nova_notes_config',
  ATTEMPTED_QUESTION_IDS: 'nova_notes_attempted_qids',
};

// Initial Student Profile matching screenshots
const DEFAULT_PROFILE: UserProfile = {
  id: 'user_178741092834',
  fullName: 'Bathri Narayanan S',
  email: 'bathrinarayanan53@gmail.com',
  role: 'student', // default student, owner can promote or toggle
  selectedRole: 'Python Developer',
  memberSince: '8/22/2026',
  placementReadiness: 32,
  sessionsCount: 65,
  activeTimeMinutes: 3,
  practiceMinutes: 0,
  assessmentMinutes: 0,
  interviewMinutes: 0,
  practiceQuestionsCount: 33,
  assessmentStatus: '2% In Progress',
  interviewStatus: 'locked',
  strongSkills: [],
  needsImprovement: ['Python', 'OOP', 'DSA', 'SQL'],
};

// Initial Attempts matching the screenshot list in Page 1 & Page 6
const DEFAULT_ATTEMPTS: AssessmentAttempt[] = [
  {
    id: 'att-6',
    attemptNumber: 6,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '9/7/2026',
    score: 2,
    isQualified: false,
    mcqScore: 1,
    pseudoScore: 0,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 1,
    durationMinutes: 28,
    questions: [],
    answers: {},
    topicBreakdown: {
      Python: { total: 10, correct: 1, percentage: 10 },
      OOP: { total: 6, correct: 0, percentage: 0 },
      DSA: { total: 8, correct: 0, percentage: 0 },
      SQL: { total: 6, correct: 0, percentage: 0 },
    },
    weakTopics: ['OOP', 'DSA', 'SQL', 'Python'],
    strongTopics: [],
    isAdaptive: true,
  },
  {
    id: 'att-5',
    attemptNumber: 5,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '9/3/2026',
    score: 0,
    isQualified: false,
    mcqScore: 0,
    pseudoScore: 0,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 0,
    durationMinutes: 30,
    questions: [],
    answers: {},
    topicBreakdown: {},
    weakTopics: ['Python', 'DSA'],
    strongTopics: [],
  },
  {
    id: 'att-4',
    attemptNumber: 4,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '9/2/2026',
    score: 0,
    isQualified: false,
    mcqScore: 0,
    pseudoScore: 0,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 0,
    durationMinutes: 25,
    questions: [],
    answers: {},
    topicBreakdown: {},
    weakTopics: ['Python', 'OOP'],
    strongTopics: [],
  },
  {
    id: 'att-3',
    attemptNumber: 3,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '8/23/2026',
    score: 38,
    isQualified: false,
    mcqScore: 12,
    pseudoScore: 4,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 11,
    durationMinutes: 30,
    questions: [],
    answers: {},
    topicBreakdown: {
      Python: { total: 10, correct: 4, percentage: 40 },
      SQL: { total: 6, correct: 3, percentage: 50 },
      OOP: { total: 6, correct: 2, percentage: 33 },
      DSA: { total: 8, correct: 2, percentage: 25 },
    },
    weakTopics: ['DSA', 'OOP'],
    strongTopics: ['SQL'],
  },
  {
    id: 'att-2',
    attemptNumber: 2,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '8/23/2026',
    score: 0,
    isQualified: false,
    mcqScore: 0,
    pseudoScore: 0,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 0,
    durationMinutes: 15,
    questions: [],
    answers: {},
    topicBreakdown: {},
    weakTopics: ['Python'],
    strongTopics: [],
  },
  {
    id: 'att-1',
    attemptNumber: 1,
    studentId: 'user_178741092834',
    role: 'Python Developer',
    date: '8/22/2026',
    score: 6,
    isQualified: false,
    mcqScore: 2,
    pseudoScore: 0,
    codingScore: 0,
    totalQuestions: 30,
    correctCount: 2,
    durationMinutes: 30,
    questions: [],
    answers: {},
    topicBreakdown: {},
    weakTopics: ['Python', 'DSA', 'OOP'],
    strongTopics: [],
  },
];

const DEFAULT_CONFIG: SystemConfig = {
  qualificationThreshold: 70,
  assessmentTimeMinutes: 30,
  fullscreenRequired: true,
  suspiciousActivityDetection: true,
};

type Listener = () => void;

class DatabaseService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(DEFAULT_ATTEMPTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTION_BANK));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(PLACEMENT_ROLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRACTICE)) {
      localStorage.setItem(STORAGE_KEYS.PRACTICE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTERVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTED_QUESTION_IDS)) {
      // Pre-seed some question IDs as already attempted so pool exhaustion & rotation behavior is active
      localStorage.setItem(STORAGE_KEYS.ATTEMPTED_QUESTION_IDS, JSON.stringify(['py-mcq-1', 'py-mcq-2']));
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // ==================== PROFILE METHODS ====================
  public getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public setSelectedRole(roleTitle: string) {
    this.updateProfile({ selectedRole: roleTitle });
  }

  public switchRole(role: 'student' | 'admin') {
    this.updateProfile({ role });
  }

  // ==================== CONFIG METHODS ====================
  public getConfig(): SystemConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public updateConfig(updates: Partial<SystemConfig>): SystemConfig {
    const current = this.getConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // ==================== QUESTIONS METHODS ====================
  public getAllQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return data ? JSON.parse(data) : INITIAL_QUESTION_BANK;
    } catch {
      return INITIAL_QUESTION_BANK;
    }
  }

  public getQuestionsForRole(roleTitle: string): Question[] {
    return this.getAllQuestions().filter(
      (q) => q.role.toLowerCase() === roleTitle.toLowerCase()
    );
  }

  public addQuestion(question: Omit<Question, 'id'>): Question {
    const all = this.getAllQuestions();
    const newQ: Question = {
      ...question,
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    all.push(newQ);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.notify();
    return newQ;
  }

  public updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const all = this.getAllQuestions();
    const index = all.findIndex((q) => q.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.notify();
    return all[index];
  }

  public deleteQuestion(id: string): boolean {
    const all = this.getAllQuestions();
    const filtered = all.filter((q) => q.id !== id);
    if (filtered.length !== all.length) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
      this.notify();
      return true;
    }
    return false;
  }

  // ==================== ATTEMPTED QUESTIONS TRACKER ====================
  public getAttemptedQuestionIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTED_QUESTION_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public markQuestionsAttempted(qids: string[]) {
    const existing = new Set(this.getAttemptedQuestionIds());
    qids.forEach((id) => existing.add(id));
    localStorage.setItem(
      STORAGE_KEYS.ATTEMPTED_QUESTION_IDS,
      JSON.stringify(Array.from(existing))
    );
  }

  // ==================== ADAPTIVE QUESTION SELECTION ====================
  // Exactly 39 Questions:
  // 15 Role-Specific MCQs
  // 10 Aptitude Questions (Quantitative & Logical Reasoning)
  // 10 Pseudocode Output Prediction Questions
  // 4 Coding Questions
  // Guarantees DIFFERENT questions from previous attempts where possible!
  public generateAssessmentQuestions(
    roleTitle: string,
    isAdaptive: boolean = false,
    weakTopics: string[] = []
  ): { questions: Question[]; poolStatus: 'abundant' | 'low' | 'recycled' } {
    const allRoleQuestions = this.getQuestionsForRole(roleTitle);
    const allQuestions = this.getAllQuestions();
    const attemptedIds = new Set(this.getAttemptedQuestionIds());

    // 1. Role-specific MCQs (10 questions)
    const mcqs = allRoleQuestions.filter((q) => q.type === 'MCQ' && q.topic !== 'DSA');
    const unattemptedMcqs = mcqs.filter((q) => !attemptedIds.has(q.id));

    // 2. Data Structures & Algorithms (DSA) (8 questions)
    const dsas = allQuestions.filter(
      (q) =>
        (q.type as string) === 'DSA' ||
        q.topic.toLowerCase().includes('dsa') ||
        q.skill.toLowerCase().includes('dsa') ||
        q.skill.toLowerCase().includes('data structure') ||
        q.skill.toLowerCase().includes('algorithm')
    );
    const unattemptedDsas = dsas.filter((q) => !attemptedIds.has(q.id));

    // 3. Aptitude (Quantitative + Logical) (10 questions)
    const aptitudes = allQuestions.filter(
      (q) => q.type === 'APTITUDE' || q.topic.includes('Aptitude') || q.topic.includes('Reasoning')
    );
    const unattemptedAptitudes = aptitudes.filter((q) => !attemptedIds.has(q.id));

    // 4. Pseudocode / Output Prediction (7 questions)
    const pseudos = allQuestions.filter(
      (q) => q.type === 'PSEUDOCODE' && (q.role.toLowerCase() === roleTitle.toLowerCase() || q.role === 'All Roles')
    );
    const unattemptedPseudos = pseudos.filter((q) => !attemptedIds.has(q.id));

    // 5. Coding Problems (4 questions)
    const codings = allQuestions.filter(
      (q) => q.type === 'CODING' && (q.role.toLowerCase() === roleTitle.toLowerCase() || q.role === 'All Roles')
    );
    const unattemptedCodings = codings.filter((q) => !attemptedIds.has(q.id));

    let poolStatus: 'abundant' | 'low' | 'recycled' = 'abundant';
    if (unattemptedMcqs.length < 10 || unattemptedDsas.length < 8 || unattemptedAptitudes.length < 10 || unattemptedPseudos.length < 7 || unattemptedCodings.length < 4) {
      poolStatus = unattemptedMcqs.length < 5 ? 'recycled' : 'low';
    }

    // Generic selector with adaptive weighting
    const selectQuestions = (
      unattempted: Question[],
      fallbackAll: Question[],
      count: number,
      type: 'MCQ' | 'DSA' | 'APTITUDE' | 'PSEUDOCODE' | 'CODING'
    ): Question[] => {
      let pool = [...unattempted];
      if (pool.length < count) {
        const used = fallbackAll.filter((q) => !pool.some((p) => p.id === q.id));
        pool = [...pool, ...used];
      }

      if (isAdaptive && weakTopics.length > 0) {
        pool.sort((a, b) => {
          const aWeak = weakTopics.includes(a.topic) || weakTopics.includes(a.skill);
          const bWeak = weakTopics.includes(b.topic) || weakTopics.includes(b.skill);
          if (aWeak && !bWeak) return -1;
          if (!aWeak && bWeak) return 1;
          return 0.5 - Math.random();
        });
      } else {
        pool.sort(() => 0.5 - Math.random());
      }

      const selected = pool.slice(0, count);

      // Synthesize if pool is exhausted so exactly 'count' is always provided
      while (selected.length < count) {
        const synthetic = this.createSyntheticQuestion(roleTitle, type, selected.length + 1, weakTopics);
        selected.push(synthetic);
      }

      return selected;
    };

    const targetMcqs = selectQuestions(unattemptedMcqs, mcqs, 10, 'MCQ');
    const targetDsas = selectQuestions(unattemptedDsas, dsas, 8, 'DSA');
    const targetAptitudes = selectQuestions(unattemptedAptitudes, aptitudes, 10, 'APTITUDE');
    const targetPseudos = selectQuestions(unattemptedPseudos, pseudos, 7, 'PSEUDOCODE');
    const targetCodings = selectQuestions(unattemptedCodings, codings, 4, 'CODING');

    const combined = [...targetMcqs, ...targetDsas, ...targetAptitudes, ...targetPseudos, ...targetCodings];
    return { questions: combined, poolStatus };
  }

  // Procedural synthetic generator for infinite high-quality variations
  private createSyntheticQuestion(
    role: string,
    type: 'MCQ' | 'DSA' | 'APTITUDE' | 'PSEUDOCODE' | 'CODING',
    index: number,
    weakTopics: string[]
  ): Question {
    const topic = type === 'APTITUDE' ? 'Quantitative Aptitude' : type === 'DSA' ? 'DSA' : (weakTopics[0] || 'Problem Solving');
    const id = `synth-${role.toLowerCase().replace(/\s+/g, '-')}-${type.toLowerCase()}-${index}-${Date.now()}`;

    if (type === 'DSA') {
      const dsaVariants = [
        {
          q: 'What is the worst-case time complexity of finding an element in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
          ans: 'B',
          opts: [
            { key: 'A', text: 'O(1)', explanation: 'Incorrect: Binary search tree lookup is logarithmic, not constant.' },
            { key: 'B', text: 'O(log n)', explanation: 'Correct: Balanced BSTs strictly maintain height <= c*log(n), ensuring worst-case O(log n) lookup.' },
            { key: 'C', text: 'O(n)', explanation: 'Incorrect: O(n) only occurs in degenerate, unbalanced BSTs; self-balancing trees avoid this.' },
            { key: 'D', text: 'O(n log n)', explanation: 'Incorrect: That is the time complexity of sorting, not single element lookup.' }
          ]
        },
        {
          q: 'Which graph traversal algorithm uses a Queue data structure to visit vertices level-by-level?',
          ans: 'C',
          opts: [
            { key: 'A', text: 'Depth-First Search (DFS)', explanation: 'Incorrect: DFS uses a Stack (or the call stack via recursion).' },
            { key: 'B', text: 'Bellman-Ford Algorithm', explanation: 'Incorrect: Bellman-Ford repeatedly relaxes all edges |V|-1 times.' },
            { key: 'C', text: 'Breadth-First Search (BFS)', explanation: 'Correct: BFS processes vertices in FIFO order using a Queue.' },
            { key: 'D', text: 'Kruskal Algorithm', explanation: 'Incorrect: Kruskal uses a Disjoint Set Union (Union-Find) and priority queue.' }
          ]
        },
        {
          q: 'What data structure is predominantly used to evaluate postfix arithmetic expressions and balance parentheses?',
          ans: 'A',
          opts: [
            { key: 'A', text: 'Stack (LIFO)', explanation: 'Correct: Stacks provide Last-In-First-Out access ideal for matching nested pairs and postfix evaluation.' },
            { key: 'B', text: 'Queue (FIFO)', explanation: 'Incorrect: Queues process elements first-in-first-out, which does not match innermost-first nesting.' },
            { key: 'C', text: 'Min-Heap', explanation: 'Incorrect: Heaps prioritize smallest elements, not nesting order.' },
            { key: 'D', text: 'Circular Linked List', explanation: 'Incorrect: Lists do not inherently enforce LIFO semantics.' }
          ]
        },
        {
          q: 'What is the average and worst-case time complexity of QuickSort?',
          ans: 'D',
          opts: [
            { key: 'A', text: 'Average O(n), Worst O(n^2)', explanation: 'Incorrect: Comparison sorting requires at least O(n log n) average time.' },
            { key: 'B', text: 'Average O(n log n), Worst O(n log n)', explanation: 'Incorrect: MergeSort guarantees O(n log n) worst-case, but standard QuickSort has an O(n^2) worst case with poor pivot selection.' },
            { key: 'C', text: 'Average O(n^2), Worst O(n^2)', explanation: 'Incorrect: QuickSort is average O(n log n).' },
            { key: 'D', text: 'Average O(n log n), Worst O(n^2)', explanation: 'Correct: QuickSort partitions in linear time with O(log n) tree depth on average, degrading to O(n^2) when pivots are consistently extreme.' }
          ]
        }
      ];
      const selected = dsaVariants[index % dsaVariants.length];
      return {
        id,
        role: 'All Roles',
        type: 'MCQ',
        topic: 'DSA',
        skill: 'Data Structures & Algorithms',
        difficulty: 'Medium',
        question: selected.q,
        correctAnswer: selected.ans,
        options: selected.opts as any,
      };
    }

    if (type === 'APTITUDE') {
      const aptVariants = [
        {
          q: 'A train 120m long travels at 72 km/h. How long in seconds does it take to pass a stationary signal post?',
          ans: 'B',
          opts: [
            { key: 'A', text: '4 seconds', explanation: 'Incorrect.' },
            { key: 'B', text: '6 seconds', explanation: 'Correct: 72 km/h = 72 * 5/18 = 20 m/s. Time = 120 / 20 = 6 seconds.' },
            { key: 'C', text: '8 seconds', explanation: 'Incorrect.' },
            { key: 'D', text: '10 seconds', explanation: 'Incorrect.' },
          ],
        },
        {
          q: 'If 8 men can complete a project in 15 days, in how many days can 12 men complete the identical project?',
          ans: 'C',
          opts: [
            { key: 'A', text: '8 days', explanation: 'Incorrect.' },
            { key: 'B', text: '9 days', explanation: 'Incorrect.' },
            { key: 'C', text: '10 days', explanation: 'Correct: M1 * D1 = M2 * D2 => 8 * 15 = 120 man-days. D2 = 120 / 12 = 10 days.' },
            { key: 'D', text: '12 days', explanation: 'Incorrect.' },
          ],
        }
      ];
      const selected = aptVariants[index % aptVariants.length];
      return {
        id,
        role: 'All Roles',
        type: 'APTITUDE',
        topic: 'Quantitative Aptitude',
        skill: 'Arithmetic',
        difficulty: 'Medium',
        question: selected.q,
        correctAnswer: selected.ans,
        options: selected.opts as any,
      };
    }

    if (type === 'MCQ') {
      const variants = [
        {
          q: `Which Python data structure is implemented as a doubly linked list of fixed-size blocks?`,
          ans: 'C',
          opts: [
            { key: 'A', text: 'list', explanation: 'Incorrect: standard Python lists are contiguous dynamic arrays.' },
            { key: 'B', text: 'set', explanation: 'Incorrect: sets are implemented as hash tables with dummy keys.' },
            { key: 'C', text: 'collections.deque', explanation: 'Correct: `collections.deque` uses a doubly-linked list of blocks for O(1) pops/appends on both ends.' },
            { key: 'D', text: 'tuple', explanation: 'Incorrect: tuples are fixed-size contiguous memory blocks.' }
          ]
        },
        {
          q: `In database design, what does the Third Normal Form (3NF) require beyond 2NF?`,
          ans: 'B',
          opts: [
            { key: 'A', text: 'All attributes must be atomic strings.', explanation: 'Incorrect: That is First Normal Form (1NF).' },
            { key: 'B', text: 'No non-prime attribute may be transitively dependent on the primary key.', explanation: 'Correct: 3NF strictly eliminates transitive dependencies (every non-key attribute must depend ONLY on the key).' },
            { key: 'C', text: 'The table must have at least three unique composite indexes.', explanation: 'Incorrect: Normal forms define functional dependencies, not physical indexes.' },
            { key: 'D', text: 'Foreign keys cannot point to external databases.', explanation: 'Incorrect: Foreign keys are relational constraints independent of 3NF rules.' }
          ]
        },
        {
          q: `What is the expected time complexity to delete an arbitrary node from a Doubly Linked List given a pointer directly to that node?`,
          ans: 'A',
          opts: [
            { key: 'A', text: 'O(1)', explanation: 'Correct: With pointers to both next and prev nodes, updating adjacent references takes O(1) time.' },
            { key: 'B', text: 'O(log n)', explanation: 'Incorrect: No search traversal is necessary when the pointer is already provided.' },
            { key: 'C', text: 'O(n)', explanation: 'Incorrect: O(n) is only required for a singly linked list where you must locate the predecessor.' },
            { key: 'D', text: 'O(n log n)', explanation: 'Incorrect: Node pointer modification is a constant-time operation.' }
          ]
        }
      ];
      const selected = variants[index % variants.length];
      return {
        id,
        role,
        type: 'MCQ',
        topic,
        skill: topic,
        difficulty: 'Medium',
        question: selected.q,
        correctAnswer: selected.ans,
        options: selected.opts as any,
      };
    }

    if (type === 'PSEUDOCODE') {
      return {
        id,
        role,
        type: 'PSEUDOCODE',
        topic,
        skill: topic,
        difficulty: 'Medium',
        question: `Determine the output printed by the recursive function compute(3):`,
        pseudocode: `FUNCTION compute(n):
    IF n == 0 THEN
        RETURN 2
    END IF
    RETURN 2 * compute(n - 1) + 1
END FUNCTION

PRINT compute(3)`,
        expectedOutput: '23',
        explanation: 'compute(0)=2, compute(1)=2*2+1=5, compute(2)=2*5+1=11, compute(3)=2*11+1=23.',
      };
    }

    // CODING
    return {
      id,
      role,
      type: 'CODING',
      topic,
      skill: topic,
      difficulty: 'Easy',
      question: 'Array Difference: Given an array of integers, return the difference between the maximum and minimum elements. Return 0 if the array contains fewer than 2 elements.',
      constraints: '1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5',
      codeTemplate: `def array_diff(nums):
    if len(nums) < 2:
        return 0
    return max(nums) - min(nums)
`,
      testCases: [
        { input: 'nums = [10, 3, 5, 6]', expectedOutput: '7' },
        { input: 'nums = [7, 2]', expectedOutput: '5' },
        { input: 'nums = [1]', expectedOutput: '0' },
      ],
      supportedLanguages: ['python', 'javascript'],
    };
  }

  // ==================== ATTEMPTS METHODS ====================
  public getAttempts(): AssessmentAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : DEFAULT_ATTEMPTS;
    } catch {
      return DEFAULT_ATTEMPTS;
    }
  }

  public getAttemptById(id: string): AssessmentAttempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  }

  public recordAttempt(attempt: Omit<AssessmentAttempt, 'id' | 'attemptNumber'>): AssessmentAttempt {
    const attempts = this.getAttempts();
    const nextNumber = attempts.length > 0 ? Math.max(...attempts.map((a) => a.attemptNumber)) + 1 : 1;

    const newAttempt: AssessmentAttempt = {
      ...attempt,
      id: `att-${nextNumber}`,
      attemptNumber: nextNumber,
    };

    attempts.unshift(newAttempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

    // Mark questions as attempted to guarantee different questions on next attempt
    if (newAttempt.questions && newAttempt.questions.length > 0) {
      this.markQuestionsAttempted(newAttempt.questions.map((q) => q.id));
    }

    // Update Profile statistics & readiness
    const config = this.getConfig();
    const isQualified = newAttempt.score >= config.qualificationThreshold;
    const profile = this.getProfile();

    // Recalculate placement readiness
    const newReadiness = this.calculateReadinessScore(newAttempt.score, profile.practiceQuestionsCount, 0);

    // Identify weak topics for adaptive feedback
    const weakTopics = newAttempt.weakTopics || [];
    const strongTopics = newAttempt.strongTopics || [];

    this.updateProfile({
      assessmentStatus: `${newAttempt.score}% ${isQualified ? 'Qualified' : 'Not Qualified'}`,
      interviewStatus: isQualified ? 'unlocked' : profile.interviewStatus === 'unlocked' ? 'unlocked' : 'locked',
      placementReadiness: newReadiness,
      needsImprovement: weakTopics.length > 0 ? weakTopics : profile.needsImprovement,
      strongSkills: strongTopics.length > 0 ? strongTopics : profile.strongSkills,
    });

    this.notify();
    return newAttempt;
  }

  // Meaningful readiness score calculation (Section 31)
  private calculateReadinessScore(latestAssessmentScore: number, practiceCount: number, interviewScore: number): number {
    // 50% assessment performance + 25% practice consistency + 25% interview performance
    const assessmentWeight = Math.min(100, latestAssessmentScore) * 0.5;
    const practiceWeight = Math.min(100, (practiceCount / 50) * 100) * 0.25;
    const interviewWeight = (interviewScore > 0 ? interviewScore : (latestAssessmentScore >= 70 ? 70 : 20)) * 0.25;
    return Math.round(assessmentWeight + practiceWeight + interviewWeight);
  }

  // ==================== PRACTICE SESSIONS ====================
  public getPracticeSessions(): PracticeSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRACTICE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public recordPractice(session: Omit<PracticeSession, 'id'>): PracticeSession {
    const all = this.getPracticeSessions();
    const newSession: PracticeSession = {
      ...session,
      id: `prac-${Date.now()}`,
    };
    all.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.PRACTICE, JSON.stringify(all));

    // Update profile practice count
    const profile = this.getProfile();
    const newCount = profile.practiceQuestionsCount + session.totalQuestions;
    const newReadiness = this.calculateReadinessScore(
      this.getAttempts()[0]?.score || 0,
      newCount,
      0
    );

    this.updateProfile({
      practiceQuestionsCount: newCount,
      placementReadiness: newReadiness,
    });

    this.notify();
    return newSession;
  }

  // ==================== INTERVIEW SESSIONS ====================
  public getInterviews(): InterviewAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public recordInterview(interview: Omit<InterviewAttempt, 'id'>): InterviewAttempt {
    const all = this.getInterviews();
    const newInterview: InterviewAttempt = {
      ...interview,
      id: `int-${Date.now()}`,
    };
    all.unshift(newInterview);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(all));

    const profile = this.getProfile();
    const interviewScore = newInterview.evaluation?.overallScore || 75;
    const newReadiness = this.calculateReadinessScore(
      this.getAttempts()[0]?.score || 0,
      profile.practiceQuestionsCount,
      interviewScore
    );

    this.updateProfile({
      interviewStatus: 'completed',
      placementReadiness: newReadiness,
    });

    this.notify();
    return newInterview;
  }

  // ==================== ROLES ====================
  public getRoles(): PlacementRole[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROLES);
      return data ? JSON.parse(data) : PLACEMENT_ROLES;
    } catch {
      return PLACEMENT_ROLES;
    }
  }

  public addRole(role: PlacementRole) {
    const roles = this.getRoles();
    roles.push(role);
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    this.notify();
  }
}

export const db = new DatabaseService();
