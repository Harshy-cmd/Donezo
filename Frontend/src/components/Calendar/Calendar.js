import React, { useState } from 'react';
import './Calendar.css';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/initialData';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PRIORITY_COLORS = { urgent: '#f43f5e', high: '#f59e0b', medium: '#6c63ff', low: '#10b981' };

export default function Calendar() {
  const { state, dispatch } = useApp();
  const { tasks } = state;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedTasks = tasks.filter(t => t.dueDate === selectedDate);

  const getDateStr = (d) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const getTasksForDay = (d) => {
    const ds = getDateStr(d);
    return tasks.filter(t => t.dueDate === ds);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="calendar-view animate-fade-in">
      <div className="calendar-layout">
        {/* Calendar grid */}
        <div className="calendar-main">
          {/* Month header */}
          <div className="cal-header">
            <div className="cal-header__left">
              <h2 className="cal-month">{MONTHS[month]} {year}</h2>
              <button className="cal-today-btn" onClick={goToday}>Today</button>
            </div>
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>
          </div>

          {/* Days row */}
          <div className="cal-days-row">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="cal-grid">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="cal-cell cal-cell--empty" />;
              const ds = getDateStr(day);
              const dayTasks = getTasksForDay(day);
              const isToday    = ds === todayStr;
              const isSelected = ds === selectedDate;
              const hasOverdue = dayTasks.some(t => t.status === 'overdue');

              return (
                <div
                  key={ds}
                  className={`cal-cell
                    ${isToday    ? 'cal-cell--today'    : ''}
                    ${isSelected ? 'cal-cell--selected' : ''}
                    ${hasOverdue ? 'cal-cell--overdue'  : ''}
                  `}
                  onClick={() => setSelectedDate(ds)}
                >
                  <span className="cal-cell__day">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="cal-cell__dots">
                      {dayTasks.slice(0, 3).map(t => (
                        <span
                          key={t.id}
                          className="cal-cell__dot"
                          style={{ background: PRIORITY_COLORS[t.priority] }}
                          title={t.title}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="cal-cell__more">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="cal-sidebar">
          <div className="cal-sidebar__header">
            <h3 className="cal-sidebar__date">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </h3>
            <span className="cal-sidebar__count">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="cal-sidebar__tasks">
            {selectedTasks.length === 0 ? (
              <div className="cal-sidebar__empty">
                <span>✨</span>
                <p>No tasks for this day</p>
                <button
                  className="tasks-add-btn"
                  style={{ fontSize: '0.78rem', padding: '7px 14px' }}
                  onClick={() => dispatch({ type: 'OPEN_TASK_MODAL' })}
                >
                  + Add Task
                </button>
              </div>
            ) : selectedTasks.map(task => {
              const cat = CATEGORIES.find(c => c.id === task.category);
              return (
                <div
                  key={task.id}
                  className="cal-task-item"
                  style={{ '--pri-color': PRIORITY_COLORS[task.priority] }}
                  onClick={() => dispatch({ type: 'SELECT_TASK', payload: task })}
                >
                  <div className="cal-task-item__stripe" />
                  <div className="cal-task-item__body">
                    <span className="cal-task-item__title">{task.title}</span>
                    <div className="cal-task-item__meta">
                      <span style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
                      <span className="cal-task-item__status"
                        style={{ color: task.status === 'done' ? 'var(--accent-green)' :
                                        task.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        {task.status === 'done' ? '✓ Done' : task.status === 'overdue' ? '⚠ Overdue' : task.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`cal-task-item__check ${task.status === 'done' ? 'cal-task-item__check--done' : ''}`}
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_TASK_STATUS', payload: task.id }); }}
                  >
                    {task.status === 'done' ? '✓' : ''}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: 'var(--accent-red)' }} />
              <span>Urgent</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: 'var(--accent-amber)' }} />
              <span>High</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: 'var(--accent-primary)' }} />
              <span>Medium</span>
            </div>
            <div className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: 'var(--accent-green)' }} />
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task modal */}
      {state.showTaskModal && (
        <div>
          {React.createElement(require('../TaskModal/TaskModal').default, {
            task: state.selectedTask,
            onClose: () => dispatch({ type: 'CLOSE_TASK_MODAL' }),
          })}
        </div>
      )}
    </div>
  );
}
