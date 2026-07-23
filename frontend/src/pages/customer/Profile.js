import React, { useState } from 'react';
import { FaUser, FaSave, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', street: user?.address?.street || '',
    city: user?.address?.city || '', state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updatePass = (field, value) => setPasswords(f => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await updateProfile({ ...form, address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: 'United States' } });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    try {
      const api = (await import('../../utils/api')).default;
      await api.put('/auth/change-password', passwords);
      toast.success('Password changed!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div><h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2><p className="text-secondary-400">{user?.email}</p><span className="badge badge-success mt-1">{user?.role}</span></div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e => update('firstName', e.target.value)} /></div>
              <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e => update('lastName', e.target.value)} /></div>
            </div>
            <div><label className="label">Phone</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" value={form.phone} onChange={e => update('phone', e.target.value)} /></div></div>
            <div><label className="label">Street</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm" /><input className="input pl-10" value={form.street} onChange={e => update('street', e.target.value)} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">City</label><input className="input" value={form.city} onChange={e => update('city', e.target.value)} /></div>
              <div><label className="label">State</label><input className="input" value={form.state} onChange={e => update('state', e.target.value)} /></div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2"><FaSave /> {saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaLock /> Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" className="input" value={passwords.currentPassword} onChange={e => updatePass('currentPassword', e.target.value)} required /></div>
            <div><label className="label">New Password</label><input type="password" className="input" value={passwords.newPassword} onChange={e => updatePass('newPassword', e.target.value)} required /></div>
            <div><label className="label">Confirm New Password</label><input type="password" className="input" value={passwords.confirmPassword} onChange={e => updatePass('confirmPassword', e.target.value)} required /></div>
            <button type="submit" className="btn-primary flex items-center gap-2"><FaLock /> Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;