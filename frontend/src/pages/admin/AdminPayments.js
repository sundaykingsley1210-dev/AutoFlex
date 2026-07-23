import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/admin/payments').then(res => setPayments(res.data.payments || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalRevenue = payments.filter(p => p.status === 'successful').reduce((a, p) => a + p.amount, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Revenue</p><p className="text-2xl font-bold text-accent-400">{formatPrice(totalRevenue)}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Transactions</p><p className="text-2xl font-bold">{payments.length}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Successful</p><p className="text-2xl font-bold text-green-400">{payments.filter(p => p.status === 'successful').length}</p></div>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'successful', 'pending', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700 bg-secondary-800/50">
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Date</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Customer</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Type</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Reference</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Amount</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Status</th>
              </tr></thead>
              <tbody>{filtered.map((p, i) => (
                <tr key={i} className="border-b border-secondary-700/50 hover:bg-secondary-800/30">
                  <td className="px-6 py-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{p.user?.firstName} {p.user?.lastName}</td>
                  <td className="px-6 py-4 text-sm capitalize">{p.type}</td>
                  <td className="px-6 py-4 text-sm text-secondary-400 font-mono text-xs">{p.transactionRef}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatPrice(p.amount)}</td>
                  <td className="px-6 py-4 text-right"><span className={`badge ${p.status === 'successful' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminPayments;
