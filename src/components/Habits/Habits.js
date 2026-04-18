import React, { useState } from 'react';
import './Habits.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const ICONS = ['🧘','💧','📖','📵','🚶','✍️','🏃','🥗','😴','💪','🎯','🎨','🎵','🛁','☕'];

function HabitCard({ habit, onToggle, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === habit.category);
  const pct = Math.min(100, Math.round((habit.streak / habit.goal) * 100));
  const weekHistory = habit.history.slice(0, 7).reverse();

  return (
    <div className={`habit-card ${habit.completedToday ? 'habit-card--done' : ''}`}>
      <div className="habit-card__top">
        <span className="habit-card__icon">{habit.icon}</span>
        <div className="habit-card__info">
          <h4 className="habit-card__title">{habit.title}</h4>
          <span className="habit-card__cat" style={{ color: cat?.color }}>
            {cat?.icon} {cat?.label}
          </span>
        </div>
        <div className="habit-card__streak">
          <span className="habit-card__streak-num">🔥 {habit.streak}</span>
          <span className="habit-card__streak-label">streak</span>
        </div>
      </div>

      {/* Week heatmap */}
      <div className="habit-card__week">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="habit-card__day">
            <div
              className={`habit-card__day-dot ${weekHistory[i] ? 'habit-card__day-dot--on' : ''}`}
            />
            <span className="habit-card__day-label">{d}</span>
          </div>
        ))}
      </div>

      {/* Progress towards goal */}
      <div className="habit-card__progress">
        <div className="habit-card__progress-top">
          <span className="habit-card__progress-label">Goal: {habit.goal} days/week</span>
          <span className="habit-card__progress-pct">{pct}%</span>
        </div>
        <div className="habit-card__progress-track">
          <div
            className="habit-card__progress-fill"
            style={{ width: `${pct}%`, background: cat?.color || 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div className="habit-card__footer">
        <button
          className="habit-card__delete-btn"
          onClick={() => onDelete(habit.id)}
        >
          Delete
        </button>
        <button
          className={`habit-card__check-btn ${habit.completedToday ? 'habit-card__check-btn--done' : ''}`}
          onClick={() => onToggle(habit.id)}
        >
          {habit.completedToday ? '✓ Done Today' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}

function HabitModal({ onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    title: '', icon: '🎯', goal: 7, category: 'personal',
  });
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    dispatch({
      type: 'ADD_HABIT',
      payload: {
        id: uuid(),
        title: form.title.trim(),
        icon: form.icon,
        goal: Number(form.goal),
        streak: 0,
        completedToday: false,
        category: form.category,
        history: Array(14).fill(0),
      },
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-bounce-in" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">New Habit</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-group">
              <label className="form-label">Habit Title *</label>
              <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g. Morning Meditation" autoFocus required />
            </div>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div className="habit-icon-grid">
                {ICONS.map(ic => (
                  <button
                    key={ic} type="button"
                    className={`habit-icon-btn ${form.icon === ic ? 'habit-icon-btn--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  >{ic}</button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Goal (days/week)</label>
                <input type="number" min="1" max="7" className="form-input" value={form.goal} onChange={set('goal')} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <div className="modal__footer-right">
              <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="modal__btn modal__btn--primary">Create Habit</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Habits() {
  const { state, dispatch } = useApp();
  const { habits, showHabitModal, taskFilter } = state;

  const filteredHabits = taskFilter.search
    ? habits.filter(h => h.title.toLowerCase().includes(taskFilter.search.toLowerCase()))
    : habits;

  const totalDone = filteredHabits.filter(h => h.completedToday).length;
  const maxStreak = Math.max(...filteredHabits.map(h => h.streak), 0);
  const avgRate = filteredHabits.length
    ? Math.round(filteredHabits.reduce((s, h) => s + (h.history.slice(0, 7).filter(v => v).length / 7 * 100), 0) / filteredHabits.length)
    : 0;

  return (
    <div className="habits-view animate-fade-in">
      {/* Top Bar */}
      <div className="habits-topbar">
        <div className="habits-summary">
          <div className="habits-summary-item">
            <span className="habits-summary-val habits-summary-val--green">{totalDone}/{filteredHabits.length}</span>
            <span className="habits-summary-key">Done Today</span>
          </div>
          <div className="habits-summary-divider" />
          <div className="habits-summary-item">
            <span className="habits-summary-val habits-summary-val--amber">🔥 {maxStreak}</span>
            <span className="habits-summary-key">Best Streak</span>
          </div>
          <div className="habits-summary-divider" />
          <div className="habits-summary-item">
            <span className="habits-summary-val habits-summary-val--blue">{avgRate}%</span>
            <span className="habits-summary-key">7-Day Rate</span>
          </div>
        </div>
        <button
          className="tasks-add-btn"
          onClick={() => dispatch({ type: 'OPEN_HABIT_MODAL' })}
        >
          + New Habit
        </button>
      </div>

      {/* Today Progress Ring */}
      <div className="habits-today-bar">
        <div className="habits-today-label">
          <span>Today's Progress</span>
          <strong>{totalDone} of {filteredHabits.length} habits complete</strong>
        </div>
        <div className="habits-today-track">
          <div
            className="habits-today-fill"
            style={{ width: filteredHabits.length > 0 ? `${(totalDone / filteredHabits.length) * 100}%` : '0%' }}
          />
          <span className="habits-today-pct">
            {filteredHabits.length > 0 ? Math.round((totalDone / filteredHabits.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="habits-grid">
        {filteredHabits.map((habit, i) => (
          <div key={habit.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-fade-in">
            <HabitCard
              habit={habit}
              onToggle={id => dispatch({ type: 'TOGGLE_HABIT_TODAY', payload: id })}
              onDelete={id => dispatch({ type: 'DELETE_HABIT', payload: id })}
            />
          </div>
        ))}
        {filteredHabits.length === 0 && (
          <div className="habits-empty">
            <span>🌱</span>
            <h3>No habits yet</h3>
            <p>Build positive routines by adding your first habit.</p>
            <button className="tasks-empty__cta"
              onClick={() => dispatch({ type: 'OPEN_HABIT_MODAL' })}>
              + Add Habit
            </button>
          </div>
        )}
      </div>

      {showHabitModal && (
        <HabitModal onClose={() => dispatch({ type: 'CLOSE_HABIT_MODAL' })} />
      )}
    </div>
  );
}
