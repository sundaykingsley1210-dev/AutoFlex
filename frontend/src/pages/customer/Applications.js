import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaCar, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/applications/my').then(res => setApplications(res.data.applications || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
  const statusColors = { pending: 'badge-warning', under_review: 'badge-info', approved: 'badge-success', rejected: 'badge-danger', active: 'badge-success', completed: 'badge-info' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Applications</h1>
          <Link to="/vehicles" className="btn-primary text-sm flex items-center gap-2">New Application <FaArrowRight /></Link>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <img src={app.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{app.vehicle?.name || 'Vehicle'}</h3>
                    <p className="text-secondary-400 text-sm">{app.vehicle?.year} • {app.vehicle?.brand}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span>Price: <strong>{formatPrice(app.totalAmount)}</strong></span>
                      <span>Monthly: <strong>{formatPrice(app.monthlyPayment)}</strong></span>
                      <span>{app.installmentMonths} months</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${statusColors[app.status] || 'badge-info'} mb-2`}>{app.status?.replace('_', ' ').toUpperCase()}</span>
                    <p className="text-xs text-secondary-400">{new Date(app.createdAt).toLocaleDateString()}</p>
                    {app.status === 'active' && <Link to={`/dashboard/schedule/${app._id}`} className="block mt-2 text-primary-400 text-sm hover:underline">View Schedule</Link>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaFileAlt className="text-6xl text-secondary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Applications Yet</h2>
            <p className="text-secondary-400 mb-6">Browse our vehicles and apply for financing</p>
            <Link to="/vehicles" className="btn-primary inline-flex items-center gap-2">Browse Vehicles <FaArrowRight /></Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default Applications;