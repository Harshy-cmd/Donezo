import React, { useState } from 'react';
import './Header.css';
import { useApp } from '../../context/AppContext';

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  tasks:     'Tasks',
  habits:    'Habit Tracker',
  goals:     'Goals',
  analytics: 'Analytics',
  calendar:  'Calendar',
};

export default function Header() {
  const { state, dispatch } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const unreadCount = state.notifications.filter(n => !n.read).length;
  const completedToday = state.tasks.filter(t => t.status === 'done').length;

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__title-group">
          <h1 className="header__title">{VIEW_TITLES[state.activeView]}</h1>
          <span className="header__date">{today}</span>
        </div>
      </div>

      <div className="header__center">
        <div className="header__search">
          <span className="header__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks, habits, goals…"
            className="header__search-input"
            value={state.taskFilter.search}
            onChange={e => dispatch({ type: 'SET_TASK_FILTER', payload: { search: e.target.value } })}
          />
          {state.taskFilter.search && (
            <button
              className="header__search-clear"
              onClick={() => dispatch({ type: 'SET_TASK_FILTER', payload: { search: '' } })}
            >✕</button>
          )}
        </div>
      </div>

      <div className="header__right">
        {/* Quick stats pill */}
        <div className="header__pill">
          <span className="header__pill-dot header__pill-dot--green" />
          <span>{completedToday} done today</span>
        </div>

        {/* Notification Bell */}
        <div className="header__notif-wrap">
          <button
            className={`header__icon-btn ${unreadCount > 0 ? 'header__icon-btn--active' : ''}`}
            onClick={() => setShowNotifs(v => !v)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="header__badge">{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="header__notif-panel" onClick={e => e.stopPropagation()}>
              <div className="header__notif-header">
                <span>Notifications</span>
                <button
                  className="header__notif-clear"
                  onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                >Clear all</button>
              </div>
              {state.notifications.length === 0 ? (
                <div className="header__notif-empty">
                  <span>🎉</span>
                  <span>All caught up!</span>
                </div>
              ) : (
                state.notifications.slice(0, 8).map(n => (
                  <div
                    key={n.id}
                    className={`header__notif-item ${!n.read ? 'header__notif-item--unread' : ''}`}
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                  >
                    <span className="header__notif-icon">{n.icon || '📌'}</span>
                    <div>
                      <div className="header__notif-title">{n.title}</div>
                      <div className="header__notif-time">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Task CTA */}
        <button
          className="header__cta"
          onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}
        >
          <span>+</span>
          <span>New Task</span>
        </button>

        {/* Avatar */}
        <div className="header__avatar" title="Profile">
          <span>AK</span>
        </div>
      </div>

      {/* Overlay to close notifications */}
      {showNotifs && (
        <div className="header__overlay" onClick={() => setShowNotifs(false)} />
      )}
    </header>
  );
}
