import React from 'react';
import './Analytics.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRIORITIES } from '../../data/initialData';

/* ─── Mini bar chart ────────────────────────────────────────────────── */
function BarChart({ data, maxVal, color }) {
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-chart__col">
          <div
            className="bar-chart__bar"
            style={{
              height: maxVal > 0 ? `${(d.val / maxVal) * 100}%` : '0%',
              background: color || 'var(--accent-primary)',
            }}
          />
          <span className="bar-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut / circle ────────────────────────────────────────────────── */
function CircleProgress({ pct, color, size = 100, label }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <div className="circle-prog" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color || 'var(--accent-primary)'}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${color || 'var(--accent-primary)'})` }}
        />
      </svg>
      <div className="circle-prog__inner">
        <span className="circle-prog__pct" style={{ color }}>{pct}%</span>
        <span className="circle-prog__label">{label}</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { state } = useApp();
  const { tasks, habits, goals } = state;

  /* ── Task stats ─────── */
  const totalTasks  = tasks.length;
  const doneTasks   = tasks.filter(t => t.status === 'done').length;
  const overdue     = tasks.filter(t => t.status === 'overdue').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /* ── Task by category ─ */
  const tasksByCat = CATEGORIES.map(c => ({
    label: c.icon,
    val: tasks.filter(t => t.category === c.id).length,
    color: c.color,
    name: c.label,
    done: tasks.filter(t => t.category === c.id && t.status === 'done').length,
  })).filter(c => c.val > 0);

  /* ── Task by priority ─ */
  const tasksByPriority = PRIORITIES.map(p => ({
    label: p.label.slice(0, 3),
    val: tasks.filter(t => t.priority === p.id).length,
    color: p.color,
  }));

  /* ── Habit stats ──── */
  const habitRate = habits.length
    ? Math.round(habits.reduce((s, h) => s + h.history.slice(0, 7).filter(v => v).length, 0)
      / (habits.length * 7) * 100)
    : 0;

  /* ── 7-day habit history (aggregated) ── */
  const days7 = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const habitHistory7 = days7.map((d, i) => ({
    label: d,
    val: habits.reduce((s, h) => s + (h.history[6 - i] || 0), 0),
  }));
  const maxHabitDay = Math.max(...habitHistory7.map(d => d.val), 1);

  /* ── Goal distribution ── */
  const avgGoalProgress = goals.length
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;

  const maxPriority = Math.max(...tasksByPriority.map(p => p.val), 1);

  return (
    <div className="analytics-view animate-fade-in">
      {/* KPI row */}
      <div className="analytics-kpi-row">
        <div className="analytics-kpi">
          <CircleProgress pct={completionRate} color="var(--accent-green)" size={90} label="Done" />
          <div className="analytics-kpi__text">
            <h4>Task Completion</h4>
            <p>{doneTasks} of {totalTasks} tasks completed</p>
          </div>
        </div>
        <div className="analytics-kpi analytics-kpi--divider" />
        <div className="analytics-kpi">
          <CircleProgress pct={habitRate} color="var(--accent-amber)" size={90} label="Habits" />
          <div className="analytics-kpi__text">
            <h4>Habit Adherence (7d)</h4>
            <p>{habitRate}% of daily habits completed</p>
          </div>
        </div>
        <div className="analytics-kpi analytics-kpi--divider" />
        <div className="analytics-kpi">
          <CircleProgress pct={avgGoalProgress} color="var(--accent-teal)" size={90} label="Goals" />
          <div className="analytics-kpi__text">
            <h4>Avg Goal Progress</h4>
            <p>{goals.length} active goals tracked</p>
          </div>
        </div>
        <div className="analytics-kpi analytics-kpi--divider" />
        <div className="analytics-kpi">
          <CircleProgress pct={overdue > 0 ? Math.min(100, Math.round(overdue / totalTasks * 100)) : 0} color="var(--accent-red)" size={90} label="Overdue" />
          <div className="analytics-kpi__text">
            <h4>Overdue Rate</h4>
            <p>{overdue} overdue task{overdue !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="analytics-grid">
        {/* Habit trends */}
        <div className="analytics-card">
          <div className="analytics-card__title">Habit Completions (Last 7 Days)</div>
          <div className="analytics-chart-wrap">
            <BarChart data={habitHistory7} maxVal={maxHabitDay} color="var(--accent-amber)" />
          </div>
        </div>

        {/* Tasks by priority */}
        <div className="analytics-card">
          <div className="analytics-card__title">Tasks by Priority</div>
          <div className="analytics-chart-wrap">
            <BarChart data={tasksByPriority} maxVal={maxPriority} />
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="analytics-card analytics-card--wide">
        <div className="analytics-card__title">Tasks by Category</div>
        <div className="analytics-cat-list">
          {tasksByCat.map(c => {
            const catPct = c.val > 0 ? Math.round((c.done / c.val) * 100) : 0;
            return (
              <div key={c.name} className="analytics-cat-row">
                <span className="analytics-cat-icon">{c.label}</span>
                <span className="analytics-cat-name">{c.name}</span>
                <div className="analytics-cat-track">
                  <div
                    className="analytics-cat-fill"
                    style={{ width: `${(c.val / tasks.length) * 100}%`, background: c.color }}
                  />
                </div>
                <span className="analytics-cat-total">{c.val} tasks</span>
                <span className="analytics-cat-rate" style={{ color: c.color }}>{catPct}% done</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals progress table */}
      <div className="analytics-card analytics-card--wide">
        <div className="analytics-card__title">Goals Overview</div>
        <div className="analytics-goals-table">
          {goals.map(g => {
            const cat = CATEGORIES.find(c => c.id === g.category);
            return (
              <div key={g.id} className="analytics-goal-row">
                <span className="analytics-goal-icon">{cat?.icon}</span>
                <div className="analytics-goal-info">
                  <span className="analytics-goal-title">{g.title}</span>
                  <span className="analytics-goal-type">{g.type === 'short' ? '⚡ Short' : '🎯 Long'}</span>
                </div>
                <div className="analytics-goal-bar-wrap">
                  <div className="analytics-goal-bar">
                    <div
                      className="analytics-goal-fill"
                      style={{ width: `${g.progress}%`, background: cat?.color || 'var(--accent-primary)' }}
                    />
                  </div>
                </div>
                <span className="analytics-goal-pct" style={{ color: cat?.color }}>{g.progress}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-insights">
        <div className="analytics-insight analytics-insight--green">
          <span className="analytics-insight-icon">💡</span>
          <div>
            <strong>Great completion rate!</strong>
            <p>You've completed {completionRate}% of your tasks. Keep it up!</p>
          </div>
        </div>
        <div className="analytics-insight analytics-insight--amber">
          <span className="analytics-insight-icon">🔥</span>
          <div>
            <strong>Habit streak momentum</strong>
            <p>Your top streak is {Math.max(...habits.map(h => h.streak), 0)} days. Consistency is key!</p>
          </div>
        </div>
        {overdue > 0 && (
          <div className="analytics-insight analytics-insight--red">
            <span className="analytics-insight-icon">⚠️</span>
            <div>
              <strong>Overdue tasks need attention</strong>
              <p>You have {overdue} overdue task{overdue !== 1 ? 's' : ''}. Consider rescheduling or reprioritizing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
