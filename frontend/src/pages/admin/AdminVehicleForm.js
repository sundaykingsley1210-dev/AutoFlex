import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminVehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear(), price: '',
    depositAmount: '', installmentMonths: 12, bodyType: 'Sedan', fuelType: 'Petrol',
    transmission: 'Automatic', color: '', mileage: '', engine: '', horsepower: '',
    description: '', features: '', availability: 'available',
  });

  useEffect(() => {
    if (id) api.get(`/vehicles/${id}`).then(res => { const v = res.data.vehicle || res.data; setForm({ ...v, features: v.features?.join(', ') || '' }); }).catch(() => toast.error('Vehicle not found')).finally(() => setLoading(false));
  }, [id]);

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const data = { ...form, features: form.features ? form.features.split(',').map(f => f.trim()) : [], price: Number(form.price), depositAmount: Number(form.depositAmount), installmentMonths: Number(form.installmentMonths), year: Number(form.year), mileage: Number(form.mileage) || 0, horsepower: Number(form.horsepower) || 0, monthlyInstallment: Math.ceil((Number(form.price) - Number(form.depositAmount)) / Number(form.installmentMonths)) };
    try {
      if (id) { await api.put(`/admin/vehicles/${id}`, data); toast.success('Vehicle updated!'); }
      else { await api.post('/admin/vehicles', data); toast.success('Vehicle created!'); }
      navigate('/admin/vehicles');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary-400 hover:text-white mb-6"><FaArrowLeft /> Back</button>
        <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Vehicle Name</label><input className="input" placeholder="e.g. Toyota Camry 2024" value={form.name} onChange={e => update('name', e.target.value)} required /></div>
              <div><label className="label">Brand</label><input className="input" placeholder="Toyota" value={form.brand} onChange={e => update('brand', e.target.value)} required /></div>
              <div><label className="label">Model</label><input className="input" placeholder="Camry" value={form.model} onChange={e => update('model', e.target.value)} required /></div>
              <div><label className="label">Year</label><input type="number" className="input" value={form.year} onChange={e => update('year', e.target.value)} required /></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Pricing & Financing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="label">Price (₦)</label><input type="number" className="input" value={form.price} onChange={e => update('price', e.target.value)} required /></div>
              <div><label className="label">Deposit (₦)</label><input type="number" className="input" value={form.depositAmount} onChange={e => update('depositAmount', e.target.value)} required /></div>
              <div><label className="label">Installment Months</label><select className="input" value={form.installmentMonths} onChange={e => update('installmentMonths', e.target.value)}>{[12, 24, 36, 48].map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="label">Body Type</label><select className="input" value={form.bodyType} onChange={e => update('bodyType', e.target.value)}>{['Sedan', 'SUV', 'Hatchback', 'Truck', 'Coupe', 'Convertible'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Fuel Type</label><select className="input" value={form.fuelType} onChange={e => update('fuelType', e.target.value)}>{['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}</select></div>
              <div><label className="label">Transmission</label><select className="input" value={form.transmission} onChange={e => update('transmission', e.target.value)}>{['Automatic', 'Manual'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Color</label><input className="input" value={form.color} onChange={e => update('color', e.target.value)} /></div>
              <div><label className="label">Mileage (km)</label><input type="number" className="input" value={form.mileage} onChange={e => update('mileage', e.target.value)} /></div>
              <div><label className="label">Engine</label><input className="input" placeholder="2.5L" value={form.engine} onChange={e => update('engine', e.target.value)} /></div>
              <div><label className="label">Horsepower</label><input type="number" className="input" value={form.horsepower} onChange={e => update('horsepower', e.target.value)} /></div>
              <div><label className="label">Availability</label><select className="input" value={form.availability} onChange={e => update('availability', e.target.value)}><option value="available">Available</option><option value="sold">Sold</option><option value="reserved">Reserved</option></select></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Description & Features</h2>
            <div className="space-y-4">
              <div><label className="label">Description</label><textarea className="input min-h-[100px]" value={form.description} onChange={e => update('description', e.target.value)} /></div>
              <div><label className="label">Features (comma separated)</label><input className="input" placeholder="ABS, Bluetooth, Sunroof" value={form.features} onChange={e => update('features', e.target.value)} /></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2"><FaSave /> {saving ? 'Saving...' : id ? 'Update Vehicle' : 'Create Vehicle'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AdminVehicleForm;
