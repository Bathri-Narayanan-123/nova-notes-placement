export interface InterviewQuestionPrep {
  id: string;
  category: 'HR & Behavioral' | 'Technical Projects' | 'Career & Culture';
  question: string;
  interviewerExpectation: string;
  sampleAnswer: string;
  keyPoints: string[];
  doAndDont: {
    do: string;
    dont: string;
  };
}

export interface EtiquetteGuideItem {
  id: string;
  title: string;
  category: 'Body Language' | 'Camera & Lighting' | 'Attire & Environment' | 'Speaking Technique';
  recommendation: string;
  visualCue: string;
  impactScore: string;
  imageUrl?: string;
  bestPractices: string[];
}

export interface InterviewVisualDoDont {
  id: string;
  title: string;
  category: string;
  doText: string;
  dontText: string;
  doImageUrl: string;
  dontImageUrl: string;
  ruleSummary: string;
}

export const INTERVIEW_DOS_AND_DONTS_VISUAL: InterviewVisualDoDont[] = [
  {
    id: 'dodont-1',
    title: 'Sitting Posture & Spine Alignment',
    category: 'Body Language',
    doText: 'Sit upright with spine supported at 90–100°, shoulders gently rolled back, feet flat, hands visible on desk.',
    dontText: 'Slouching forward, resting chin on palm, hunching shoulders, or lounging backwards.',
    doImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    dontImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    ruleSummary: 'Open body posture communicates calm confidence, readiness, and active engagement.'
  },
  {
    id: 'dodont-2',
    title: 'Camera Angle & Eye Level Contact',
    category: 'Camera & Framing',
    doText: 'Position webcam at direct eye level so your head and upper chest occupy the top two-thirds of frame.',
    dontText: 'Laptop on desk looking up your nose, or high ceiling camera looking down at top of head.',
    doImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    dontImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    ruleSummary: 'Looking directly into the camera lens gives the interviewer the feeling of direct, honest eye contact.'
  },
  {
    id: 'dodont-3',
    title: 'Facial Lighting & Background Setup',
    category: 'Lighting & Workspace',
    doText: 'Soft, diffused frontal light illuminating entire face evenly; clean, uncluttered neutral background.',
    dontText: 'Sitting in front of a bright sunny window (silhouette effect), harsh side shadows, or unmade bed.',
    doImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    dontImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    ruleSummary: 'Crisp frontal illumination ensures your micro-expressions and positive energy are clearly perceived.'
  },
  {
    id: 'dodont-4',
    title: 'Professional Dress & Demeanor',
    category: 'Attire & Professionalism',
    doText: 'Buttoned formal collared shirt or blazer in solid neutral colors (navy, white, charcoal, slate).',
    dontText: 'Graphic t-shirts, workout hoodies, wrinkled clothing, or headphones with bulky microphone boom.',
    doImageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    dontImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    ruleSummary: 'Wearing formal corporate attire primes you psychologically and shows deep respect for the hiring company.'
  }
];

