import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchApps = () => { api.get('/admin/applications').then(res => setApplications(res.data.applications || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetchApps(); }, []);

  const reviewApp = async (id, status) => {
    try { await api.put(`/applications/${id}/review`, { status, rejectionReason: status === 'rejected' ? 'Does not meet criteria' : '' }); toast.success(`Application ${status}`); setSelected(null); fetchApps(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);
  const statusColors = { pending: 'badge-warning', under_review: 'badge-info', approved: 'badge-success', rejected: 'badge-danger', active: 'badge-success', completed: 'badge-info' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Review Applications</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'under_review', 'approved', 'rejected', 'active'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}`}>{f === 'all' ? 'All' : f.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700 bg-secondary-800/50">
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Customer</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Amount</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Status</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(app => (
                <tr key={app._id} className="border-b border-secondary-700/50 hover:bg-secondary-800/30">
                  <td className="px-6 py-4 text-sm">{app.user?.firstName} {app.user?.lastName}</td>
                  <td className="px-6 py-4 text-sm">{app.vehicle?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">{formatPrice(app.totalAmount)}</td>
                  <td className="px-6 py-4"><span className={`badge ${statusColors[app.status]}`}>{app.status?.replace('_', ' ')}</span></td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => setSelected(app)} className="w-8 h-8 rounded-lg bg-secondary-600/20 flex items-center justify-center text-secondary-400 hover:bg-secondary-600 hover:text-white transition"><FaEye /></button>
                    {app.status === 'pending' && <>
                      <button onClick={() => reviewApp(app._id, 'approved')} className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 hover:bg-green-600 hover:text-white transition"><FaCheck /></button>
                      <button onClick={() => reviewApp(app._id, 'rejected')} className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition"><FaTimes /></button>
                    </>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="card p-6 max-w-lg w-full animate-fade-in" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Application Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-secondary-400">Customer</span><span>{selected.user?.firstName} {selected.user?.lastName}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Email</span><span>{selected.user?.email}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Vehicle</span><span>{selected.vehicle?.name}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Total Amount</span><span>{formatPrice(selected.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Deposit</span><span>{formatPrice(selected.depositAmount)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Monthly</span><span>{formatPrice(selected.monthlyPayment)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Duration</span><span>{selected.installmentMonths} months</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Status</span><span className={`badge ${statusColors[selected.status]}`}>{selected.status}</span></div>
              </div>
              {selected.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => reviewApp(selected._id, 'approved')} className="btn-primary flex-1 flex items-center justify-center gap-2"><FaCheck /> Approve</button>
                  <button onClick={() => reviewApp(selected._id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition flex-1 flex items-center justify-center gap-2"><FaTimes /> Reject</button>
                </div>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-3">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminApplications;
