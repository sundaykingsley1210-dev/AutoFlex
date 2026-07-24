import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaDownload, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';
import PaymentModal from '../../components/common/PaymentModal';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [nextPayment, setNextPayment] = useState(null);

  useEffect(() => {
    api.get('/payments/my').then(res => setPayments(res.data.payments || [])).catch(() => {}).finally(() => setLoading(false));
    api.get('/dashboard').then(res => {
      if (res.data.nextPayment) setNextPayment(res.data.nextPayment);
    }).catch(() => {});
    api.get('/applications/my').then(res => {
      const apps = res.data.applications || [];
      const active = apps.find(a => a.status === 'active' || a.status === 'approved');
      if (active) setApplicationId(active._id);
    }).catch(() => {});
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalPaid = payments.filter(p => p.status === 'successful').reduce((a, p) => a + p.amount, 0);

  if (loading) return <div className="py-8 flex items-center justify-center"><Loading /></div>;

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Payment History</h1>
          {applicationId && nextPayment && (
            <button
              onClick={() => setShowPayment(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus /> Make a Payment
            </button>
          )}
        </div>

        {applicationId && nextPayment && (
          <div className="bg-gradient-to-r from-accent-600/20 to-primary-600/20 border border-accent-500/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-600/20 flex items-center justify-center text-accent-400"><FaCalendarAlt /></div>
              <div>
                <p className="text-sm text-secondary-400">Next Payment Due</p>
                <p className="font-bold">{formatPrice(nextPayment.amount)} <span className="text-sm font-normal text-secondary-400">• #{nextPayment.paymentNumber}</span></p>
              </div>
            </div>
            <button onClick={() => setShowPayment(true)} className="btn-primary px-6 py-2 text-sm flex items-center gap-2">
              <FaCreditCard /> Pay Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Paid</p><p className="text-2xl font-bold text-accent-400">{formatPrice(totalPaid)}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Transactions</p><p className="text-2xl font-bold">{payments.length}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Successful</p><p className="text-2xl font-bold text-primary-400">{payments.filter(p => p.status === 'successful').length}</p></div>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'successful', 'pending', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className="card overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-secondary-700 bg-secondary-800/50"><th className="text-left px-6 py-4 text-sm text-secondary-400">Date</th><th className="text-left px-6 py-4 text-sm text-secondary-400">Type</th><th className="text-left px-6 py-4 text-sm text-secondary-400">Reference</th><th className="text-right px-6 py-4 text-sm text-secondary-400">Amount</th><th className="text-right px-6 py-4 text-sm text-secondary-400">Status</th></tr></thead>
                <tbody>{filtered.map((p, i) => (
                  <tr key={i} className="border-b border-secondary-700/50 hover:bg-secondary-800/30 transition">
                    <td className="px-6 py-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm capitalize">{p.type}</td>
                    <td className="px-6 py-4 text-sm text-secondary-400 font-mono text-xs">{p.transactionRef}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatPrice(p.amount)}</td>
                    <td className="px-6 py-4 text-right"><span className={`badge ${p.status === 'successful' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="text-center py-12"><FaCreditCard className="text-5xl text-secondary-600 mx-auto mb-4" /><p className="text-secondary-400">No payments found</p></div>}
        </div>
      </div>

      {applicationId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          applicationId={applicationId}
          amount={nextPayment?.amount || 0}
          type="installment"
          description={`Installment #${nextPayment?.paymentNumber || ''} Payment`}
          onPaymentSuccess={() => {
            api.get('/payments/my').then(res => setPayments(res.data.payments || [])).catch(() => {});
            api.get('/dashboard').then(res => {
              if (res.data.nextPayment) setNextPayment(res.data.nextPayment);
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
};
export default Payments;
