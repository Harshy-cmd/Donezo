const today = new Date();
const getTodayStr = () => today.toISOString().split('T')[0];
const getFutureDate = (daysAhead) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

export const CATEGORIES = [
  { id: 'health', label: 'Health', icon: '❤️', color: '#ff4d4d' },
  { id: 'work', label: 'Work', icon: '💼', color: '#cc0000' },
  { id: 'finance', label: 'Finance', icon: '💰', color: '#ff3333' },
  { id: 'personal', label: 'Personal', icon: '🌱', color: '#e60000' },
  { id: 'learning', label: 'Learning', icon: '📚', color: '#b30000' }
];

export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: '#ff0000' },
  { id: 'high', label: 'High', color: '#cc0000' },
  { id: 'medium', label: 'Medium', color: '#990000' },
  { id: 'low', label: 'Low', color: '#666666' }
];

export const STATUSES = [
  { id: 'pending', label: 'Pending' },
  { id: 'progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'overdue', label: 'Overdue' }
];

export const SEED_TASKS = [
  {
    id: 't-1',
    title: 'Morning Workout Routine',
    description: '30-minute cardio + strength training session.',
    dueDate: getTodayStr(),
    priority: 'high',
    category: 'health',
    status: 'pending',
    tags: ['fitness', 'health'],
    recurring: 'daily',
    subtasks: [
      { id: 's-1-1', title: '15 min treadmill', done: false },
      { id: 's-1-2', title: '15 min weights', done: false }
    ]
  },
  {
    id: 't-2',
    title: 'Review Monthly Budget',
    description: 'Check subscriptions, track spend vs. plan.',
    dueDate: getFutureDate(-1),
    priority: 'high',
    category: 'finance',
    status: 'overdue',
    tags: ['finance', 'planning'],
    recurring: 'monthly',
    subtasks: [
      { id: 's-2-1', title: 'Download bank statements', done: true }
    ]
  },
  {
    id: 't-3',
    title: 'Prepare Q2 Marketing Report',
    description: '',
    dueDate: getFutureDate(1),
    priority: 'urgent',
    category: 'work',
    status: 'pending',
    tags: ['marketing', 'report'],
    recurring: 'none',
    subtasks: []
  },
  {
    id: 't-4',
    title: 'Read "Atomic Habits" Ch. 5-8',
    description: '',
    dueDate: getFutureDate(3),
    priority: 'medium',
    category: 'learning',
    status: 'pending',
    tags: ['reading'],
    recurring: 'none',
    subtasks: []
  },
  {
    id: 't-5',
    title: 'Plan Weekend Trip',
    description: '',
    dueDate: getFutureDate(5),
    priority: 'low',
    category: 'personal',
    status: 'pending',
    tags: ['travel'],
    recurring: 'none',
    subtasks: []
  },
  {
    id: 't-6',
    title: 'Team Standup Prep',
    description: 'List blockers and yesterday\'s progress for standup.',
    dueDate: getTodayStr(),
    priority: 'medium',
    category: 'work',
    status: 'done',
    tags: ['meeting', 'communication'],
    recurring: 'daily',
    subtasks: []
  },
  {
    id: 't-7',
    title: 'Practice Spanish (Duolingo)',
    description: '15-minute daily language practice streak.',
    dueDate: getTodayStr(),
    priority: 'medium',
    category: 'learning',
    status: 'done',
    tags: ['language', 'streak'],
    recurring: 'daily',
    subtasks: []
  }
];

export const SEED_HABITS = [
  {
    id: 'h-1',
    title: 'Morning Meditation',
    category: 'health',
    frequency: 7,
    history: [true, false, true, true, false, true, false],
    streak: 12,
  },
  {
    id: 'h-2',
    title: 'Drink 8 Glasses of Water',
    category: 'health',
    frequency: 7,
    history: [true, true, true, true, true, false, false],
    streak: 5,
  },
  {
    id: 'h-3',
    title: 'Read for 20 Minutes',
    category: 'learning',
    frequency: 5,
    history: [false, true, true, false, true, true, false],
    streak: 3,
  },
  {
    id: 'h-4',
    title: 'No Social Media Before Noon',
    category: 'personal',
    frequency: 5,
    history: [true, true, true, true, true, true, true],
    streak: 8,
  },
  {
    id: 'h-5',
    title: 'Evening Walk',
    category: 'health',
    frequency: 6,
    history: [false, false, false, false, true, true, false],
    streak: 2,
  },
  {
    id: 'h-6',
    title: 'Journal Entry',
    category: 'personal',
    frequency: 4,
    history: [true, false, true, false, true, true, true],
    streak: 6,
  }
];

export const SEED_GOALS = [
  {
    id: 'g-1',
    title: 'Run a 5K',
    description: 'Complete my first 5K race by end of next month.',
    category: 'health',
    type: 'short',
    deadline: getFutureDate(30),
    progress: 65,
    milestones: [
      { id: 'm-1-1', text: 'Run 1km without stopping', done: true },
      { id: 'm-1-2', text: 'Run 3km in one session', done: true },
      { id: 'm-1-3', text: 'Run 5km training run', done: false },
      { id: 'm-1-4', text: 'Race day!', done: false }
    ]
  },
  {
    id: 'g-2',
    title: 'Learn React Advanced Patterns',
    description: 'Master hooks, context, performance optimisation, and testing.',
    category: 'learning',
    type: 'short',
    deadline: getFutureDate(45),
    progress: 40,
    milestones: [
      { id: 'm-2-1', text: 'Complete hooks deep-dive', done: true },
      { id: 'm-2-2', text: 'Build 3 projects', done: false },
      { id: 'm-2-3', text: 'Write blog post', done: false }
    ]
  },
  {
    id: 'g-3',
    title: 'Save $5,000 Emergency Fund',
    description: 'Build a financial safety net over 12 months.',
    category: 'finance',
    type: 'long',
    deadline: getFutureDate(180),
    progress: 28,
    milestones: [
      { id: 'm-3-1', text: 'Save first $500', done: true },
      { id: 'm-3-2', text: 'Reach $1,500', done: false },
      { id: 'm-3-3', text: 'Reach $3,000', done: false },
      { id: 'm-3-4', text: 'Full $5,000 goal', done: false }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'n-1', text: 'Welcome to Donezo!', time: 'Just now', read: false },
  { id: 'n-2', text: 'You have 1 overdue task.', time: '2h ago', read: false }
];
