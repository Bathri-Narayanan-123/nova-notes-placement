import { PlacementRole } from '../types';

export const PLACEMENT_ROLES: PlacementRole[] = [
  {
    id: 'python-dev',
    title: 'Python Developer',
    description: 'Build robust applications using Python, OOP, DSA, basic SQL, and algorithmic problem solving.',
    skills: ['Python', 'OOP', 'DSA', 'SQL', 'Problem Solving'],
    icon: 'Code',
    color: 'emerald',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
  {
    id: 'java-dev',
    title: 'Java Developer',
    description: 'Develop enterprise-grade systems using Java, OOP, Collections, Multithreading, DSA, and SQL.',
    skills: ['Java', 'OOP', 'DSA', 'SQL', 'System Design'],
    icon: 'Layers',
    color: 'amber',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Analyze data pipelines, transform datasets with Pandas & SQL, compute statistics, and extract business insights.',
    skills: ['SQL', 'Python', 'Statistics', 'Data Analysis', 'Aptitude'],
    icon: 'BarChart3',
    color: 'sky',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Formulate predictive models, statistical inferences, ML pipelines, and advanced SQL data queries.',
    skills: ['Python', 'Statistics', 'ML Basics', 'SQL', 'Data Concepts'],
    icon: 'Brain',
    color: 'indigo',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    description: 'Architect scalable machine learning systems, feature stores, neural algorithms, and model inference services.',
    skills: ['Python', 'DSA', 'ML Basics', 'SQL', 'Problem Solving'],
    icon: 'Sparkles',
    color: 'purple',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
  {
    id: 'web-dev',
    title: 'Web Developer',
    description: 'Engineer modern web applications with HTML5, CSS3, JavaScript, REST APIs, and database integration.',
    skills: ['HTML/CSS', 'JavaScript', 'Basic Programming', 'SQL', 'Web APIs'],
    icon: 'Globe',
    color: 'blue',
    defaultComposition: {
      mcq: 15,
      aptitude: 10,
      output: 10,
      coding: 4,
    },
  },
];

