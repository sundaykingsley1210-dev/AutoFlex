import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCar, FaUpload, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';

const ApplyVehicle = () => {
  const { vehicleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    installmentMonths: 12, depositAmount: '',
    employer: '', position: '', monthlyIncome: '',
    idType: 'national_id', idNumber: '',
    documents: []
  });

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}`).then(res => { setVehicle(res.data.vehicle || res.data); setForm(f => ({ ...f, depositAmount: (res.data.vehicle || res.data).depositAmount })); }).catch(() => { toast.error('Vehicle not found'); navigate('/vehicles'); }).finally(() => setLoading(false));
  }, [vehicleId, navigate]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', { vehicleId, ...form });
      toast.success('Application submitted successfully!');
      navigate('/dashboard/applications');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  if (!vehicle) return null;

  const deposit = Number(form.depositAmount);
  const balance = vehicle.price - deposit;
  const monthly = Math.ceil(balance / form.installmentMonths);

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary-400 hover:text-white mb-6"><FaArrowLeft /> Back</button>
        <h1 className="text-2xl font-bold mb-6">Financing Application</h1>

        {/* Vehicle Summary */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <img src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-20 h-20 rounded-lg object-cover" />
            <div><h2 className="font-bold text-lg">{vehicle.name}</h2><p className="text-secondary-400 text-sm">{vehicle.year} • {vehicle.brand} • {vehicle.transmission}</p><p className="text-primary-400 font-bold mt-1">{formatPrice(vehicle.price)}</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Plan */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Deposit Amount (₦)</label><input type="number" className="input" value={form.depositAmount} onChange={e => update('depositAmount', e.target.value)} min={vehicle.depositAmount} max={vehicle.price * 0.5} required /></div>
              <div><label className="label">Repayment Duration</label><select className="input" value={form.installmentMonths} onChange={e => update('installmentMonths', Number(e.target.value))}>
                {[12, 24, 36, 48].map(m => <option key={m} value={m}>{m} months</option>)}
              </select></div>
            </div>
            <div className="mt-4 bg-secondary-700/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-secondary-400">Deposit</p><p className="font-bold text-accent-400">{formatPrice(deposit)}</p></div>
                <div><p className="text-xs text-secondary-400">Monthly Payment</p><p className="font-bold text-primary-400">{formatPrice(monthly)}</p></div>
                <div><p className="text-xs text-secondary-400">Total</p><p className="font-bold">{formatPrice(deposit + monthly * form.installmentMonths)}</p></div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly /></div>
              <div><label className="label">Email</label><input className="input" value={user?.email || ''} readOnly /></div>
              <div><label className="label">Phone</label><input className="input" value={user?.phone || ''} readOnly /></div>
              <div><label className="label">ID Type</label><select className="input" value={form.idType} onChange={e => update('idType', e.target.value)}>
                <option value="national_id">National ID</option><option value="drivers_license">Driver's License</option><option value="passport">Passport</option><option value="voters_card">Voter's Card</option>
              </select></div>
              <div className="sm:col-span-2"><label className="label">ID Number</label><input className="input" placeholder="Enter ID number" value={form.idNumber} onChange={e => update('idNumber', e.target.value)} required /></div>
            </div>
          </div>

          {/* Employment */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Employer</label><input className="input" placeholder="Company name" value={form.employer} onChange={e => update('employer', e.target.value)} required /></div>
              <div><label className="label">Position</label><input className="input" placeholder="Job title" value={form.position} onChange={e => update('position', e.target.value)} required /></div>
              <div><label className="label">Monthly Income (₦)</label><input type="number" className="input" placeholder="500000" value={form.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} required /></div>
            </div>
          </div>

          {/* Documents */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
            <p className="text-secondary-400 text-sm mb-4">Upload proof of identity, proof of address, and income verification</p>
            <div className="border-2 border-dashed border-secondary-600 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer">
              <FaUpload className="text-3xl text-secondary-400 mx-auto mb-3" />
              <p className="text-secondary-400 text-sm">Click to upload or drag and drop</p>
              <p className="text-secondary-500 text-xs mt-1">PDF, JPG, PNG up to 5MB each</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              <FaCheck /> {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ApplyVehicle;