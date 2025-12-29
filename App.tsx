
import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard.tsx';
import ViewUser from './components/ViewUser.tsx';
import Report from './components/Report.tsx';
import { Toast } from './components/ui/Elements.tsx';

function App() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen relative bg-slate-50">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        <main className="flex-grow">
          <Routes>
            <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
            <Route path="/view-user/:icNo" element={<ViewUser showToast={showToast} />} />
            <Route path="/report" element={<Report />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
