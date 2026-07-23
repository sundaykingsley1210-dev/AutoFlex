import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCar, FaFileAlt, FaCheckCircle, FaMoneyBillWave, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/stats').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p || 0);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  const stats = [
    { icon: <FaUsers />, label: 'Total Customers', value: data?.totalCustomers || 0, color: 'text-blue-400', bg: 'bg-blue-600/20' },
    { icon: <FaCar />, label: 'Total Vehicles', value: data?.totalVehicles || 0, color: 'text-purple-400', bg: 'bg-purple-600/20' },
    { icon: <FaFileAlt />, label: 'Applications', value: data?.totalApplications || 0, color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
    { icon: <FaCheckCircle />, label: 'Approved', value: data?.approvedApplications || 0, color: 'text-green-400', bg: 'bg-green-600/20' },
    { icon: <FaMoneyBillWave />, label: 'Total Revenue', value: formatPrice(data?.totalRevenue), color: 'text-accent-400', bg: 'bg-accent-600/20' },
    { icon: <FaClock />, label: 'Outstanding', value: formatPrice(data?.outstandingBalances), color: 'text-orange-400', bg: 'bg-orange-600/20' },
    { icon: <FaExclamationTriangle />, label: 'Overdue', value: data?.overduePayments || 0, color: 'text-red-400', bg: 'bg-red-600/20' },
  ];

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-secondary-400 text-sm">Platform overview and statistics</p></div>
          <Link to="/admin/vehicles/new" className="btn-primary text-sm">Add Vehicle</Link>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[{ to: '/admin/vehicles', label: 'Manage Vehicles', icon: <FaCar /> }, { to: '/admin/customers', label: 'Manage Customers', icon: <FaUsers /> }, { to: '/admin/applications', label: 'Review Applications', icon: <FaFileAlt /> }, { to: '/admin/payments', label: 'View Payments', icon: <FaMoneyBillWave /> }].map((a, i) => (
                <Link key={i} to={a.to} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-700/50 transition">
                  <div className="flex items-center gap-3"><span className="text-primary-400">{a.icon}</span><span>{a.label}</span></div>
                  <FaArrowRight className="text-secondary-400 text-sm" />
                </Link>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Recent Applications</h2>
            {data?.recentApplications?.length > 0 ? (
              <div className="space-y-3">
                {data.recentApplications.slice(0, 5).map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary-700/30 rounded-lg">
                    <div><p className="text-sm font-medium">{app.user?.firstName} {app.user?.lastName}</p><p className="text-xs text-secondary-400">{app.vehicle?.name || 'Vehicle'}</p></div>
                    <span className={`badge ${app.status === 'approved' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-secondary-400 text-sm text-center py-4">No recent applications</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
