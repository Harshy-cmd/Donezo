import React, { useState, useMemo } from 'react';
import './Tasks.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../data/initialData';
import TaskModal from '../TaskModal/TaskModal';

const PRIORITY_COLORS = { urgent: '#f43f5e', high: '#f59e0b', medium: '#6c63ff', low: '#10b981' };
const STATUS_COLORS   = { pending: '#9aa3c2', progress: '#06b6d4', done: '#10b981', overdue: '#f43f5e' };

function TaskCard({ task, onToggle, onOpen, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === task.category);
  const subtasksDone = task.subtasks.filter(s => s.done).length;
  const subtaskPct   = task.subtasks.length
    ? Math.round((subtasksDone / task.subtasks.length) * 100) : null;

  const isToday = task.dueDate === new Date().toISOString().split('T')[0];

  return (
    <div
      className={`task-card task-card--${task.status}`}
      style={{ '--priority-color': PRIORITY_COLORS[task.priority] }}
    >
      <div className="task-card__priority-stripe" />

      <div className="task-card__header">
        <button
          className={`task-card__check ${task.status === 'done' ? 'task-card__check--done' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        >
          {task.status === 'done' && '✓'}
        </button>
        <div className="task-card__title-wrap" onClick={() => onOpen(task)}>
          <span className={`task-card__title ${task.status === 'done' ? 'task-card__title--done' : ''}`}>
            {task.title}
          </span>
          <div className="task-card__badges">
            <span
              className="task-card__badge"
              style={{ background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority] }}
            >
              {task.priority}
            </span>
            <span
              className="task-card__badge"
              style={{ background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status] }}
            >
              {STATUSES.find(s => s.id === task.status)?.label}
            </span>
            {task.recurring && <span className="task-card__badge task-card__badge--neutral">🔄 {task.recurring}</span>}
            {isToday && <span className="task-card__badge task-card__badge--today">Today</span>}
          </div>
        </div>
        <button
          className="task-card__delete"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          title="Delete task"
        >✕</button>
      </div>

      {task.description && (
        <p className="task-card__desc" onClick={() => onOpen(task)}>{task.description}</p>
      )}

      {task.subtasks.length > 0 && (
        <div className="task-card__subtasks" onClick={() => onOpen(task)}>
          <div className="task-card__subtask-bar">
            <div className="task-card__subtask-track">
              <div
                className="task-card__subtask-fill"
                style={{ width: `${subtaskPct}%` }}
              />
            </div>
            <span>{subtasksDone}/{task.subtasks.length}</span>
          </div>
        </div>
      )}

      <div className="task-card__footer" onClick={() => onOpen(task)}>
        <span className="task-card__cat" style={{ color: cat?.color }}>
          {cat?.icon} {cat?.label}
        </span>
        <div className="task-card__tags">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="task-card__tag">#{tag}</span>
          ))}
        </div>
        <span className={`task-card__due ${task.status === 'overdue' ? 'task-card__due--overdue' : ''}`}>
          📅 {task.dueDate}
        </span>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { state, dispatch } = useApp();
  const { tasks, taskFilter, showTaskModal, selectedTask } = state;
  const [view, setView] = useState('list'); // 'list' | 'board'
  const [sortBy, setSortBy] = useState('dueDate');

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (taskFilter.status !== 'all')
      result = result.filter(t => t.status === taskFilter.status);
    if (taskFilter.priority !== 'all')
      result = result.filter(t => t.priority === taskFilter.priority);
    if (taskFilter.category !== 'all')
      result = result.filter(t => t.category === taskFilter.category);
    if (taskFilter.search) {
      const q = taskFilter.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'dueDate')  result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      result.sort((a, b) => order[a.priority] - order[b.priority]);
    }
    if (sortBy === 'title')    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [tasks, taskFilter, sortBy]);

  // Board columns
  const columns = STATUSES.map(s => ({
    ...s,
    items: filtered.filter(t => t.status === s.id),
  }));

  return (
    <div className="tasks-view animate-fade-in">
      {/* Toolbar */}
      <div className="tasks-toolbar">
        <div className="tasks-filters">
          {/* Status filter */}
          <select
            className="tasks-select"
            value={taskFilter.status}
            onChange={e => dispatch({ type: 'SET_TASK_FILTER', payload: { status: e.target.value } })}
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          {/* Priority filter */}
          <select
            className="tasks-select"
            value={taskFilter.priority}
            onChange={e => dispatch({ type: 'SET_TASK_FILTER', payload: { priority: e.target.value } })}
          >
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>

          {/* Category filter */}
          <select
            className="tasks-select"
            value={taskFilter.category}
            onChange={e => dispatch({ type: 'SET_TASK_FILTER', payload: { category: e.target.value } })}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>

          {/* Sort */}
          <select
            className="tasks-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>

        <div className="tasks-actions">
          <span className="tasks-count">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>

          {/* View toggle */}
          <div className="tasks-view-toggle">
            <button
              className={`tasks-view-btn ${view === 'list' ? 'tasks-view-btn--active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
            >☰</button>
            <button
              className={`tasks-view-btn ${view === 'board' ? 'tasks-view-btn--active' : ''}`}
              onClick={() => setView('board')}
              title="Board view"
            >⊞</button>
          </div>

          <button
            className="tasks-add-btn"
            onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="tasks-list">
          {filtered.length === 0 ? (
            <div className="tasks-empty">
              <span className="tasks-empty__icon">📭</span>
              <h3>No tasks found</h3>
              <p>Try adjusting your filters or add a new task.</p>
              <button
                className="tasks-empty__cta"
                onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}
              >+ Create Task</button>
            </div>
          ) : filtered.map((task, i) => (
            <div key={task.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-fade-in">
              <TaskCard
                task={task}
                onToggle={id => dispatch({ type: 'TOGGLE_TASK_STATUS', payload: id })}
                onOpen={t => dispatch({ type: 'SELECT_TASK', payload: t })}
                onDelete={id => dispatch({ type: 'DELETE_TASK', payload: id })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Board View */}
      {view === 'board' && (
        <div className="tasks-board">
          {columns.map(col => (
            <div key={col.id} className="tasks-board-col">
              <div className="tasks-board-col__header">
                <span
                  className="tasks-board-col__dot"
                  style={{ background: col.color }}
                />
                <span className="tasks-board-col__title">{col.label}</span>
                <span className="tasks-board-col__count">{col.items.length}</span>
              </div>
              <div className="tasks-board-col__cards">
                {col.items.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={id => dispatch({ type: 'TOGGLE_TASK_STATUS', payload: id })}
                    onOpen={t => dispatch({ type: 'SELECT_TASK', payload: t })}
                    onDelete={id => dispatch({ type: 'DELETE_TASK', payload: id })}
                  />
                ))}
                {col.items.length === 0 && (
                  <div className="tasks-board-col__empty">Drop tasks here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => dispatch({ type: 'CLOSE_TASK_MODAL' })}
        />
      )}
    </div>
  );
}
