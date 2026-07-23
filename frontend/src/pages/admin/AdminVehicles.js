import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVehicles = () => { api.get(`/vehicles?limit=100&search=${search}`).then(res => setVehicles(res.data.vehicles || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetchVehicles(); }, [search]);

  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await api.delete(`/admin/vehicles/${id}`); toast.success('Vehicle deleted'); fetchVehicles(); } catch { toast.error('Delete failed'); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Manage Vehicles</h1>
          <Link to="/admin/vehicles/new" className="btn-primary flex items-center gap-2"><FaPlus /> Add Vehicle</Link>
        </div>
        <div className="relative mb-6"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" /><input className="input pl-10" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700 bg-secondary-800/50">
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Price</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Monthly</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Status</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Actions</th>
              </tr></thead>
              <tbody>{vehicles.map(v => (
                <tr key={v._id} className="border-b border-secondary-700/50 hover:bg-secondary-800/30">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={v.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-medium">{v.name}</p><p className="text-xs text-secondary-400">{v.year} • {v.brand}</p></div></div></td>
                  <td className="px-6 py-4 text-sm">{formatPrice(v.price)}</td>
                  <td className="px-6 py-4 text-sm">{formatPrice(v.monthlyInstallment)}</td>
                  <td className="px-6 py-4"><span className={`badge ${v.availability === 'available' ? 'badge-success' : 'badge-danger'}`}>{v.availability}</span></td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2">
                    <Link to={`/admin/vehicles/${v._id}/edit`} className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 hover:bg-primary-600 hover:text-white transition"><FaEdit /></Link>
                    <button onClick={() => deleteVehicle(v._id)} className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition"><FaTrash /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminVehicles;
