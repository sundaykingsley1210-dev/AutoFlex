import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaCalendarAlt, FaArrowRight, FaClock, FaCheckCircle, FaReceipt, FaCreditCard, FaCar, FaUniversity, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';
import PaymentModal from '../../components/common/PaymentModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [showVirtualAccount, setShowVirtualAccount] = useState(false);
  const [generatingAccount, setGeneratingAccount] = useState(false);

  const fetchDashboard = () => api.get('/dashboard').then(res => setData(res.data)).catch(() => {});

  useEffect(() => {
    fetchDashboard().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/applications/my').then(appRes => {
      const apps = appRes.data.applications || [];
      const active = apps.find(a => a.status === 'active' || a.status === 'approved');
      if (active) setApplicationId(active._id);
    }).catch(() => {});
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p || 0);

  const generateVirtualAccount = async () => {
    if (!applicationId) { toast.error('Please submit an application first'); return; }
    setGeneratingAccount(true);
    try {
      const res = await api.post('/payments/virtual-account', { applicationId });
      setData(d => ({ ...d, virtualAccount: res.data.data.virtualAccount }));
      setShowVirtualAccount(true);
      toast.success('Bank account details generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate account'); } finally { setGeneratingAccount(false); }
  };

  if (loading) return <div className="py-8 flex items-center justify-center"><Loading /></div>;

  const stats = [
    { icon: <FaMoneyBillWave />, label: 'Total Price', value: formatPrice(data?.vehicle?.price), color: 'text-primary-400', bg: 'bg-primary-600/20' },
    { icon: <FaCheckCircle />, label: 'Amount Paid', value: formatPrice(data?.totalPaid), color: 'text-accent-400', bg: 'bg-accent-600/20' },
    { icon: <FaClock />, label: 'Remaining', value: formatPrice(data?.remainingBalance), color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
    { icon: <FaCalendarAlt />, label: 'Next Payment', value: data?.nextPayment ? formatPrice(data.nextPayment.amount) : 'N/A', color: 'text-purple-400', bg: 'bg-purple-600/20' },
  ];
  const progress = data?.vehicle?.price ? Math.round((data.totalPaid / data.vehicle.price) * 100) : 0;

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-primary-100">Manage your vehicle financing and payments</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} text-xl`}>{s.icon}</div>
                <div><p className="text-xs text-secondary-400">{s.label}</p><p className={`text-lg font-bold ${s.color}`}>{s.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {data?.vehicle && data?.nextPayment && applicationId && (
          <div className="bg-gradient-to-r from-accent-600/20 to-primary-600/20 border border-accent-500/30 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-secondary-400 mb-1">Next Payment Due</p>
                <p className="text-2xl font-bold">{formatPrice(data.nextPayment.amount)}</p>
                <p className="text-sm text-secondary-400">Due {new Date(data.nextPayment.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
              >
                <FaCreditCard /> Pay Now
              </button>
            </div>
          </div>
        )}

        {data?.vehicle && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Payment Progress</h2>
              <span className="text-primary-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-3 mb-3">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-sm text-secondary-400 mb-4">
              <span>{formatPrice(data.totalPaid)} paid</span><span>{formatPrice(data.vehicle.price)} total</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={data.vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-16 h-16 rounded-lg object-cover" />
                <div><p className="font-semibold">{data.vehicle.name}</p><p className="text-sm text-secondary-400">{data.vehicle.year} • {data.vehicle.brand}</p></div>
              </div>
              {applicationId && (
                <Link to={`/dashboard/schedule/${applicationId}`} className="text-primary-400 text-sm flex items-center gap-1 hover:underline">View Schedule <FaArrowRight className="text-xs" /></Link>
              )}
            </div>
          </div>
        )}

        {!data?.vehicle && (
          <div className="card p-8 mb-8 text-center">
            <FaCar className="text-5xl text-secondary-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Active Vehicle</h2>
            <p className="text-secondary-400 mb-4">Browse our Tesla collection and apply for financing today.</p>
            <Link to="/vehicles" className="btn-primary inline-flex items-center gap-2">Browse Vehicles <FaArrowRight /></Link>
          </div>
        )}

        {data?.virtualAccount ? (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2"><FaUniversity className="text-primary-400" /> Bank Transfer Details</h2>
              <button onClick={() => setShowVirtualAccount(!showVirtualAccount)} className="text-primary-400 text-sm hover:underline">{showVirtualAccount ? 'Hide' : 'Show'} Details</button>
            </div>
            {showVirtualAccount && (
              <div className="bg-secondary-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center"><span className="text-secondary-400 text-sm">Bank</span><span className="font-semibold">{data.virtualAccount.bankName}</span></div>
                <div className="flex justify-between items-center"><span className="text-secondary-400 text-sm">Account Number</span><div className="flex items-center gap-2"><span className="font-mono font-bold text-lg">{data.virtualAccount.accountNumber}</span><button onClick={() => { navigator.clipboard.writeText(data.virtualAccount.accountNumber); toast.success('Copied!'); }} className="text-primary-400 hover:text-primary-300"><FaCopy /></button></div></div>
                <div className="flex justify-between items-center"><span className="text-secondary-400 text-sm">Account Name</span><span className="font-semibold">{data.virtualAccount.accountName}</span></div>
                <p className="text-xs text-secondary-500 mt-2">Transfer your payment to this account. Your payment will be verified automatically within a few minutes.</p>
              </div>
            )}
          </div>
        ) : applicationId ? (
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400"><FaUniversity /></div>
              <div className="flex-1">
                <h3 className="font-semibold">Get Your Payment Account</h3>
                <p className="text-sm text-secondary-400">Generate a unique bank account for your payments</p>
              </div>
              <button onClick={generateVirtualAccount} disabled={generatingAccount} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {generatingAccount ? 'Generating...' : 'Generate Account'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Payments</h2>
            <Link to="/dashboard/payments" className="text-primary-400 text-sm flex items-center gap-1 hover:underline">View All <FaArrowRight className="text-xs" /></Link>
          </div>
          {data?.recentPayments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-secondary-700"><th className="text-left py-3 text-sm text-secondary-400">Date</th><th className="text-left py-3 text-sm text-secondary-400">Type</th><th className="text-left py-3 text-sm text-secondary-400">Reference</th><th className="text-right py-3 text-sm text-secondary-400">Amount</th><th className="text-right py-3 text-sm text-secondary-400">Status</th></tr></thead>
                <tbody>{data.recentPayments.slice(0, 5).map((p, i) => (
                  <tr key={i} className="border-b border-secondary-700/50">
                    <td className="py-3 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-sm capitalize">{p.type}</td>
                    <td className="py-3 text-sm text-secondary-400 font-mono text-xs">{p.transactionRef}</td>
                    <td className="py-3 text-right font-semibold">{formatPrice(p.amount)}</td>
                    <td className="py-3 text-right"><span className={`badge ${p.status === 'successful' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="text-center py-8"><FaReceipt className="text-4xl text-secondary-600 mx-auto mb-3" /><p className="text-secondary-400">No payments yet</p></div>}
        </div>
      </div>

      {applicationId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          applicationId={applicationId}
          amount={data?.nextPayment?.amount || 0}
          type="installment"
          description={`Installment #${data?.nextPayment?.paymentNumber || ''} Payment`}
          onPaymentSuccess={fetchDashboard}
        />
      )}
    </div>
  );
};
export default Dashboard;
