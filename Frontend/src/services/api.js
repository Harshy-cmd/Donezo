// ─── API Service Layer ────────────────────────────────────────────────────────
// All requests to the Donezo backend are routed through this file.
// Base URL can be overridden via a .env variable in the Frontend project.

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('donezo_token');
export const setToken = (token) => localStorage.setItem('donezo_token', token);
export const removeToken = () => localStorage.removeItem('donezo_token');

// ─── Base Fetch Wrapper ───────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  // 204 No Content
  if (response.status === 204) return null;
  return response.json();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/auth/me'),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: () => request('/tasks'),

  create: (task) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  update: (id, updates) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  toggleStatus: (id, status) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  toggleSubtask: (taskId, subtaskId) =>
    request(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'PATCH' }),

  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};

// ─── Habits ─────────────────────────────────────────────────────────────────
export const habitsAPI = {
  getAll: () => request('/habits'),

  create: (habit) =>
    request('/habits', { method: 'POST', body: JSON.stringify(habit) }),

  toggleToday: (id) =>
    request(`/habits/${id}/toggle`, { method: 'PATCH' }),

  updateHistory: (id, index, value) =>
    request(`/habits/${id}/history`, { method: 'PATCH', body: JSON.stringify({ index, value }) }),

  delete: (id) => request(`/habits/${id}`, { method: 'DELETE' }),
};

// ─── Goals ──────────────────────────────────────────────────────────────────
export const goalsAPI = {
  getAll: () => request('/goals'),

  create: (goal) =>
    request('/goals', { method: 'POST', body: JSON.stringify(goal) }),

  update: (id, updates) =>
    request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  toggleMilestone: (goalId, milestoneId) =>
    request(`/goals/${goalId}/milestones/${milestoneId}`, { method: 'PATCH' }),

  delete: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
};

// ─── Notifications ──────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => request('/notifications'),

  create: (text, time) =>
    request('/notifications', { method: 'POST', body: JSON.stringify({ text, time }) }),

  markRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),

  clearAll: () =>
    request('/notifications', { method: 'DELETE' }),
};
