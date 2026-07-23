import React, { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/schedules').then(res => setSchedules(res.data.schedules || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Payment Schedules</h1>
        {schedules.length > 0 ? (
          <div className="space-y-6">
            {schedules.map(s => (
              <div key={s._id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="font-semibold">{s.user?.firstName} {s.user?.lastName} - {s.vehicle?.name || 'Vehicle'}</h3><p className="text-sm text-secondary-400">Total: {formatPrice(s.totalAmount)} | Paid: {formatPrice(s.totalPaid)} | Remaining: {formatPrice(s.remainingBalance)}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-secondary-700"><th className="text-left py-2 text-secondary-400">#</th><th className="text-left py-2 text-secondary-400">Due Date</th><th className="text-right py-2 text-secondary-400">Due</th><th className="text-right py-2 text-secondary-400">Paid</th><th className="text-center py-2 text-secondary-400">Status</th></tr></thead>
                    <tbody>{s.payments?.map((p, i) => (
                      <tr key={i} className="border-b border-secondary-700/30">
                        <td className="py-2">{p.paymentNumber}</td>
                        <td className="py-2 text-secondary-400">{new Date(p.dueDate).toLocaleDateString()}</td>
                        <td className="py-2 text-right">{formatPrice(p.amountDue)}</td>
                        <td className="py-2 text-right">{formatPrice(p.amountPaid || 0)}</td>
                        <td className="py-2 text-center"><span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'overdue' ? 'badge-danger' : p.status === 'due' ? 'badge-warning' : 'badge-info'}`}>{p.status}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><FaCalendarAlt className="text-6xl text-secondary-600 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">No Schedules</h2><p className="text-secondary-400">Schedules are created when applications are approved</p></div>
        )}
      </div>
    </div>
  );
};
export default AdminSchedules;