export const INTERVIEW_ETIQUETTE_GUIDE: EtiquetteGuideItem[] = [
  {
    id: 'etiquette-1',
    title: 'Sitting Posture & Presence',
    category: 'Body Language',
    recommendation: 'Sit upright with shoulders relaxed and back aligned against your chair. Avoid slumping, leaning too far forward, or rocking back and forth.',
    visualCue: 'Keep head, neck, and torso upright; hands rested on desk or in lap; maintain a stable, open posture.',
    impactScore: 'High (First 15 Seconds Perception)',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bestPractices: [
      'Align chair height so feet are flat on the floor.',
      'Keep arms unclenched and open to signal receptive confidence.',
      'Nod occasionally while the interviewer is speaking to confirm active listening.'
    ]
  },
  {
    id: 'etiquette-2',
    title: 'Webcam Eye Contact & Positioning',
    category: 'Camera & Lighting',
    recommendation: 'Position the webcam at eye level. Looking into the camera lens creates the psychological impression of direct eye contact for the interviewer.',
    visualCue: 'Elevate laptop or monitor on a stand/books so the lens aligns with your eyebrow level at arm’s length (60–75cm).',
    impactScore: 'Critical (Trust & Confidence)',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    bestPractices: [
      'Do not look down at the keyboard or bottom corner of the screen when speaking.',
      'Place the interviewer’s video window directly below your camera lens.',
      'Frame yourself from the mid-chest up with 2 inches of headroom above your hair.'
    ]
  },
  {
    id: 'etiquette-3',
    title: 'Frontal Lighting & Contrast',
    category: 'Camera & Lighting',
    recommendation: 'Position your primary light source in front of your face (behind the camera). Never sit with a bright window or lamp directly behind you.',
    visualCue: 'Diffused warm/neutral light directly facing you; clear illumination of facial expressions without harsh shadows or silhouette glare.',
    impactScore: 'High (Visual Clarity & Professionalism)',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    bestPractices: [
      'Avoid backlighting that turns you into a dark silhouette.',
      'Use a desk lamp bouncing off a white wall or a ring light set to 4000K neutral light.',
      'Close window blinds behind you if sunlight is shifting.'
    ]
  },
  {
    id: 'etiquette-4',
    title: 'Professional Dress Code',
    category: 'Attire & Environment',
    recommendation: 'Wear neat, professional business-casual or formal attire (button-down collared shirt, blazer, or formal top) in solid neutral colors.',
    visualCue: 'Crisp collar, ironed shirt, navy/charcoal/light-blue tones; clean neutral background without visual clutter or laundry.',
    impactScore: 'High (First Impression & Respect)',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    bestPractices: [
      'Solid colors look much better on video compression than dense stripes or polka dots.',
      'Dress fully professionally, not just from the waist up, to stay in a formal mindset.',
      'Ensure your background is tidy, a plain wall, or use a soft subtle background blur.'
    ]
  },
  {
    id: 'etiquette-5',
    title: 'Vocal Pacing & Structured Responses',
    category: 'Speaking Technique',
    recommendation: 'Speak at a moderate, calm cadence (130–150 words per minute). Take a 2-second pause before answering to organize your thoughts.',
    visualCue: 'Deep diaphragmatic breath before speaking; clear pronunciation without rushing or filling pauses with "um", "like", or "you know".',
    impactScore: 'Critical (Communication Assessment)',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    bestPractices: [
      'Take 2 seconds to pause: "That is a great question. Let me break that down into two parts."',
      'Structure every response: Point 1, Point 2, Conclusion.',
      'Stop speaking once you answer the question; do not trail off awkwardly.'
    ]
  }
];

