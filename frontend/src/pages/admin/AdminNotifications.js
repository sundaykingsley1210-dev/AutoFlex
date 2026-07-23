import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const AdminNotifications = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', type: 'payment', message: '' });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/customers').then(res => setUsers(res.data.customers || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSend = async (e) => {
    e.preventDefault(); setSending(true);
    try { await api.post('/admin/notifications', form); toast.success('Notification sent!'); setForm({ userId: '', type: 'payment', message: '' }); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSending(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Send Notifications</h1>
        <form onSubmit={handleSend} className="card p-6 space-y-4">
          <div>
            <label className="label">Recipient</label>
            <select className="input" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
              <option value="">Select customer</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notification Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="payment">Payment</option>
              <option value="application">Application</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-[120px]" placeholder="Enter notification message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
          </div>
          <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2"><FaPaperPlane /> {sending ? 'Sending...' : 'Send Notification'}</button>
        </form>
      </div>
    </div>
  );
};
export default AdminNotifications;
