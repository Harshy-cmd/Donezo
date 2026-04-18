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

function AppShell() {
  const { state } = useApp();
  const { activeView, sidebarOpen } = state;

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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
