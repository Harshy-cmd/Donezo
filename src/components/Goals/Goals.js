import React, { useState } from 'react';
import './Goals.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function GoalCard({ goal, onToggleMilestone, onDelete, onUpdateProgress }) {
  const cat = CATEGORIES.find(c => c.id === goal.category);
  const doneMilestones = goal.milestones.filter(m => m.done).length;
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  const gradient = cat?.color
    ? `linear-gradient(135deg, ${cat.color}22, transparent)`
    : 'linear-gradient(135deg, rgba(108,99,255,0.08), transparent)';

  return (
    <div className="goal-card" style={{ '--cat-color': cat?.color, background: gradient }}>
      <div className="goal-card__header">
        <div className="goal-card__type-badge goal-card__type-badge--${goal.type}">
      {goal.type === 'short' ? '⚡ Short-term' : '🎯 Long-term'}
        </div>
        <button className="goal-card__delete" onClick={() => onDelete(goal.id)}>✕</button>
      </div>

      <h3 className="goal-card__title">{goal.title}</h3>
      <p className="goal-card__desc">{goal.description}</p>

      <div className="goal-card__meta">
        <span className="goal-card__cat" style={{ color: cat?.color }}>
          {cat?.icon} {cat?.label}
        </span>
        <span className={`goal-card__deadline ${daysLeft < 14 ? 'goal-card__deadline--urgent' : ''}`}>
          📅 {daysLeft} days left
        </span>
      </div>

      {/* Progress */}
      <div className="goal-card__progress-section">
        <div className="goal-card__progress-header">
          <span>Progress</span>
          <span className="goal-card__progress-pct" style={{ color: cat?.color }}>
            {goal.progress}%
          </span>
        </div>
        <div className="goal-card__progress-track">
          <div
            className="goal-card__progress-fill"
            style={{ width: `${goal.progress}%`, background: cat?.color || 'var(--accent-primary)' }}
          />
        </div>
        {/* Manual progress slider */}
        <input
          type="range"
          min="0" max="100"
          value={goal.progress}
          className="goal-card__slider"
          onChange={e => onUpdateProgress(goal.id, Number(e.target.value))}
        />
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="goal-card__milestones">
          <div className="goal-card__milestones-header">
            <span>Milestones</span>
            <span>{doneMilestones}/{goal.milestones.length}</span>
          </div>
          {goal.milestones.map(m => (
            <div
              key={m.id}
              className={`goal-mile ${m.done ? 'goal-mile--done' : ''}`}
              onClick={() => onToggleMilestone(goal.id, m.id)}
            >
              <span className={`goal-mile__check ${m.done ? 'goal-mile__check--done' : ''}`}>
                {m.done ? '✓' : ''}
              </span>
              <span className="goal-mile__text">{m.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalModal({ onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', type: 'short', category: 'personal',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    milestones: [],
  });
  const [newMile, setNewMile] = useState('');
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const addMilestone = () => {
    if (!newMile.trim()) return;
    setForm(f => ({
      ...f,
      milestones: [...f.milestones, { id: uuid(), text: newMile.trim(), done: false }],
    }));
    setNewMile('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    dispatch({
      type: 'ADD_GOAL',
      payload: {
        id: uuid(),
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        category: form.category,
        deadline: form.deadline,
        progress: 0,
        milestones: form.milestones,
      },
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-bounce-in" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">New Goal</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Goal Title *</label>
              <input className="form-input" value={form.title} onChange={set('title')} placeholder="What do you want to achieve?" autoFocus required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} placeholder="Why is this goal important?" rows={2} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input form-select" value={form.type} onChange={set('type')}>
                  <option value="short">⚡ Short-term</option>
                  <option value="long">🎯 Long-term</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input type="date" className="form-input" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div className="form-group">
              <label className="form-label">Milestones</label>
              <div className="subtask-input-row">
                <input className="form-input subtask-input" value={newMile} onChange={e => setNewMile(e.target.value)} placeholder="Add a milestone…"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())} />
                <button type="button" className="subtask-add-btn" onClick={addMilestone}>+</button>
              </div>
              {form.milestones.map(m => (
                <div key={m.id} className="subtask-item">
                  <span className="subtask-text">{m.text}</span>
                  <button type="button" className="subtask-remove"
                    onClick={() => setForm(f => ({ ...f, milestones: f.milestones.filter(x => x.id !== m.id) }))}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal__footer">
            <div className="modal__footer-right">
              <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="modal__btn modal__btn--primary">Create Goal</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const { state, dispatch } = useApp();
  const { goals, showGoalModal, taskFilter } = state;
  const [filter, setFilter] = useState('all');

  const searchFiltered = taskFilter.search
    ? goals.filter(g => g.title.toLowerCase().includes(taskFilter.search.toLowerCase()) || g.description?.toLowerCase().includes(taskFilter.search.toLowerCase()))
    : goals;

  const filtered = filter === 'all' ? searchFiltered : searchFiltered.filter(g => g.type === filter);

  const avgProgress = searchFiltered.length
    ? Math.round(searchFiltered.reduce((s, g) => s + g.progress, 0) / searchFiltered.length)
    : 0;

  return (
    <div className="goals-view animate-fade-in">
      {/* Summary */}
      <div className="goals-summary">
        <div className="goals-summary-card goals-summary-card--primary">
          <span className="goals-summary-icon">🎯</span>
          <div>
            <div className="goals-summary-val">{searchFiltered.length}</div>
            <div className="goals-summary-key">Total Goals</div>
          </div>
        </div>
        <div className="goals-summary-card">
          <span className="goals-summary-icon">⚡</span>
          <div>
            <div className="goals-summary-val">{searchFiltered.filter(g => g.type === 'short').length}</div>
            <div className="goals-summary-key">Short-term</div>
          </div>
        </div>
        <div className="goals-summary-card">
          <span className="goals-summary-icon">🏆</span>
          <div>
            <div className="goals-summary-val">{searchFiltered.filter(g => g.type === 'long').length}</div>
            <div className="goals-summary-key">Long-term</div>
          </div>
        </div>
        <div className="goals-summary-card">
          <span className="goals-summary-icon">📈</span>
          <div>
            <div className="goals-summary-val">{avgProgress}%</div>
            <div className="goals-summary-key">Avg Progress</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="goals-toolbar">
        <div className="goals-filter-tabs">
          {['all', 'short', 'long'].map(f => (
            <button
              key={f}
              className={`goals-tab ${filter === f ? 'goals-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Goals' : f === 'short' ? '⚡ Short-term' : '🎯 Long-term'}
            </button>
          ))}
        </div>
        <button
          className="tasks-add-btn"
          onClick={() => dispatch({ type: 'OPEN_GOAL_MODAL' })}
        >
          + New Goal
        </button>
      </div>

      {/* Cards Grid */}
      <div className="goals-grid">
        {filtered.map((goal, i) => (
          <div key={goal.id} style={{ animationDelay: `${i * 0.06}s` }} className="animate-fade-in">
            <GoalCard
              goal={goal}
              onToggleMilestone={(goalId, milestoneId) =>
                dispatch({ type: 'TOGGLE_MILESTONE', payload: { goalId, milestoneId } })
              }
              onDelete={id => dispatch({ type: 'DELETE_GOAL', payload: id })}
              onUpdateProgress={(id, progress) =>
                dispatch({ type: 'UPDATE_GOAL', payload: { id, progress } })
              }
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="habits-empty" style={{ gridColumn: '1/-1' }}>
            <span>🎯</span>
            <h3>No goals found</h3>
            <p>Set your first goal and start making progress today.</p>
            <button className="tasks-empty__cta"
              onClick={() => dispatch({ type: 'OPEN_GOAL_MODAL' })}>
              + Add Goal
            </button>
          </div>
        )}
      </div>

      {showGoalModal && (
        <GoalModal onClose={() => dispatch({ type: 'CLOSE_GOAL_MODAL' })} />
      )}
    </div>
  );
}
