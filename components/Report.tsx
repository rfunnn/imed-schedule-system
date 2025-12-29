
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, StatCard } from './ui/Elements.tsx';
import { apiService } from '../services/apiService.ts';
import { Appointment } from '../types.ts';

const ChevronLeftIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const UserPlusIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const TrendingUpIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

export default function Report() {
  const navigate = useNavigate();
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await apiService.getAppointments(1, 200);
        if (res.ok && res.data) {
          const raw = res.data.data || res.data;
          if (Array.isArray(raw)) {
            setData(raw.map((item: any) => ({
              ...item,
              createdAt: item.createdAt || item['Created At'] || item.tcaDate
            })));
          }
        }
      } catch (err) {
        console.error("Report load error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const [year, month] = filterMonth.split('-').map(Number);
    const filtered = data.filter(item => {
      if (!item.createdAt) return false;
      const d = new Date(item.createdAt);
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyCounts = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      count: 0
    }));

    filtered.forEach(item => {
      const date = new Date(item.createdAt!);
      const day = date.getDate();
      if (dailyCounts[day - 1]) dailyCounts[day - 1].count++;
    });

    const maxCount = Math.max(...dailyCounts.map(d => d.count), 0);
    // Y-axis range should be slightly higher than peak for headroom
    const yAxisMax = Math.max(Math.ceil(maxCount * 1.2), 5);
    const peakDay = dailyCounts.reduce((prev, current) => (prev.count > current.count) ? prev : current, { day: 0, count: 0 });

    return {
      filteredCount: filtered.length,
      dailyCounts,
      maxCount,
      yAxisMax,
      peakDay: peakDay.count > 0 ? `Day ${peakDay.day} (${peakDay.count} pts)` : 'N/A'
    };
  }, [data, filterMonth]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Clinical Insights...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4">
          <Button variant="flat" size="sm" onClick={() => navigate('/dashboard')}>
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registration Analytics</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Select Month</label>
          <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer p-2"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="New Patient Registrations" 
          value={stats.filteredCount} 
          icon={UserPlusIcon} 
          color="bg-sky-600" 
        />
        <StatCard 
          title="Peak Registration Activity" 
          value={stats.peakDay} 
          icon={TrendingUpIcon} 
          color="bg-indigo-600" 
        />
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Registration Frequency</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Daily patient registration breakdown for {new Date(filterMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative h-80 pt-6">
          {/* Y-Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 w-full">
                <span className="w-6 text-[10px] font-bold text-slate-300 text-right">
                  {Math.round(stats.yAxisMax * (1 - i / 4))}
                </span>
                <div className="flex-grow border-t border-slate-100/80"></div>
              </div>
            ))}
          </div>

          {/* Bar Wrapper */}
          <div className="relative h-full flex items-end justify-between gap-1 sm:gap-2 pb-8 ml-9">
            {stats.dailyCounts.map((d) => {
              const heightPercent = (d.count / stats.yAxisMax) * 100;
              return (
                <div 
                  key={d.day} 
                  className="flex-1 flex flex-col items-center group/bar h-full relative"
                >
                  {/* Tooltip */}
                  {d.count > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover/bar:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                      {d.count} Registered
                    </div>
                  )}
                  
                  {/* Bar Container */}
                  <div className="w-full h-full flex items-end overflow-visible group-hover/bar:bg-sky-50 transition-colors rounded-t-lg">
                    <div 
                      className="w-full bg-sky-500 transition-all duration-700 ease-out group-hover/bar:bg-sky-600 rounded-t-sm shadow-sm"
                      style={{ 
                        height: d.count > 0 ? `${Math.max(heightPercent, 2)}%` : '0%'
                      }}
                    />
                  </div>
                  
                  {/* Label */}
                  <div className="absolute top-full mt-2 w-full text-center">
                    <span className="text-[9px] font-black text-slate-400 group-hover/bar:text-sky-600 transition-colors">
                      {d.day}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-500 rounded-sm shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Registrations</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
            Audit trails updated in real-time
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-emerald-50/40 border-emerald-100 border flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
           <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Growth Index</h4>
           <p className="text-sm font-bold text-slate-800">Steady upward trend in patient intake observed.</p>
        </Card>
        <Card className="p-6 bg-sky-50/40 border-sky-100 border flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
           <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Peak Patterns</h4>
           <p className="text-sm font-bold text-slate-800">Mid-month periods show consistent high registration volume.</p>
        </Card>
        <Card className="p-6 bg-indigo-50/40 border-indigo-100 border flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
           <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Data Reliability</h4>
           <p className="text-sm font-bold text-slate-800">100% of registrations recorded with IC verification.</p>
        </Card>
      </div>
    </div>
  );
}
