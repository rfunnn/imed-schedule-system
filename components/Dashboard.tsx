
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, StatCard, Dialog, Input } from './ui/Elements.tsx';
import { ApiLog, Appointment } from '../types.ts';
import { apiService } from '../services/apiService.ts';

// Icons
const CalendarIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WarningIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const initialAppointments: Appointment[] = [
  { id: '1', name: 'Ali Bin Ahmad', icNo: '950212015431', tcaDate: '2023-11-20', scheduleSupplyDate: '2023-11-27', psNo: 'MS-55001', status: 'PENDING' },
  { id: '2', name: 'Siti Nurhaliza', icNo: '880504105222', tcaDate: '2023-11-21', scheduleSupplyDate: '2023-11-28', psNo: 'MS-55002', status: 'COMPLETED' },
  { id: '3', name: 'John Doe', icNo: '900101149999', tcaDate: '2023-11-22', scheduleSupplyDate: '2023-11-29', psNo: 'MS-55003', status: 'PENDING' },
  { id: '4', name: 'Lina Tan', icNo: '921230055110', tcaDate: '2023-11-23', scheduleSupplyDate: '2023-11-30', psNo: 'MS-55004', status: 'PENDING' },
  { id: '5', name: 'Kumar Raj', icNo: '850707106331', tcaDate: '2023-11-24', scheduleSupplyDate: '2023-12-01', psNo: 'MS-55005', status: 'COMPLETED' },
];

export default function Dashboard({ addLog }: { addLog: (log: ApiLog) => void }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [malaysiaTime, setMalaysiaTime] = useState('');
  const [malaysiaDate, setMalaysiaDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
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

  const handleCreateAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fixed: Property 'createUser' does not exist on apiService, used 'createNewUser' instead.
      const result = await apiService.createNewUser(form, addLog);
      
      if (result.ok) {
        const newAppt: Appointment = {
          id: Math.random().toString(36).substring(7),
          name: form.name,
          icNo: form.icNo,
          psNo: form.psNo,
          tcaDate: form.tcaDate || new Date().toISOString().split('T')[0],
          scheduleSupplyDate: form.scheduleSupplyDate || new Date().toISOString().split('T')[0],
          status: 'PENDING'
        };
        setAppointments([newAppt, ...appointments]);
        setIsAddModalOpen(false);
        setForm({ name: '', icNo: '', psNo: '', tcaDate: '', scheduleSupplyDate: '' });
      } else {
        setError(typeof result.data === 'string' ? result.data : JSON.stringify(result.data));
      }
    } catch (err) {
      setError("Network error occurred. Check logs for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Name', 'IC No', 'TCA Date', 'Supply Date', 'PS No', 'Status'];
    const rows = appointments.map(a => [a.name, a.icNo, a.tcaDate, a.scheduleSupplyDate, a.psNo || '-', a.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "appointments_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            iM
          </div>
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

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value="142" icon={CalendarIcon} color="bg-sky-500" delta="+12%" />
        <StatCard title="Total Completed" value="98" icon={CheckIcon} color="bg-emerald-500" delta="+20%" />
        <StatCard title="No-shows" value="6" icon={WarningIcon} color="bg-amber-500" delta="-8%" />
        <StatCard title="Total Users" value="1,204" icon={UserIcon} color="bg-indigo-500" delta="+4%" />
      </section>

      {/* Main Table Card */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
            <p className="text-xs text-slate-500">Overview of upcoming pharmacy collections</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCsv}>Export CSV</Button>
            <Button variant="gradient" size="sm" onClick={() => setIsAddModalOpen(true)}>+ Add Appointment</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">IC Number</th>
                <th className="px-6 py-4">TCA Date</th>
                <th className="px-6 py-4">Supply Date</th>
                <th className="px-6 py-4">PS Number</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <tr 
                  key={appt.id} 
                  className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/view-user/${appt.icNo}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600">
                        {appt.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-slate-700">{appt.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{appt.icNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{appt.tcaDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{appt.scheduleSupplyDate}</td>
                  <td className="px-6 py-4 font-medium text-slate-500">{appt.psNo || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge theme={appt.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {appt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Appointment Modal */}
      <Dialog 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Create New Appointment"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 text-sm font-bold ${addTab === 'existing' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`}
              onClick={() => setAddTab('existing')}
            >
              Existing User
            </button>
            <button 
              className={`px-4 py-2 text-sm font-bold ${addTab === 'new' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400'}`}
              onClick={() => setAddTab('new')}
            >
              New User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addTab === 'new' && (
              <Input 
                label="Full Name" 
                placeholder="Patient's Full Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
              />
            )}
            <Input 
              label="IC Number" 
              placeholder="e.g. 950101101234" 
              value={form.icNo} 
              onChange={e => setForm({...form, icNo: e.target.value})}
            />
            <Input 
              label="PS Number" 
              placeholder="e.g. MS-12345" 
              value={form.psNo} 
              onChange={e => setForm({...form, psNo: e.target.value})}
            />
            <Input 
              label="TCA Date" 
              type="date" 
              value={form.tcaDate} 
              onChange={e => setForm({...form, tcaDate: e.target.value})}
            />
            <Input 
              label="Supply Date" 
              type="date" 
              value={form.scheduleSupplyDate} 
              onChange={e => setForm({...form, scheduleSupplyDate: e.target.value})}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-medium">
              Error: {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="flat" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              variant="gradient" 
              onClick={handleCreateAppointment}
              disabled={loading || !form.icNo}
            >
              {loading ? 'Processing...' : (addTab === 'new' ? 'Create User' : 'Add Appointment')}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
