import React, { useState } from 'react';
import './TaskModal.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRIORITIES, STATUSES } from '../../data/initialData';

const RECURRING_OPTIONS = [
  { value: '',        label: 'No repeat' },
  { value: 'daily',  label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly',label: 'Monthly' },
  { value: 'annually',label: 'Annually' },
];

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TaskModal({ task, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!task;

  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    dueDate:     task?.dueDate     || new Date().toISOString().split('T')[0],
    priority:    task?.priority    || 'medium',
    category:    task?.category    || 'work',
    status:      task?.status      || 'pending',
    recurring:   task?.recurring   || '',
    tags:        task?.tags?.join(', ') || '',
    subtasks:    task?.subtasks    || [],
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.dueDate)      errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id:          task?.id || uuid(),
      title:       form.title.trim(),
      description: form.description.trim(),
      dueDate:     form.dueDate,
      priority:    form.priority,
      category:    form.category,
      status:      form.status,
      recurring:   form.recurring || null,
      tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasks:    form.subtasks,
      createdAt:   task?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (isEdit) {
      dispatch({ type: 'UPDATE_TASK', payload });
    } else {
      dispatch({ type: 'ADD_TASK', payload });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: uuid(),
          title: `Task "${payload.title}" created`,
          icon: '📌',
          time: 'Just now',
          read: false,
        },
      });
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setForm(f => ({
      ...f,
      subtasks: [...f.subtasks, { id: uuid(), title: newSubtask.trim(), done: false }],
    }));
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }));
  };

  const toggleSubtask = (id) => {
    setForm(f => ({
      ...f,
      subtasks: f.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s),
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-bounce-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                value={form.title}
                onChange={set('title')}
                placeholder="What do you need to do?"
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={set('description')}
                placeholder="Add more details…"
                rows={3}
              />
            </div>

            {/* Row 1: Due date + Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className={`form-input ${errors.dueDate ? 'form-input--error' : ''}`}
                  value={form.dueDate}
                  onChange={set('dueDate')}
                />
                {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Category + Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Recurring + Tags */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🔄 Recurring</label>
                <select className="form-input form-select" value={form.recurring} onChange={set('recurring')}>
                  {RECURRING_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  className="form-input"
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="work, important, review"
                />
              </div>
            </div>

            {/* Subtasks */}
            <div className="form-group">
              <label className="form-label">Subtasks ({form.subtasks.length})</label>
              <div className="subtask-input-row">
                <input
                  className="form-input subtask-input"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask…"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <button type="button" className="subtask-add-btn" onClick={addSubtask}>+</button>
              </div>
              {form.subtasks.length > 0 && (
                <div className="subtask-list">
                  {form.subtasks.map(st => (
                    <div key={st.id} className="subtask-item">
                      <button
                        type="button"
                        className={`subtask-check ${st.done ? 'subtask-check--done' : ''}`}
                        onClick={() => toggleSubtask(st.id)}
                      >
                        {st.done && '✓'}
                      </button>
                      <span className={`subtask-text ${st.done ? 'subtask-text--done' : ''}`}>{st.title}</span>
                      <button
                        type="button"
                        className="subtask-remove"
                        onClick={() => removeSubtask(st.id)}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal__footer">
            {isEdit && (
              <button
                type="button"
                className="modal__btn modal__btn--danger"
                onClick={() => { dispatch({ type: 'DELETE_TASK', payload: task.id }); onClose(); }}
              >
                Delete Task
              </button>
            )}
            <div className="modal__footer-right">
              <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="modal__btn modal__btn--primary">
                {isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
