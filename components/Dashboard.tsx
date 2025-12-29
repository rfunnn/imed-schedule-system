
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, StatCard, Dialog, Input, SearchableSelect } from './ui/Elements.tsx';
import { Appointment, CreateAppointmentNewUserDTO } from '../types.ts';
import { apiService } from '../services/apiService.ts';

const CalendarIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WarningIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ChartIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const PAGE_SIZE = 20;

export default function Dashboard({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [malaysiaTime, setMalaysiaTime] = useState('');
  const [malaysiaDate, setMalaysiaDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Lookup state
  const [searchOptions, setSearchOptions] = useState<Array<{ label: string; value: any }>>([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    icNo: '',
    psNo: '',
    tcaDate: '',
    scheduleSupplyDate: ''
  });

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

  const loadData = useCallback(async (page: number) => {
    setFetching(true);
    try {
      const result = await apiService.getAppointments(page, PAGE_SIZE);
      if (result.ok && result.data) {
        const pagination = result.data.pagination;
        const rawData = result.data.data || [];
        
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalRecords(pagination.total || 0);
        } else if (Array.isArray(result.data)) {
           setTotalRecords(result.data.length);
           setTotalPages(1);
        }

        const mapped: Appointment[] = (Array.isArray(rawData) ? rawData : (Array.isArray(result.data) ? result.data : [])).map((item: any) => ({
          id: item.id || Math.random().toString(36).substring(7),
          name: item.Name || item.name || 'Unknown',
          icNo: String(item.IC || item.icNo || ''),
          psNo: item.psNo || item['PS NO'],
          tcaDate: item.tcaDate || item['TCA Date'] || '',
          scheduleSupplyDate: item.scheduleSupplyDate || item['Supply Date'] || '',
          status: (item.status || 'PENDING') as any,
          createdAt: item.createdAt || item['Created At'] || ''
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast("Error loading patient records.", "error");
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const handleSearchUser = (query: string) => {
    if (query.length < 3) return;
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    
    setSearchingUser(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await apiService.getUser(query);
        if (res.ok && res.data) {
          const d = res.data.data || res.data;
          const icStr = String(d.IC || d.icNo || '');
          const nameStr = String(d.Name || d.name || '');
          const psStr = String(d['PS NO'] || d.psNo || '');
          
          setSearchOptions([{ 
            label: `${icStr} — ${nameStr}`, 
            value: { name: nameStr, icNo: icStr, psNo: psStr } 
          }]);
        } else {
          setSearchOptions([]);
        }
      } catch {
        setSearchOptions([]);
      } finally {
        setSearchingUser(false);
      }
    }, 500);
  };

  const handleCreateAppointment = async () => {
    if (!form.icNo) {
      showToast("Please select or enter a patient IC number.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const rawIc = String(form.icNo).trim();
      let result;

      if (addTab === 'existing') {
        // Update existing record
        result = await apiService.updateUser(rawIc, {
          tcaDate: form.tcaDate,
          scheduleSupplyDate: form.scheduleSupplyDate,
          status: 'PENDING'
        });
      } else {
        // Create new user - MUST prepend single quote (') to preserve leading zeros in spreadsheets
        const dto: CreateAppointmentNewUserDTO = {
          name: String(form.name).trim() || 'New Patient',
          icNo: "'" + rawIc,
          psNo: form.psNo ? String(form.psNo).trim() : null,
          tcaDate: form.tcaDate || new Date().toISOString().split('T')[0],
          scheduleSupplyDate: form.scheduleSupplyDate || form.tcaDate || new Date().toISOString().split('T')[0],
          status: 'PENDING'
        };
        result = await apiService.createNewUser(dto);
      }
      
      // Handle response - result.ok covers 200-299 status range
      if (result && result.ok) {
        setForm({ name: '', icNo: '', psNo: '', tcaDate: '', scheduleSupplyDate: '' });
        showToast(`Success: Patient ${addTab === 'existing' ? 'updated' : 'registered'} successfully!`, "success");
        setIsAddModalOpen(false);
        setCurrentPage(1);
        loadData(1);
      } else {
        const errMsg = result?.data?.message || result?.data || "Server rejected the request.";
        showToast(errMsg, "error");
      }
    } catch (err) {
      console.error('Submission error:', err);
      showToast("API Connection failed. Please check your internet.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4 bg-white/40 p-6 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">iM</div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">iMED Schedule System</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pharmacy Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="md" onClick={() => navigate('/report')} iconLeft={<ChartIcon className="w-4 h-4" />}>
            View Analytics
          </Button>
          <div className="text-right p-4 bg-white/60 rounded-xl border border-white/40 shadow-inner">
            <p className="text-sm font-bold text-slate-400 uppercase">{malaysiaDate}</p>
            <p className="text-3xl font-black text-slate-900 font-mono">{malaysiaTime}</p>
            <p className="text-[10px] font-black text-sky-600 tracking-widest uppercase mt-1">Malaysia (GMT+8)</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={fetching ? "..." : String(totalRecords)} icon={UserIcon} color="bg-indigo-600" />
        <StatCard title="Pending Review" value={fetching ? "..." : String(appointments.filter(a => a.status === 'PENDING').length)} icon={WarningIcon} color="bg-amber-500" />
        <StatCard title="Today's Supply" value={fetching ? "..." : String(appointments.filter(a => a.tcaDate === new Date().toISOString().split('T')[0]).length)} icon={CalendarIcon} color="bg-sky-500" />
        <StatCard title="Task Completed" value={fetching ? "..." : String(appointments.filter(a => a.status === 'COMPLETED').length)} icon={CheckIcon} color="bg-emerald-600" />
      </section>

      <Card className="overflow-hidden border-none shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Master Patient Index</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Showing page {currentPage} of {totalPages}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" size="md" onClick={() => loadData(currentPage)} disabled={fetching}>Refresh</Button>
            <Button variant="gradient" size="md" onClick={() => setIsAddModalOpen(true)}>+ New Appointment</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {fetching && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-6">
               <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Medical Database...</p>
            </div>
          ) : (
            <div className="p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">IC Number</th>
                    <th className="px-6 py-4">Review Date (TCA)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length > 0 ? appointments.map((appt) => (
                    <tr key={appt.id} className="group hover:bg-sky-50/40 transition-all cursor-pointer" onClick={() => navigate(`/view-user/${appt.icNo}`)}>
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-800 uppercase tracking-tight">{appt.name}</div>
                        {appt.psNo && <div className="text-[10px] text-slate-400 font-mono">ID: {appt.psNo}</div>}
                      </td>
                      <td className="px-6 py-5 font-mono text-xs text-slate-600">{appt.icNo}</td>
                      <td className="px-6 py-5 text-sm text-slate-600 font-bold">{appt.tcaDate || 'N/A'}</td>
                      <td className="px-6 py-5 text-center">
                        <Badge theme={appt.status === 'COMPLETED' ? 'success' : 'warning'}>{appt.status}</Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-medium">No records found on this page.</td></tr>
                  )}
                </tbody>
              </table>

              <div className="mt-8 px-6 py-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Patient Service Enrollment" size="md">
        <div className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${addTab === 'existing' ? 'bg-white text-sky-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`} 
              onClick={() => { setAddTab('existing'); setForm({ ...form, icNo: '', name: '' }); setSearchOptions([]); }}
            >
              Existing Record
            </button>
            <button 
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${addTab === 'new' ? 'bg-white text-sky-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`} 
              onClick={() => { setAddTab('new'); setForm({ ...form, icNo: '', name: '' }); }}
            >
              New Registration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addTab === 'existing' ? (
              <div className="col-span-2">
                <SearchableSelect 
                  label="Lookup Patient (IC)"
                  loading={searchingUser}
                  options={searchOptions}
                  onSearch={handleSearchUser}
                  onChange={(val) => setForm({ 
                    ...form, 
                    icNo: String(val.icNo), 
                    name: String(val.name), 
                    psNo: val.psNo ? String(val.psNo) : '' 
                  })}
                />
              </div>
            ) : (
              <>
                <Input label="Full Patient Name" placeholder="e.g. MOHD AZRI BIN ALI" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Input label="NRIC Number" placeholder="e.g. 900101011234" value={form.icNo} onChange={e => setForm({...form, icNo: e.target.value})} />
              </>
            )}
            <Input label="PS Number" placeholder="e.g. KL-DRIFT123" value={form.psNo} onChange={e => setForm({...form, psNo: e.target.value})} />
            <Input label="Review Date (TCA)" type="date" value={form.tcaDate} onChange={e => setForm({...form, tcaDate: e.target.value})} />
            <div className="col-span-2">
              <Input label="Medication Supply Date" type="date" value={form.scheduleSupplyDate} onChange={e => setForm({...form, scheduleSupplyDate: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="flat" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              variant="gradient" 
              onClick={handleCreateAppointment} 
              disabled={loading || !form.icNo}
            >
              {loading ? 'Processing...' : (addTab === 'existing' ? 'Update' : 'Register')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
