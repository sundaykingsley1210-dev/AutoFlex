import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { loginOrRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    if (isRegister && (!firstName || !lastName)) return toast.error('Please enter your name');

    setLoading(true);
    try {
      const result = await loginOrRegister({
        email,
        password,
        firstName: isRegister ? firstName : undefined,
        lastName: isRegister ? lastName : undefined
      });

      if (result.action === 'register') {
        toast.success(result.message || 'Account created successfully! Welcome to AutoFlex.');
      } else {
        toast.success(result.message || 'Welcome back!');
      }

      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4"><FaCar className="text-primary-400 text-3xl" /><span className="text-2xl font-bold gradient-text">AutoFlex</span></Link>
          <h1 className="text-3xl font-bold mb-2">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-secondary-400">{isRegister ? 'Join AutoFlex and start driving today' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" />
                  <input className="input pl-10" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
              <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
              <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-white">
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-secondary-400">
              <input type="checkbox" className="rounded bg-secondary-700 border-secondary-600" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? (isRegister ? 'Creating Account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
          <p className="text-center text-secondary-400 text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary-400 hover:text-primary-300 font-semibold">
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
