import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/dashboard/notifications').then(res => setNotifications(res.data.notifications || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const markRead = async (id) => {
    try { await api.put(`/dashboard/notifications/${id}/read`); setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x)); } catch {}
  };

  const markAllRead = async () => {
    try { await Promise.all(notifications.filter(n => !n.isRead).map(n => api.put(`/dashboard/notifications/${n._id}/read`))); setNotifications(n => n.map(x => ({ ...x, isRead: true }))); } catch {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><FaCheck /></div>;
      case 'application': return <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><FaBell /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400"><FaBell /></div>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some(n => !n.isRead) && <button onClick={markAllRead} className="text-primary-400 text-sm flex items-center gap-1 hover:underline"><FaCheckDouble /> Mark all read</button>}
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n._id} onClick={() => !n.isRead && markRead(n._id)} className={`card p-4 flex items-start gap-4 cursor-pointer transition hover:bg-secondary-700/50 ${!n.isRead ? 'border-primary-500/30 bg-primary-500/5' : ''}`}>
                {getIcon(n.type)}
                <div className="flex-1">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'text-secondary-300'}`}>{n.message}</p>
                  <p className="text-xs text-secondary-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-400 mt-2"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><FaBell className="text-6xl text-secondary-600 mx-auto mb-4" /><h2 className="text-xl font-semibold mb-2">No Notifications</h2><p className="text-secondary-400">You're all caught up!</p></div>
        )}
      </div>
    </div>
  );
};
export default Notifications;