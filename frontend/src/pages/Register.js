import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt, FaBuilding, FaBriefcase, FaMoneyBill, FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', street: '', city: '', state: '', zipCode: '', country: 'United States', employer: '', position: '', monthlyIncome: '' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ ...form, address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country }, employment: { employer: form.employer, position: form.position, monthlyIncome: Number(form.monthlyIncome) } });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(s => (
        <React.Fragment key={s}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-secondary-400'}`}>
            {step > s ? <FaCheck className="text-sm" /> : s}
          </div>
          {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-secondary-700'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><FaCar className="text-primary-400 text-3xl" /><span className="text-2xl font-bold gradient-text">AutoFlex</span></Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-secondary-400">Join AutoFlex and start driving today</p>
        </div>
        <StepIndicator />
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">First Name</label><div className="relative"><FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} required /></div></div>
                <div><label className="label">Last Name</label><input className="input" placeholder="Doe" value={form.lastName} onChange={e => update('lastName', e.target.value)} required /></div>
              </div>
              <div><label className="label">Email</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required /></div></div>
              <div><label className="label">Phone</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} required /></div></div>
              <div><label className="label">Password</label><div className="relative"><FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-white">{showPass ? <FaEyeSlash /> : <FaEye />}</button></div></div>
              <div><label className="label">Confirm Password</label><div className="relative"><FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input type="password" className="input pl-10" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required /></div></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Address Details</h2>
              <div><label className="label">Street Address</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" placeholder="123 Main Street" value={form.street} onChange={e => update('street', e.target.value)} required /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">City</label><input className="input" placeholder="Austin" value={form.city} onChange={e => update('city', e.target.value)} required /></div>
                <div><label className="label">State</label><input className="input" placeholder="Texas" value={form.state} onChange={e => update('state', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Zip Code</label><input className="input" placeholder="100001" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} /></div>
                <div><label className="label">Country</label><input className="input" placeholder="United States" value={form.country} onChange={e => update('country', e.target.value)} /></div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
              <div><label className="label">Employer</label><div className="relative"><FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" placeholder="Company name" value={form.employer} onChange={e => update('employer', e.target.value)} required /></div></div>
              <div><label className="label">Position</label><div className="relative"><FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" placeholder="Job title" value={form.position} onChange={e => update('position', e.target.value)} required /></div></div>
              <div><label className="label">Monthly Income ($)</label><div className="relative"><FaMoneyBill className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input type="number" className="input pl-10" placeholder="500000" value={form.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} required /></div></div>
              <label className="flex items-center gap-2 text-sm text-secondary-400 mt-4">
                <input type="checkbox" className="rounded bg-secondary-700 border-secondary-600" required /> I agree to the <a href="#" className="text-primary-400">Terms of Service</a> and <a href="#" className="text-primary-400">Privacy Policy</a>
              </label>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><FaArrowLeft /> Back</button>}
            {step < 3 ? (
              <button type="button" onClick={() => { if (step === 1 && (!form.firstName || !form.email || !form.password)) return toast.error('Please fill required fields'); setStep(step + 1); }} className="btn-primary flex-1 flex items-center justify-center gap-2">Next <FaArrowRight /></button>
            ) : (
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">{loading ? 'Creating Account...' : 'Create Account'}</button>
            )}
          </div>
          <p className="text-center text-secondary-400 text-sm">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign In</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