export const COMMON_INTERVIEW_PREP: InterviewQuestionPrep[] = [
  {
    id: 'prep-1',
    category: 'HR & Behavioral',
    question: 'Tell me about yourself.',
    interviewerExpectation:
      'The interviewer seeks a crisp, 60 to 90-second professional elevator pitch. They want to see your articulation, passion for technology, relevant academic projects, and how your trajectory matches this placement role.',
    sampleAnswer:
      `"Hello! My name is Bathri Narayanan, a Computer Science graduate passionate about building robust software systems and data-driven applications. During my degree, I focused heavily on core algorithms, object-oriented design, and database systems. 

Recently, I engineered a full-stack automated evaluation platform using Python, React, and SQLite, which handles automated code grading with isolated subprocesses and sub-second feedback. Outside coursework, I actively solve algorithmic problems on LeetCode and contribute to campus technical initiatives. 

I am eager to begin my career at your organization as a software engineer where I can contribute to high-scale production systems while continuing to expand my engineering craft."`,
    keyPoints: [
      'Structure: Past (Education/Foundation) → Present (Key Projects/Skills) → Future (Why this role).',
      'Keep it strictly between 60–90 seconds.',
      'Highlight 1-2 tangible technical accomplishments with measurable outcomes.',
      'Never recite your high school marks or resume word-for-word.'
    ],
    doAndDont: {
      do: 'Connect your technical journey directly to the skills requested in the job description.',
      dont: 'Do not dive into personal family details or wander without a structured timeline.'
    }
  },
  {
    id: 'prep-2',
    category: 'HR & Behavioral',
    question: 'Why should we hire you over other candidates?',
    interviewerExpectation:
      'Interviewers evaluate your unique value proposition, self-awareness, readiness to deliver fast, and genuine eagerness to contribute without being arrogant.',
    sampleAnswer:
      `"You should hire me because I combine strong foundational knowledge in data structures and software design with hands-on development experience. In my projects, I don't just write code that passes happy paths; I design for error handling, test edge cases, and measure runtime performance. 

Furthermore, I am a very fast learner who proactively learns new frameworks. I am eager to take ownership of assigned modules, collaborate closely with your engineering team, and contribute positively from day one."`,
    keyPoints: [
      'Emphasize disciplined problem-solving and eagerness to learn.',
      'Mention your strong fundamentals (DSA, OOP, SQL, Clean Code).',
      'Convey enthusiasm for the company\'s engineering culture.'
    ],
    doAndDont: {
      do: 'Frame your skills as solutions to their engineering challenges.',
      dont: 'Do not disparage other candidates or make exaggerated unverifiable claims.'
    }
  },
  {
    id: 'prep-3',
    category: 'HR & Behavioral',
    question: 'What are your greatest strengths and how do they help you as an engineer?',
    interviewerExpectation:
      'Assess whether you can articulate strengths with concrete evidence rather than vague buzzwords like "hard worker" or "perfectionist".',
    sampleAnswer:
      `"My greatest technical strength is structured analytical debugging and root-cause analysis. When encountering failing test cases or server bottlenecks, I don't guess—I formulate hypotheses, inspect log traces, and isolate variables methodically. 

My greatest soft skill is clear technical communication. In group projects, I ensure schemas, API contracts, and requirements are clearly documented so team members never work on conflicting assumptions."`,
    keyPoints: [
      'Pick 1 technical strength and 1 interpersonal/execution strength.',
      'Back both up with a micro-example from your project work.',
      'Keep the tone humble yet confident.'
    ],
    doAndDont: {
      do: 'Give specific examples where this strength saved time or prevented errors.',
      dont: 'Do not list 10 generic adjectives without supporting context.'
    }
  },
  {
    id: 'prep-4',
    category: 'HR & Behavioral',
    question: 'What is your biggest weakness and what are you doing to improve it?',
    interviewerExpectation:
      'Tests your honesty, emotional maturity, and whether you possess a growth mindset to actively fix shortcomings.',
    sampleAnswer:
      `"Early on, I struggled with asking for clarification early enough when project requirements were ambiguous. I used to spend excessive hours attempting to reverse-engineer intent instead of confirming. 

To improve, I adopted a structured 30-minute rule: if I am blocked or if an API contract has ambiguities after 30 minutes of independent research, I write down specific questions with options and reach out to team leads. This has significantly boosted my turnaround time and prevented rework."`,
    keyPoints: [
      'Choose a real, non-fatal professional weakness (avoid "I work too hard").',
      'Focus 80% of your answer on the active steps you took to improve.',
      'Show measurable progress in recent projects.'
    ],
    doAndDont: {
      do: 'Show high self-awareness and describe your remediation system.',
      dont: 'Never say "I have no weaknesses" or mention a fatal flaw for an engineer like "I hate math/coding".'
    }
  },
  {
    id: 'prep-5',
    category: 'Career & Culture',
    question: 'Where do you see yourself in 3 to 5 years?',
    interviewerExpectation:
      'Assesses your career planning, retention potential, and ambition to grow as a senior engineer within their ecosystem.',
    sampleAnswer:
      `"In the next 3 to 5 years, my goal is to develop into a dependable, end-to-end software engineer who deeply understands system architecture, high-availability design, and production operations. 

I look forward to mastering this company's technology stack, taking ownership of mission-critical features, and eventually mentoring upcoming campus hires and contributing to architectural decisions."`,
    keyPoints: [
      'Demonstrate commitment to technical growth and engineering excellence.',
      'Align your milestones with typical career ladders (Junior → SDE II / Senior).',
      'Reflect loyalty and interest in long-term impact.'
    ],
    doAndDont: {
      do: 'Show interest in progressive mastery and team ownership.',
      dont: 'Do not mention leaving for higher studies or switching industries in 2 years.'
    }
  },
  {
    id: 'prep-6',
    category: 'Technical Projects',
    question: 'Can you walk me through the architecture of your most significant project?',
    interviewerExpectation:
      'Tests your ability to communicate complex software designs using the STAR/PAR method: Problem, Architecture, Technologies, Trade-offs, and Results.',
    sampleAnswer:
      `"Certainly! I designed an automated placement evaluation portal. 

Problem: Campus placement candidates needed realistic mock assessments with real multi-language compilation and instant test case verification.

Architecture: I decoupled the application into a React/TypeScript frontend for sub-millisecond state updates and an Express Node.js backend. For code execution, rather than unsafe eval(), I implemented an isolated child_process runner with 3.5-second hard timeouts, memory guards, and file system cleanup.

Trade-offs: I chose SQLite over external heavy databases for local sandbox execution to minimize latency and guarantee instant boot in container environments.

Outcome: The platform executes student submissions across 5 languages with zero crashes and provides comprehensive topic breakdowns across 39 questions."`,
    keyPoints: [
      'Use STAR framework: Situation, Task, Action, Result.',
      'Explain WHY you chose specific tech stacks, not just WHAT they are.',
      'Quantify the results (latency, test coverage, questions handled).'
    ],
    doAndDont: {
      do: 'Highlight difficult technical problems you personally solved.',
      dont: 'Do not speak vaguely about a team project where you only did presentation slides.'
    }
  },
  {
    id: 'prep-7',
    category: 'Technical Projects',
    question: 'Why did you choose this specific technology stack over alternatives?',
    interviewerExpectation:
      'Evaluates technical decision-making and awareness of trade-offs (performance, ecosystem, type safety, developer velocity).',
    sampleAnswer:
      `"I chose TypeScript and Node.js because TypeScript provides compile-time type safety, which eliminated entire categories of runtime undefined errors during state transitions. 

For the frontend, React was selected due to its component-driven architecture and reactive state model, making complex real-time test countdowns and code editors manageable. While Python could have handled the backend, Node's event-driven asynchronous I/O made concurrent test execution and streaming child-process buffers very lightweight."`,
    keyPoints: [
      'Discuss comparative trade-offs between Tech A vs Tech B.',
      'Mention developer experience, type safety, and runtime characteristics.',
      'Show that technology selection was deliberate, not accidental.'
    ],
    doAndDont: {
      do: 'Demonstrate rational technical trade-offs.',
      dont: 'Never say "I chose it because it was the only thing I knew".'
    }
  },
  {
    id: 'prep-8',
    category: 'Career & Culture',
    question: 'Are you willing to learn new technologies and adapt to unfamiliar domains?',
    interviewerExpectation:
      'Tests agility and enthusiasm for lifelong learning in rapidly evolving tech organizations.',
    sampleAnswer:
      `"Absolutely. Technologies and frameworks evolve, but strong foundational principles—data structures, system design, operating systems, and network protocols—remain constant. 

Whenever I need to learn a new language or framework, I ground myself in the official documentation, build a small end-to-end prototype, and inspect idiomatic design patterns. I welcome the opportunity to work with whatever stack best solves your business challenges."`,
    keyPoints: [
      'Affirm that fundamentals transcend specific programming languages.',
      'Share your systematic methodology for mastering new tools quickly.',
      'Convey genuine excitement for technical versatility.'
    ],
    doAndDont: {
      do: 'Cite a previous instance where you learned a new tool under tight deadlines.',
      dont: 'Do not appear rigid or defensive about a single preferred language.'
    }
  }
];
