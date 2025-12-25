
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, StatCard, Dialog, Input } from './ui/Elements.tsx';
import { ApiLog, Appointment, CreateAppointmentNewUserDTO } from '../types.ts';
import { apiService } from '../services/apiService.ts';

const CalendarIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WarningIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

export default function Dashboard({ addLog, showToast }: { addLog: (log: ApiLog) => void; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [malaysiaTime, setMalaysiaTime] = useState('');
  const [malaysiaDate, setMalaysiaDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  // Fetch initial data
  const loadData = async () => {
    setFetching(true);
    try {
      const result = await apiService.getAppointments(addLog);
      if (result.ok && result.data) {
        // Map the API structure to the local Appointment structure
        // Assuming result.data.data is the array of items from Sheets
        const rawData = Array.isArray(result.data.data) ? result.data.data : [];
        const mapped: Appointment[] = rawData.map((item: any) => ({
          id: item.id || Math.random().toString(36).substring(7),
          name: item.Name || item.name || 'Unknown',
          icNo: String(item.IC || item.icNo || ''),
          psNo: item['PS NO'] || item.psNo,
          tcaDate: item.tcaDate || item['TCA Date'] || '',
          scheduleSupplyDate: item.scheduleSupplyDate || item['Supply Date'] || '',
          status: (item.status || 'PENDING') as any
        }));
        setAppointments(mapped);
      } else {
        showToast("Notice: No live data found, using empty list.", "info" as any);
      }
    } catch (err) {
      showToast("Error loading patient records.", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        // Optimistic update
        const newAppt: Appointment = {
          id: Math.random().toString(36).substring(7),
          name: dto.name,
          icNo: dto.icNo,
          psNo: dto.psNo || undefined,
          tcaDate: dto.tcaDate,
          scheduleSupplyDate: dto.scheduleSupplyDate || dto.tcaDate,
          status: 'PENDING'
        };
        setAppointments([newAppt, ...appointments]);
        setForm({ name: '', icNo: '', psNo: '', tcaDate: '', scheduleSupplyDate: '' });
        showToast("Success: User created successfully!", "success");
        
        // Refresh full list to be sure
        loadData();
      } else {
        showToast("Failed: Server rejected the request.", "error");
      }
    } catch (err) {
      showToast("Error: API Connection failed.", "error");
    } finally {
      setLoading(false);
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
        <StatCard title="Today's Appointments" value={fetching ? "..." : String(appointments.length)} icon={CalendarIcon} color="bg-sky-500" delta="+12%" />
        <StatCard title="Total Completed" value={fetching ? "..." : String(appointments.filter(a => a.status === 'COMPLETED').length)} icon={CheckIcon} color="bg-emerald-500" delta="+20%" />
        <StatCard title="No-shows" value="6" icon={WarningIcon} color="bg-amber-500" delta="-8%" />
        <StatCard title="Total Users" value={fetching ? "..." : String(new Set(appointments.map(a => a.icNo)).size)} icon={UserIcon} color="bg-indigo-500" delta="+4%" />
      </section>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={fetching}>
              {fetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="gradient" size="sm" onClick={() => setIsAddModalOpen(true)}>+ Add Appointment</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {fetching ? (
            <div className="flex items-center justify-center h-64">
               <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
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
                  <tr key={appt.id} className="hover:bg-sky-50 transition-colors cursor-pointer" onClick={() => navigate(`/view-user/${appt.icNo}`)}>
                    <td className="px-6 py-4 font-semibold text-slate-700">{appt.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{appt.icNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.tcaDate}</td>
                    <td className="px-6 py-4 text-center"><Badge theme={appt.status === 'COMPLETED' ? 'success' : 'warning'}>{appt.status}</Badge></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Appointment" size="md">
        <div className="space-y-4">
          <div className="flex border-b mb-4">
            <button className={`px-4 py-2 text-sm font-bold ${addTab === 'existing' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`} onClick={() => setAddTab('existing')}>Existing</button>
            <button className={`px-4 py-2 text-sm font-bold ${addTab === 'new' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`} onClick={() => setAddTab('new')}>New User</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addTab === 'new' && <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
            <Input label="IC Number" value={form.icNo} onChange={e => setForm({...form, icNo: e.target.value})} />
            <Input label="PS Number" value={form.psNo} onChange={e => setForm({...form, psNo: e.target.value})} />
            <Input label="TCA Date" type="date" value={form.tcaDate} onChange={e => setForm({...form, tcaDate: e.target.value})} />
            <Input label="Supply Date" type="date" value={form.scheduleSupplyDate} onChange={e => setForm({...form, scheduleSupplyDate: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="flat" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleCreateAppointment} disabled={loading || !form.icNo}>{loading ? 'Saving...' : 'Confirm'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
