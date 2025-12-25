
import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard.tsx';
import ViewUser from './components/ViewUser.tsx';
import LogPanel from './components/LogPanel.tsx';
import { ApiLog } from './types.ts';

function App() {
  const [logs, setLogs] = useState<ApiLog[]>([]);

  const addLog = useCallback((log: ApiLog) => {
    setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen relative">
        <main className="flex-grow pb-24">
          <Routes>
            <Route path="/dashboard" element={<Dashboard addLog={addLog} />} />
            <Route path="/view-user/:icNo" element={<ViewUser addLog={addLog} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        
        {/* Sticky Log Panel for debugging */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <LogPanel logs={logs} />
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
