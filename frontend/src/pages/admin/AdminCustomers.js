import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get(`/admin/customers?search=${search}`).then(res => setCustomers(res.data.customers || [])).catch(() => {}).finally(() => setLoading(false)); }, [search]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Manage Customers</h1>
        <div className="relative mb-6"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" /><input className="input pl-10" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700 bg-secondary-800/50">
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Customer</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Email</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Phone</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Location</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Joined</th>
              </tr></thead>
              <tbody>{customers.map(c => (
                <tr key={c._id} className="border-b border-secondary-700/50 hover:bg-secondary-800/30">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">{c.firstName?.[0]}{c.lastName?.[0]}</div><span className="font-medium">{c.firstName} {c.lastName}</span></div></td>
                  <td className="px-6 py-4 text-sm text-secondary-400">{c.email}</td>
                  <td className="px-6 py-4 text-sm">{c.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-secondary-400">{c.address?.city || 'N/A'}, {c.address?.state || ''}</td>
                  <td className="px-6 py-4 text-sm text-secondary-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminCustomers;
