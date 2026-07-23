import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Error sending reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><FaCar className="text-primary-400 text-3xl" /><span className="text-2xl font-bold gradient-text">AutoFlex</span></Link>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-secondary-400">Enter your email to receive reset instructions</p>
        </div>
        {sent ? (
          <div className="card p-8 text-center animate-fade-in">
            <FaCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Email Sent!</h2>
            <p className="text-secondary-400 mb-6">Check your email for password reset instructions.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2"><FaArrowLeft /> Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-secondary-400 hover:text-white transition text-sm"><FaArrowLeft /> Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
