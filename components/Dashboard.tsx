
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, StatCard, Dialog, Input } from './ui/Elements.tsx';
import { ApiLog, Appointment, CreateAppointmentNewUserDTO } from '../types.ts';
import { apiService } from '../services/apiService.ts';

const CalendarIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WarningIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const PAGE_SIZE = 50;

export default function Dashboard({ addLog, showToast }: { addLog: (log: ApiLog) => void; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [malaysiaTime, setMalaysiaTime] = useState('');
  const [malaysiaDate, setMalaysiaDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [form, setForm] = useState({
    name: '',
    icNo: '',
    psNo: '',
    tcaDate: '',
    scheduleSupplyDate: ''
  });

  // Malaysia Time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setMalaysiaTime(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: false }));
      setMalaysiaDate(now.toLocaleDateString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data (All Users with Pagination)
  const loadData = useCallback(async (page: number) => {
    setFetching(true);
    try {
      const result = await apiService.getAppointments(addLog, page);
      if (result.ok && result.data) {
        // Handle both direct array responses and object-wrapped data
        const rawData = Array.isArray(result.data.data) ? result.data.data : (Array.isArray(result.data) ? result.data : []);
        
        const mapped: Appointment[] = rawData.map((item: any) => ({
          id: item.id || Math.random().toString(36).substring(7),
          name: item.Name || item.name || 'Unknown',
          icNo: String(item.IC || item.icNo || ''),
          psNo: item.psNo || item['PS NO'],
          tcaDate: item.tcaDate || item['TCA Date'] || '',
          scheduleSupplyDate: item.scheduleSupplyDate || item['Supply Date'] || '',
          status: (item.status || 'PENDING') as any
        }));
        setAppointments(mapped);
        
        // If we received exactly PAGE_SIZE items, assume there might be more
        setHasMore(mapped.length === PAGE_SIZE);
      } else {
        showToast("Notice: No live data found.", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast("Error loading patient records.", "error");
    } finally {
      setFetching(false);
    }
  }, [addLog, showToast]);

  useEffect(() => {
    loadData(currentPage);
    // Scroll to top of table or top of page when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, loadData]);

  const handleCreateAppointment = async () => {
    setLoading(true);
    try {
      const cleanIc = form.icNo.trim();
      
      const dto: CreateAppointmentNewUserDTO = {
        name: form.name.trim() || 'New Patient',
        icNo: cleanIc,
        psNo: form.psNo.trim() || null,
        tcaDate: form.tcaDate || new Date().toISOString().split('T')[0],
        scheduleSupplyDate: form.scheduleSupplyDate || form.tcaDate || new Date().toISOString().split('T')[0],
        status: 'PENDING'
      };

      setIsAddModalOpen(false);

      const result = await apiService.createNewUser(dto, addLog);
      
      if (result.status >= 200 && result.status < 300) {
        setForm({ name: '', icNo: '', psNo: '', tcaDate: '', scheduleSupplyDate: '' });
        showToast("Success: User created successfully!", "success");
        // Reset to first page and refresh full list after successful creation
        if (currentPage === 1) {
          loadData(1);
        } else {
          setCurrentPage(1);
        }
      } else {
        showToast("Failed: Server rejected the request.", "error");
      }
    } catch (err) {
      showToast("Error: API Connection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore && !fetching) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !fetching) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (!fetching && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">iM</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">iMED Schedule System</h1>
            <p className="text-sm text-slate-500 font-medium">Pharmacy Appointment Manager</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-600">{malaysiaDate}</p>
          <p className="text-2xl font-black text-slate-900">{malaysiaTime}</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Malaysia Time (GMT+8)</p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Users (Current Page)" value={fetching ? "..." : String(appointments.length)} icon={UserIcon} color="bg-indigo-500" />
        <StatCard title="Today's Appointments" value={fetching ? "..." : String(appointments.filter(a => a.tcaDate === new Date().toISOString().split('T')[0]).length)} icon={CalendarIcon} color="bg-sky-500" />
        <StatCard title="Completed" value={fetching ? "..." : String(appointments.filter(a => a.status === 'COMPLETED').length)} icon={CheckIcon} color="bg-emerald-500" />
        <StatCard title="Pending" value={fetching ? "..." : String(appointments.filter(a => a.status === 'PENDING').length)} icon={WarningIcon} color="bg-amber-500" />
      </section>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Patient Database</h2>
            <p className="text-xs text-slate-500 mt-1">Page {currentPage} - Listing users and their last appointment status.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadData(currentPage)} disabled={fetching}>
              {fetching ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </div>
              ) : 'Refresh Page'}
            </Button>
            <Button variant="gradient" size="sm" onClick={() => setIsAddModalOpen(true)}>+ Add Appointment</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {fetching && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 text-sm font-medium">Fetching users from database...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">IC Number</th>
                    <th className="px-6 py-4">TCA Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length > 0 ? appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-sky-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/view-user/${appt.icNo}`)}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">{appt.name}</div>
                        {appt.psNo && <div className="text-[10px] text-slate-400 font-mono">#{appt.psNo}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{appt.icNo}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{appt.tcaDate || 'N/A'}</td>
                      <td className="px-6 py-4 text-center"><Badge theme={appt.status === 'COMPLETED' ? 'success' : 'warning'}>{appt.status || 'PENDING'}</Badge></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No patients found in this batch.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  Showing {appointments.length} patients on page {currentPage}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 items-center">
                    {/* Page Numbering Buttons */}
                    {currentPage > 1 && (
                      <Button 
                        variant="flat" 
                        size="sm" 
                        className="w-8 h-8 p-0" 
                        onClick={() => handlePageClick(currentPage - 1)}
                        disabled={fetching}
                      >
                        {currentPage - 1}
                      </Button>
                    )}
                    
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      className="w-8 h-8 p-0" 
                      disabled
                    >
                      {currentPage}
                    </Button>
                    
                    {hasMore && (
                      <Button 
                        variant="flat" 
                        size="sm" 
                        className="w-8 h-8 p-0" 
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={fetching}
                      >
                        {currentPage + 1}
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1 || fetching}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      <span className="ml-1 hidden sm:inline">Prev</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage} 
                      disabled={!hasMore || fetching}
                    >
                      <span className="mr-1 hidden sm:inline">Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Appointment" size="md">
        <div className="space-y-4">
          <div className="flex border-b mb-4">
            <button className={`px-4 py-2 text-sm font-bold ${addTab === 'existing' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`} onClick={() => setAddTab('existing')}>Existing Patient</button>
            <button className={`px-4 py-2 text-sm font-bold ${addTab === 'new' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`} onClick={() => setAddTab('new')}>New Enrollment</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addTab === 'new' && <Input label="Full Name" placeholder="e.g. Ahmad Ali" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
            <Input label="IC Number" placeholder="12-digit number" value={form.icNo} onChange={e => setForm({...form, icNo: e.target.value})} />
            <Input label="PS Number" placeholder="MS-XXXXX" value={form.psNo} onChange={e => setForm({...form, psNo: e.target.value})} />
            <Input label="TCA Date" type="date" value={form.tcaDate} onChange={e => setForm({...form, tcaDate: e.target.value})} />
            <Input label="Supply Date" type="date" value={form.scheduleSupplyDate} onChange={e => setForm({...form, scheduleSupplyDate: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="flat" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleCreateAppointment} disabled={loading || !form.icNo}>{loading ? 'Processing...' : 'Save & Register'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
