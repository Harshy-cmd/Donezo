import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  tasksAPI, habitsAPI, goalsAPI, notificationsAPI,
  getToken, setToken, removeToken, authAPI
} from '../services/api';

const AppContext = createContext();

const initialState = {
  tasks: [],
  habits: [],
  goals: [],
  notifications: [],
  activeView: 'dashboard',
  sidebarOpen: true,
  showTaskModal: false,
  showGoalModal: false,
  showHabitModal: false,
  selectedTask: null,
  taskFilter: { search: '', status: 'all', priority: 'all', category: 'all', sort: 'dueDate' },
  isAuthenticated: !!getToken(),
  user: null,
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload || state.user };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, tasks: [], habits: [], goals: [], notifications: [] };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TASK_FILTER':
      return { ...state, taskFilter: { ...state.taskFilter, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'OPEN_TASK_MODAL':
      return { ...state, showTaskModal: true, selectedTask: action.payload || null };
    case 'CLOSE_TASK_MODAL':
      return { ...state, showTaskModal: false, selectedTask: null };
    case 'SELECT_TASK':
      return { ...state, selectedTask: action.payload, showTaskModal: true };
    case 'OPEN_GOAL_MODAL':
      return { ...state, showGoalModal: true };
    case 'CLOSE_GOAL_MODAL':
      return { ...state, showGoalModal: false };
    case 'OPEN_HABIT_MODAL':
      return { ...state, showHabitModal: true };
    case 'CLOSE_HABIT_MODAL':
      return { ...state, showHabitModal: false };

    // ─── Tasks ───────────────────────────────────────────────────────────────
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_TASK_STATUS':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'TOGGLE_SUBTASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };

    // ─── Habits ──────────────────────────────────────────────────────────────
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [action.payload, ...state.habits] };
    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'TOGGLE_HABIT_TODAY':
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'UPDATE_HABIT_HISTORY':
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };

    // ─── Goals ───────────────────────────────────────────────────────────────
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL':
    case 'UPDATE_GOAL_PROGRESS':
    case 'TOGGLE_MILESTONE':
    case 'TOGGLE_GOAL_MILESTONE':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    // ─── Notifications ───────────────────────────────────────────────────────
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ─── Load all data when authenticated ──────────────────────────────────────
  const loadAllData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [tasks, habits, goals, notifications] = await Promise.all([
        tasksAPI.getAll(),
        habitsAPI.getAll(),
        goalsAPI.getAll(),
        notificationsAPI.getAll(),
      ]);
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_HABITS', payload: habits });
      dispatch({ type: 'SET_GOALS', payload: goals });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (err) {
      console.error('Failed to load data:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      loadAllData();
    }
  }, [state.isAuthenticated, loadAllData]);

  // ─── API-backed action helpers (attach to context for components to use) ───
  const actions = {
    // Auth
    login: async (email, password) => {
      const data = await authAPI.login(email, password);
      setToken(data.token);
      dispatch({ type: 'LOGIN', payload: data.user });
    },
    register: async (name, email, password) => {
      const data = await authAPI.register(name, email, password);
      setToken(data.token);
      dispatch({ type: 'LOGIN', payload: data.user });
    },
    logout: () => {
      removeToken();
      dispatch({ type: 'LOGOUT' });
    },

    // Tasks
    addTask: async (task) => {
      const created = await tasksAPI.create(task);
      dispatch({ type: 'ADD_TASK', payload: created });
      return created;
    },
    updateTask: async (id, updates) => {
      const updated = await tasksAPI.update(id, updates);
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      return updated;
    },
    toggleTaskStatus: async (id) => {
      const updated = await tasksAPI.toggleStatus(id);
      dispatch({ type: 'TOGGLE_TASK_STATUS', payload: updated });
    },
    toggleSubtask: async (taskId, subtaskId) => {
      const updated = await tasksAPI.toggleSubtask(taskId, subtaskId);
      dispatch({ type: 'TOGGLE_SUBTASK', payload: updated });
    },
    deleteTask: async (id) => {
      await tasksAPI.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    },

    // Habits
    addHabit: async (habit) => {
      const created = await habitsAPI.create(habit);
      dispatch({ type: 'ADD_HABIT', payload: created });
      return created;
    },
    toggleHabitToday: async (id) => {
      const updated = await habitsAPI.toggleToday(id);
      dispatch({ type: 'TOGGLE_HABIT_TODAY', payload: updated });
    },
    updateHabitHistory: async (id, index, value) => {
      const updated = await habitsAPI.updateHistory(id, index, value);
      dispatch({ type: 'UPDATE_HABIT_HISTORY', payload: updated });
    },
    deleteHabit: async (id) => {
      await habitsAPI.delete(id);
      dispatch({ type: 'DELETE_HABIT', payload: id });
    },

    // Goals
    addGoal: async (goal) => {
      const created = await goalsAPI.create(goal);
      dispatch({ type: 'ADD_GOAL', payload: created });
      return created;
    },
    updateGoal: async (id, updates) => {
      const updated = await goalsAPI.update(id, updates);
      dispatch({ type: 'UPDATE_GOAL', payload: updated });
    },
    toggleMilestone: async (goalId, milestoneId) => {
      const updated = await goalsAPI.toggleMilestone(goalId, milestoneId);
      dispatch({ type: 'TOGGLE_MILESTONE', payload: updated });
    },
    deleteGoal: async (id) => {
      await goalsAPI.delete(id);
      dispatch({ type: 'DELETE_GOAL', payload: id });
    },

    // Notifications
    markNotificationRead: async (id) => {
      await notificationsAPI.markRead(id);
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    },
    markAllNotificationsRead: async () => {
      await notificationsAPI.markAllRead();
      dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
    },
    clearNotifications: async () => {
      await notificationsAPI.clearAll();
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
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
