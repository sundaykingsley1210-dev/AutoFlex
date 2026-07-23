import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaMoneyBillWave, FaCalendarAlt, FaArrowRight, FaClock, FaCheckCircle, FaReceipt, FaBell, FaCreditCard, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/dashboard').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p || 0);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  const stats = [
    { icon: <FaMoneyBillWave />, label: 'Total Price', value: formatPrice(data?.vehicle?.price), color: 'text-primary-400', bg: 'bg-primary-600/20' },
    { icon: <FaCheckCircle />, label: 'Amount Paid', value: formatPrice(data?.totalPaid), color: 'text-accent-400', bg: 'bg-accent-600/20' },
    { icon: <FaClock />, label: 'Remaining', value: formatPrice(data?.remainingBalance), color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
    { icon: <FaCalendarAlt />, label: 'Next Payment', value: data?.nextPayment ? formatPrice(data.nextPayment.amount) : 'N/A', color: 'text-purple-400', bg: 'bg-purple-600/20' },
  ];
  const progress = data?.vehicle?.price ? Math.round((data.totalPaid / data.vehicle.price) * 100) : 0;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
          <p className="text-primary-100">Manage your vehicle financing and payments</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/vehicles" className="card-hover p-4 text-center"><FaCar className="text-primary-400 text-2xl mx-auto mb-2" /><p className="text-sm font-medium">Browse Cars</p></Link>
          <Link to="/dashboard/payments" className="card-hover p-4 text-center"><FaCreditCard className="text-accent-400 text-2xl mx-auto mb-2" /><p className="text-sm font-medium">Payments</p></Link>
          <Link to="/dashboard/applications" className="card-hover p-4 text-center"><FaFileAlt className="text-yellow-400 text-2xl mx-auto mb-2" /><p className="text-sm font-medium">Applications</p></Link>
          <Link to="/dashboard/notifications" className="card-hover p-4 text-center"><FaBell className="text-purple-400 text-2xl mx-auto mb-2" /><p className="text-sm font-medium">Notifications</p></Link>
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
            <div className="flex items-center gap-4">
              <img src={data.vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <div><p className="font-semibold">{data.vehicle.name}</p><p className="text-sm text-secondary-400">{data.vehicle.year} • {data.vehicle.brand}</p></div>
            </div>
          </div>
        )}
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
    </div>
  );
};
export default Dashboard;