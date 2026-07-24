import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUpload, FaCheck, FaArrowLeft, FaArrowRight, FaTimes, FaFileAlt, FaUniversity, FaCopy, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';

const ApplyVehicle = () => {
  const { vehicleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [virtualAccount, setVirtualAccount] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    installmentMonths: 12, depositAmount: '',
    employer: '', position: '', monthlyIncome: '',
    idType: 'national_id', idNumber: '',
  });

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}`).then(res => { setVehicle(res.data.vehicle || res.data); setForm(f => ({ ...f, depositAmount: (res.data.vehicle || res.data).depositAmount })); }).catch(() => { toast.error('Vehicle not found'); navigate('/vehicles'); }).finally(() => setLoading(false));
  }, [vehicleId, navigate]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is too large (max 10MB)`); return false; }
      return true;
    });
    setUploadedFiles(prev => [...prev, ...validFiles.map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => { const updated = [...prev]; URL.revokeObjectURL(updated[index].preview); updated.splice(index, 1); return updated; });
  };

  const handleFileUpload = async (appId) => {
    if (uploadedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach(f => formData.append('documents', f.file));
      await api.post(`/applications/${appId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch (err) { toast.error('Failed to upload documents'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/applications', { vehicleId, ...form });
      const data = res.data.data || res.data;
      const appId = data.application?._id || data._id;
      const va = data.virtualAccount || null;
      setVirtualAccount(va);
      if (uploadedFiles.length > 0 && appId) await handleFileUpload(appId);
      setSubmitted(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="py-8 flex items-center justify-center"><Loading /></div>;
  if (!vehicle) return null;

  if (submitted) {
    return (
      <div className="py-8 animate-fade-in">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
            <p className="text-secondary-400 mb-6">Your financing application has been received. Here are your payment details:</p>

            <div className="bg-secondary-700/50 rounded-xl p-4 mb-6 flex items-center gap-4">
              <img src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <div className="text-left"><p className="font-semibold">{vehicle.name}</p><p className="text-sm text-secondary-400">{vehicle.year} {vehicle.brand}</p></div>
            </div>

            {virtualAccount && (
              <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border border-primary-500/30 rounded-xl p-6 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <FaUniversity className="text-primary-400 text-xl" />
                  <h2 className="font-semibold text-lg">Your Payment Account</h2>
                </div>
                <p className="text-secondary-400 text-sm mb-4">Transfer your deposit to this account:</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-secondary-800/50 rounded-lg p-3">
                    <span className="text-secondary-400 text-sm">Bank</span>
                    <span className="font-semibold">{virtualAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center bg-secondary-800/50 rounded-lg p-3">
                    <span className="text-secondary-400 text-sm">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-primary-400">{virtualAccount.accountNumber}</span>
                      <button onClick={() => { navigator.clipboard.writeText(virtualAccount.accountNumber); toast.success('Copied!'); }} className="text-primary-400 hover:text-primary-300 p-1"><FaCopy /></button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-secondary-800/50 rounded-lg p-3">
                    <span className="text-secondary-400 text-sm">Account Name</span>
                    <span className="font-semibold text-sm">{virtualAccount.accountName}</span>
                  </div>
                </div>
                <p className="text-xs text-secondary-500 mt-4 text-center">Payment verified automatically</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex items-center justify-center gap-2">Go to Dashboard <FaArrowRight /></button>
              <button onClick={() => navigate('/dashboard/applications')} className="btn-secondary">View My Applications</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const deposit = Number(form.depositAmount);
  const balance = vehicle.price - deposit;
  const monthly = Math.ceil(balance / form.installmentMonths);

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary-400 hover:text-white mb-6"><FaArrowLeft /> Back</button>
        <h1 className="text-2xl font-bold mb-6">Financing Application</h1>

        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <img src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200'} alt="" className="w-20 h-20 rounded-lg object-cover" />
            <div><h2 className="font-bold text-lg">{vehicle.name}</h2><p className="text-secondary-400 text-sm">{vehicle.year} {vehicle.brand} {vehicle.transmission}</p><p className="text-primary-400 font-bold mt-1">{formatPrice(vehicle.price)}</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Deposit Amount ($)</label><input type="number" className="input" value={form.depositAmount} onChange={e => update('depositAmount', e.target.value)} min={vehicle.depositAmount} max={vehicle.price * 0.5} required /></div>
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

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly /></div>
              <div><label className="label">Email</label><input className="input" value={user?.email || ''} readOnly /></div>
              <div><label className="label">Phone</label><input className="input" value={user?.phone || ''} readOnly /></div>
              <div><label className="label">ID Type</label><select className="input" value={form.idType} onChange={e => update('idType', e.target.value)}>
                <option value="national_id">National ID</option><option value="drivers_license">Driver License</option><option value="passport">Passport</option><option value="voters_card">Voter Card</option>
              </select></div>
              <div className="sm:col-span-2"><label className="label">ID Number</label><input className="input" placeholder="Enter ID number" value={form.idNumber} onChange={e => update('idNumber', e.target.value)} required /></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">Employer</label><input className="input" placeholder="Company name" value={form.employer} onChange={e => update('employer', e.target.value)} required /></div>
              <div><label className="label">Position</label><input className="input" placeholder="Job title" value={form.position} onChange={e => update('position', e.target.value)} required /></div>
              <div><label className="label">Monthly Income ($)</label><input type="number" className="input" placeholder="5000" value={form.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} required /></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
            <p className="text-secondary-400 text-sm mb-4">Upload proof of identity, proof of address, and income verification</p>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-secondary-600 rounded-lg p-8 text-center hover:border-primary-500 transition cursor-pointer active:bg-secondary-700/50">
              <FaUpload className="text-3xl text-secondary-400 mx-auto mb-3" />
              <p className="text-secondary-300 text-sm font-medium">Tap to upload from your device</p>
              <p className="text-secondary-500 text-xs mt-1">Take a photo, choose from gallery, or select files</p>
              <p className="text-secondary-600 text-xs mt-2">JPG, PNG, PDF up to 10MB each</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-secondary-700/50 rounded-lg p-3">
                    {f.file.type.startsWith('image/') ? <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-secondary-600 flex items-center justify-center"><FaFileAlt className="text-secondary-300" /></div>}
                    <div className="flex-1 min-w-0"><p className="text-sm truncate">{f.name}</p><p className="text-xs text-secondary-400">{(f.file.size / 1024).toFixed(0)} KB</p></div>
                    <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 p-1"><FaTimes /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting || uploading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              <FaCheck /> {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ApplyVehicle;
