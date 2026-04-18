import React from 'react';
import './Dashboard.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';

/* ─── Tiny sub-components ───────────────────────────────────────────── */
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card" style={{ '--card-accent': color }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {sub && <div className="stat-card__sub">{sub}</div>}
      </div>
      <div className="stat-card__glow" />
    </div>
  );
}

function MiniProgress({ label, done, total, color }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mini-progress">
      <div className="mini-progress__top">
        <span className="mini-progress__label">{label}</span>
        <span className="mini-progress__pct">{pct}%</span>
      </div>
      <div className="mini-progress__track">
        <div
          className="mini-progress__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="mini-progress__count">{done}/{total} complete</div>
    </div>
  );
}

function TaskRow({ task, onToggle, onOpen }) {
  const priorityColors = { urgent: '#f43f5e', high: '#f59e0b', medium: '#6c63ff', low: '#10b981' };
  const cat = CATEGORIES.find(c => c.id === task.category);

  return (
    <div className={`task-row ${task.status === 'done' ? 'task-row--done' : ''}`}>
      <button
        className={`task-row__check ${task.status === 'done' ? 'task-row__check--done' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label="Toggle task"
      >
        {task.status === 'done' && '✓'}
      </button>
      <div className="task-row__body" onClick={() => onOpen(task)}>
        <span className="task-row__title">{task.title}</span>
        {task.recurring && (
          <span className="task-row__recurring" title="Recurring">🔄</span>
        )}
        <div className="task-row__meta">
          <span className="task-row__cat" style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
          <span className="task-row__due">{task.dueDate}</span>
        </div>
      </div>
      <div
        className="task-row__priority"
        style={{ background: priorityColors[task.priority] + '22', color: priorityColors[task.priority] }}
      >
        {task.priority}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { tasks, habits, goals } = state;

  // Compute Stats
  const done    = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const active  = tasks.filter(t => ['pending', 'progress'].includes(t.status)).length;
  const habitsDone = habits.filter(h => h.completedToday).length;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const avgGoal   = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  // Priority breakdown
  const byPriority = ['urgent', 'high', 'medium', 'low'].map(p => ({
    p, count: tasks.filter(t => t.priority === p && t.status !== 'done').length,
  }));

  // Category breakdown
  const byCategory = CATEGORIES.map(c => ({
    ...c,
    count: tasks.filter(t => t.category === c.id).length,
    done:  tasks.filter(t => t.category === c.id && t.status === 'done').length,
  })).filter(c => c.count > 0);

  // Upcoming tasks
  const upcoming = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Today's habits
  const todayHabits = habits.slice(0, 4);

  return (
    <div className="dashboard animate-fade-in">
      {/* ── Welcome Banner ────────────────────────────────── */}
      <div className="dash-banner">
        <div className="dash-banner__text">
          <h2 className="dash-banner__title">
            Good {getGreeting()}, <span className="dash-banner__name">Alex 👋</span>
          </h2>
          <p className="dash-banner__sub">
            You have <strong>{active}</strong> active tasks and <strong>{habitsDone}/{habits.length}</strong> habits done today.
            {overdue > 0 && <span className="dash-banner__warn"> {overdue} overdue!</span>}
          </p>
        </div>
        <div className="dash-banner__actions">
          <button className="dash-banner__btn dash-banner__btn--primary"
            onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}>
            + Add Task
          </button>
          <button className="dash-banner__btn dash-banner__btn--secondary"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'habits' })}>
            Track Habit
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────── */}
      <div className="dash-stats">
        <StatCard label="Tasks Done Today"  value={done}      icon="✅" color="#10b981" sub="Great work!" />
        <StatCard label="Active Tasks"       value={active}    icon="⚡" color="#6c63ff" sub={`${tasks.length} total`} />
        <StatCard label="Overdue"            value={overdue}   icon="⚠️" color="#f43f5e" sub={overdue > 0 ? 'Needs attention' : 'All clear!'} />
        <StatCard label="Habits Today"       value={`${habitsDone}/${habits.length}`} icon="🔥" color="#f59e0b" sub={`Best streak: ${maxStreak}d`} />
        <StatCard label="Goal Progress"      value={`${avgGoal}%`} icon="🎯" color="#06b6d4" sub={`${goals.length} active goals`} />
      </div>

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className="dash-grid">
        {/* Left column */}
        <div className="dash-col">
          {/* Upcoming Tasks */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3 className="dash-card__title">Upcoming Tasks</h3>
              <button className="dash-card__link"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'tasks' })}>
                View all →
              </button>
            </div>
            <div className="dash-card__body">
              {upcoming.length === 0 ? (
                <div className="dash-empty">🎉 All caught up!</div>
              ) : upcoming.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={id => dispatch({ type: 'TOGGLE_TASK_STATUS', payload: id })}
                  onOpen={t => dispatch({ type: 'SELECT_TASK', payload: t })}
                />
              ))}
            </div>
          </div>

          {/* Today's Habits */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3 className="dash-card__title">Today's Habits</h3>
              <button className="dash-card__link"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'habits' })}>
                View all →
              </button>
            </div>
            <div className="dash-card__body">
              {todayHabits.map(habit => (
                <div key={habit.id} className="habit-row">
                  <span className="habit-row__icon">{habit.icon}</span>
                  <div className="habit-row__info">
                    <span className="habit-row__title">{habit.title}</span>
                    <div className="habit-row__dots">
                      {habit.history.slice(0, 7).reverse().map((v, i) => (
                        <div
                          key={i}
                          className={`habit-row__dot ${v ? 'habit-row__dot--done' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="habit-row__right">
                    <span className="habit-row__streak">🔥 {habit.streak}</span>
                    <button
                      className={`habit-row__check-btn ${habit.completedToday ? 'habit-row__check-btn--done' : ''}`}
                      onClick={() => dispatch({ type: 'TOGGLE_HABIT_TODAY', payload: habit.id })}
                    >
                      {habit.completedToday ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dash-col">
          {/* Goal Progress */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3 className="dash-card__title">Goal Progress</h3>
              <button className="dash-card__link"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'goals' })}>
                View all →
              </button>
            </div>
            <div className="dash-card__body">
              {goals.slice(0, 3).map(goal => {
                const cat = CATEGORIES.find(c => c.id === goal.category);
                return (
                  <MiniProgress
                    key={goal.id}
                    label={goal.title}
                    done={goal.progress}
                    total={100}
                    color={cat?.color || '#6c63ff'}
                  />
                );
              })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3 className="dash-card__title">Task Priority</h3>
            </div>
            <div className="dash-card__body">
              {byPriority.map(({ p, count }) => {
                const colors = { urgent: '#f43f5e', high: '#f59e0b', medium: '#6c63ff', low: '#10b981' };
                const pct = tasks.filter(t => t.priority === p).length;
                const totalP = tasks.length;
                return (
                  <div key={p} className="priority-bar">
                    <span className="priority-bar__label"
                      style={{ color: colors[p] }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                    <div className="priority-bar__track">
                      <div
                        className="priority-bar__fill"
                        style={{
                          width: totalP > 0 ? `${(pct / totalP) * 100}%` : '0%',
                          background: colors[p],
                        }}
                      />
                    </div>
                    <span className="priority-bar__count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="dash-card">
            <div className="dash-card__header">
              <h3 className="dash-card__title">By Category</h3>
            </div>
            <div className="dash-cat-grid">
              {byCategory.map(c => (
                <div key={c.id} className="dash-cat-chip" style={{ '--chip-color': c.color }}>
                  <span className="dash-cat-chip__icon">{c.icon}</span>
                  <span className="dash-cat-chip__label">{c.label}</span>
                  <span className="dash-cat-chip__count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
