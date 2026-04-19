import React from 'react';
import './Sidebar.css';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '◉' },
  { id: 'tasks',      label: 'Tasks',       icon: '✓' },
  { id: 'habits',     label: 'Habits',      icon: '🔥' },
  { id: 'goals',      label: 'Goals',       icon: '🎯' },
  { id: 'analytics',  label: 'Analytics',   icon: '📊' },
  { id: 'calendar',   label: 'Calendar',    icon: '📅' },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { activeView, sidebarOpen, tasks, habits } = state;

  const pendingCount  = tasks.filter(t => t.status === 'pending' || t.status === 'progress').length;
  const overdueCount  = tasks.filter(t => t.status === 'overdue').length;
  const habitsDone    = habits.filter(h => h.completedToday).length;

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <span>DZ</span>
        </div>
        {sidebarOpen && (
          <div className="sidebar__logo-text">
            <span className="sidebar__brand">Donezo</span>
            <span className="sidebar__tagline">Get it done</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {sidebarOpen && (
        <div className="sidebar__stats">
          <div className="sidebar__stat">
            <span className="sidebar__stat-num sidebar__stat-num--blue">{pendingCount}</span>
            <span className="sidebar__stat-label">Active</span>
          </div>
          <div className="sidebar__stat-divider" />
          <div className="sidebar__stat">
            <span className="sidebar__stat-num sidebar__stat-num--red">{overdueCount}</span>
            <span className="sidebar__stat-label">Overdue</span>
          </div>
          <div className="sidebar__stat-divider" />
          <div className="sidebar__stat">
            <span className="sidebar__stat-num sidebar__stat-num--green">{habitsDone}/{habits.length}</span>
            <span className="sidebar__stat-label">Habits</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        {sidebarOpen && <span className="sidebar__nav-label">MENU</span>}
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {sidebarOpen && <span className="sidebar__nav-text">{item.label}</span>}
            {sidebarOpen && item.id === 'tasks' && overdueCount > 0 && (
              <span className="sidebar__badge sidebar__badge--red">{overdueCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar__bottom">
        {sidebarOpen && (
          <div className="sidebar__streak">
            <span className="sidebar__streak-icon">🔥</span>
            <div>
              <div className="sidebar__streak-text">12-day streak!</div>
              <div className="sidebar__streak-sub">Keep it up 💪</div>
            </div>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );
}
