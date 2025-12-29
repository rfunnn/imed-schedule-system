
import React, { useState } from 'react';
// Fixed: Using correct import path with .ts extension and resolved the missing member error
import { ApiLog } from '../types.ts';

export default function LogPanel({ logs }: { logs: ApiLog[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 ${isOpen ? 'h-64' : 'h-10'} bg-slate-900 text-white shadow-2xl flex flex-col`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 h-10 border-b border-slate-700 cursor-pointer hover:bg-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Logs / API Console</span>
          <span className="px-1.5 py-0.5 bg-slate-700 rounded text-[9px] font-mono">{logs.length} events</span>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>

      {/* Log Content */}
      {isOpen && (
        <div className="flex-grow overflow-auto p-3 font-mono text-[10px] space-y-2 bg-slate-950">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600">
              No activity logged yet...
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-1 hover:bg-slate-900 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`font-bold ${log.direction === 'OUTGOING' ? 'text-sky-400' : 'text-emerald-400'}`}>
                    {log.direction}
                  </span>
                  <span className="px-1 bg-slate-800 rounded text-slate-300 font-bold">{log.method}</span>
                  <span className="text-slate-400 truncate max-w-xs">{log.url}</span>
                  {log.status && (
                    <span className={`px-1 rounded font-bold ${log.status >= 400 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {log.status}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-slate-500 whitespace-pre-wrap break-all">
                  {JSON.stringify(log.body, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
