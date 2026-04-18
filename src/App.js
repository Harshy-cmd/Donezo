import React, { Suspense } from 'react';
import './App.css';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar/Sidebar';
import Header  from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Tasks    from './components/Tasks/Tasks';
import Habits   from './components/Habits/Habits';
import Goals    from './components/Goals/Goals';
import Analytics from './components/Analytics/Analytics';
import Calendar  from './components/Calendar/Calendar';
import TaskModal from './components/TaskModal/TaskModal';
import Login     from './components/Login/Login';

function AppShell() {
  const { state, dispatch } = useApp();
  const { activeView, sidebarOpen, showTaskModal, selectedTask } = state;

  const views = {
    dashboard: <Dashboard />,
    tasks:     <Tasks />,
    habits:    <Habits />,
    goals:     <Goals />,
    analytics: <Analytics />,
    calendar:  <Calendar />,
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--sidebar-open' : 'app-shell--sidebar-collapsed'}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Suspense fallback={<div className="app-loading">Loading…</div>}>
            {views[activeView] || <Dashboard />}
          </Suspense>
        </main>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => dispatch({ type: 'CLOSE_TASK_MODAL' })} 
        />
      )}
    </div>
  );
}

function Root() {
  const { state } = useApp();
  
  if (!state.isAuthenticated) {
    return <Login />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
