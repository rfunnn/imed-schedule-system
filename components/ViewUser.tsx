
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Dialog, Input } from './ui/Elements.tsx';
import { ApiLog, Appointment, User } from '../types.ts';
import { apiService } from '../services/apiService.ts';

const ChevronLeftIcon = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;

export default function ViewUser({ addLog, showToast }: { addLog: (log: ApiLog) => void; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const { icNo } = useParams<{ icNo: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: '', psNo: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const result = await apiService.getUser(icNo || '', addLog);
        if (result.ok && result.data && (result.data.success || result.status === 200)) {
          const d = result.data.data || result.data;
          const fetchedUser: User = {
            name: d.Name || d.name || 'Unknown Patient',
            icNo: String(d.IC || d.icNo || icNo),
            psNo: d['PS NO'] || d.psNo || '',
            email: d.Email || d.email || ''
          };
          setUser(fetchedUser);
          setUpdateForm({ name: fetchedUser.name, psNo: fetchedUser.psNo || '', email: fetchedUser.email || '' });
          setAppointments([]); 
        } else {
          // Fallback mock
          const mockUser: User = {
            name: 'Ali Bin Ahmad',
            icNo: icNo || 'Unknown',
            psNo: 'MS-55001',
            email: 'ali.ahmad@email.com'
          };
          setUser(mockUser);
          setUpdateForm({ name: mockUser.name, psNo: mockUser.psNo || '', email: mockUser.email || '' });
          setAppointments([
            { id: '1', name: mockUser.name, icNo: mockUser.icNo, tcaDate: '2023-10-10', scheduleSupplyDate: '2023-10-17', status: 'COMPLETED', is_arrived: true, receivedDate: '2023-10-17' },
            { id: '2', name: mockUser.name, icNo: mockUser.icNo, tcaDate: '2023-11-20', scheduleSupplyDate: '2023-11-27', status: 'PENDING' },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [icNo, addLog]);

  const handleUpdateUser = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Close immediately on submission
      setIsUpdateModalOpen(false);
      
      const result = await apiService.updateUser(user.icNo, updateForm, addLog);
      
      if (result.status >= 200 && result.status < 300) {
        setUser({ ...user, ...updateForm });
        showToast("Success: Profile updated successfully!", "success");
      } else {
        showToast("Failed: Server rejected the update.", "error");
      }
    } catch (err) {
      showToast("Error: API Connection failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string = '') => {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Retrieving patient data...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="flat" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-8 space-y-6 bg-gradient-to-br from-white to-sky-50/30">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
              <p className="text-sm font-mono text-slate-500">{user?.icNo}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge theme="info">Patient ID: {user?.psNo || 'N/A'}</Badge>
              <Badge theme="success">Active Status</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Email</span>
              <span className="text-slate-700 font-semibold">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">PS Number</span>
              <span className="text-slate-700 font-semibold">{user?.psNo || '-'}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => setIsUpdateModalOpen(true)}>
            Update Profile
          </Button>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-white/50">
            <h3 className="text-lg font-bold text-slate-800">Appointment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">TCA Date</th>
                  <th className="px-6 py-4">Supply Date</th>
                  <th className="px-6 py-4">Received On</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length > 0 ? appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{appt.tcaDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{appt.scheduleSupplyDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{appt.receivedDate || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge theme={appt.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {appt.status}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm italic">No history found for this patient.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog 
        open={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        title="Update Patient Details"
      >
        <div className="space-y-4">
          <Input label="Name" value={updateForm.name} onChange={e => setUpdateForm({...updateForm, name: e.target.value})} />
          <Input label="PS Number" value={updateForm.psNo} onChange={e => setUpdateForm({...updateForm, psNo: e.target.value})} />
          <Input label="Email Address" value={updateForm.email} onChange={e => setUpdateForm({...updateForm, email: e.target.value})} />
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="flat" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleUpdateUser} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
