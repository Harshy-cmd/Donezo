import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SEED_TASKS, SEED_HABITS, SEED_GOALS, INITIAL_NOTIFICATIONS } from '../data/initialData';

const AppContext = createContext();

const initialState = {
  tasks: JSON.parse(localStorage.getItem('donezo_tasks')) || SEED_TASKS,
  habits: JSON.parse(localStorage.getItem('donezo_habits')) || SEED_HABITS,
  goals: JSON.parse(localStorage.getItem('donezo_goals')) || SEED_GOALS,
  notifications: JSON.parse(localStorage.getItem('donezo_notifications')) || INITIAL_NOTIFICATIONS,
  activeView: 'dashboard',
  sidebarOpen: true,
  showTaskModal: false,
  showGoalModal: false,
  showHabitModal: false,
  selectedTask: null,
  taskFilter: { search: '', status: 'all', priority: 'all', category: 'all', sort: 'dueDate' },
};

function reducer(state, action) {
  let newState;
  switch (action.type) {
    case 'SET_VIEW':
      newState = { ...state, activeView: action.payload };
      break;
    case 'SET_TASK_FILTER':
      newState = { ...state, taskFilter: { ...state.taskFilter, ...action.payload } };
      break;
    case 'TOGGLE_SIDEBAR':
      newState = { ...state, sidebarOpen: !state.sidebarOpen };
      break;
    case 'OPEN_TASK_MODAL':
      newState = { ...state, showTaskModal: true, selectedTask: action.payload || null };
      break;
    case 'CLOSE_TASK_MODAL':
      newState = { ...state, showTaskModal: false, selectedTask: null };
      break;
    case 'ADD_TASK':
      newState = { ...state, tasks: [...state.tasks, action.payload] };
      break;
    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
      break;
    case 'DELETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      };
      break;
    case 'TOGGLE_TASK_STATUS':
      newState = {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === action.payload) {
            return { ...t, status: t.status === 'done' ? 'pending' : 'done' };
          }
          return t;
        })
      };
      break;
    case 'TOGGLE_SUBTASK':
      newState = {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === action.payload.taskId) {
            return {
              ...t,
              subtasks: t.subtasks.map(s => s.id === action.payload.subtaskId ? { ...s, done: !s.done } : s)
            };
          }
          return t;
        })
      };
      break;
    case 'UPDATE_HABIT_HISTORY':
      newState = {
        ...state,
        habits: state.habits.map(h => {
          if (h.id === action.payload.id) {
            const newHistory = [...h.history];
            newHistory[action.payload.index] = action.payload.value;
            const streak = newHistory[6] ? h.streak + 1 : h.streak;
            return { ...h, history: newHistory, streak };
          }
          return h;
        })
      };
      break;
    case 'DELETE_HABIT':
      newState = {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload)
      };
      break;
    case 'UPDATE_GOAL':
    case 'UPDATE_GOAL_PROGRESS':
      newState = {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? { ...g, progress: action.payload.progress } : g)
      };
      break;
    case 'TOGGLE_MILESTONE':
    case 'TOGGLE_GOAL_MILESTONE':
      newState = {
        ...state,
        goals: state.goals.map(g => {
          if (g.id === (action.payload.goalId || action.payload.id)) {
            return {
              ...g,
              milestones: g.milestones.map(m => m.id === action.payload.milestoneId ? { ...m, done: !m.done } : m)
            };
          }
          return g;
        })
      };
      break;
    case 'DELETE_GOAL':
      newState = {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload)
      };
      break;
    case 'MARK_NOTIFICATION_READ':
      newState = {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n)
      };
      break;
    case 'MARK_NOTIFICATIONS_READ':
      newState = {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };
      break;
    case 'CLEAR_NOTIFICATIONS':
      newState = {
        ...state,
        notifications: []
      };
      break;
    case 'SELECT_TASK':
        newState = { ...state, selectedTask: action.payload, showTaskModal: true };
        break;
    case 'OPEN_GOAL_MODAL':
      newState = { ...state, showGoalModal: true };
      break;
    case 'CLOSE_GOAL_MODAL':
      newState = { ...state, showGoalModal: false };
      break;
    case 'OPEN_HABIT_MODAL':
      newState = { ...state, showHabitModal: true };
      break;
    case 'CLOSE_HABIT_MODAL':
      newState = { ...state, showHabitModal: false };
      break;
    case 'ADD_GOAL':
      newState = { ...state, goals: [...state.goals, action.payload] };
      break;

    case 'ADD_HABIT':
      newState = { ...state, habits: [...state.habits, action.payload] };
      break;
    case 'TOGGLE_HABIT_TODAY':
      newState = {
        ...state,
        habits: state.habits.map(h => {
          if (h.id === action.payload) {
            const isDone = !h.completedToday;
            return {
              ...h,
              completedToday: isDone,
              streak: isDone ? h.streak + 1 : Math.max(0, h.streak - 1)
            };
          }
          return h;
        })
      };
      break;
    case 'ADD_NOTIFICATION':
      newState = { ...state, notifications: [action.payload, ...state.notifications] };
      break;
    default:
      return state;
  }
  
  return newState;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('donezo_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('donezo_habits', JSON.stringify(state.habits));
    localStorage.setItem('donezo_goals', JSON.stringify(state.goals));
    localStorage.setItem('donezo_notifications', JSON.stringify(state.notifications));
  }, [state.tasks, state.habits, state.goals, state.notifications]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
