import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaArrowLeft, FaCheckCircle, FaClock, FaExclamationTriangle, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Loading from '../../components/common/Loading';

const Schedule = () => {
  const { applicationId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    api.get(`/schedules/${applicationId}`).then(res => setSchedule(res.data.schedule || res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [applicationId]);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const statusIcon = (s) => { switch(s) { case 'paid': return <FaCheckCircle className="text-green-400" />; case 'overdue': return <FaExclamationTriangle className="text-red-400" />; case 'due': return <FaCreditCard className="text-yellow-400" />; default: return <FaClock className="text-secondary-400" />; } };
  const statusColor = (s) => { switch(s) { case 'paid': return 'badge-success'; case 'overdue': return 'badge-danger'; case 'due': return 'badge-warning'; default: return 'badge-info'; } };

  const handlePayNow = async (paymentEntry) => {
    setPaying(paymentEntry.paymentNumber);
    try {
      const res = await api.post('/payments/initiate', {
        applicationId,
        amount: paymentEntry.amountDue - (paymentEntry.amountPaid || 0),
        type: 'installment'
      });

      const { checkoutUrl, apiKey, contractCode, transactionReference } = res.data.data;

      if (window.MonnifySDK) {
        window.MonnifySDK.initialize({
          amount: paymentEntry.amountDue - (paymentEntry.amountPaid || 0),
          currency: 'NGN',
          reference: res.data.data.payment.paymentRef || res.data.data.payment.transactionRef,
          customerFullName: `${JSON.parse(localStorage.getItem('user'))?.firstName || 'Customer'} ${JSON.parse(localStorage.getItem('user'))?.lastName || ''}`,
          customerEmail: JSON.parse(localStorage.getItem('user'))?.email || 'customer@autoflex.com',
          apiKey: apiKey,
          contractCode: contractCode,
          paymentDescription: `Installment #${paymentEntry.paymentNumber} Payment`,
          metadata: {
            applicationId,
            paymentNumber: paymentEntry.paymentNumber
          },
          onLoadStart: () => console.log('Monnify loading...'),
          onLoadComplete: () => console.log('Monnify ready'),
          onComplete: async (response) => {
            if (response.paymentStatus === 'PAID') {
              toast.success('Payment successful!');
              try {
                const verifyRes = await api.get(`/payments/verify/${res.data.data.payment.transactionRef}`);
                if (verifyRes.data.verified) {
                  const schedRes = await api.get(`/schedules/${applicationId}`);
                  setSchedule(schedRes.data.schedule || schedRes.data);
                }
              } catch {}
            } else {
              toast.error('Payment was not completed');
            }
            setPaying(null);
          },
          onClose: (data) => {
            if (data?.responseCode === 'USER_CANCELLED') {
              toast.info('Payment cancelled');
            }
            setPaying(null);
          }
        });
      } else {
        toast.error('Payment system is loading. Please try again.');
        setPaying(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setPaying(null);
    }
  };

  if (loading) return <div className="py-8 flex items-center justify-center"><Loading /></div>;
  if (!schedule) return <div className="py-8 flex items-center justify-center"><p className="text-secondary-400">Schedule not found</p></div>;

  const paidCount = schedule.payments?.filter(p => p.status === 'paid').length || 0;
  const totalCount = schedule.payments?.length || 1;
  const progress = Math.round((paidCount / totalCount) * 100);

  return (
    <div className="py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-secondary-400 hover:text-white mb-6"><FaArrowLeft /> Back to Dashboard</Link>
        <h1 className="text-2xl font-bold mb-6">Payment Schedule</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Amount</p><p className="text-xl font-bold">{formatPrice(schedule.totalAmount)}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Total Paid</p><p className="text-xl font-bold text-accent-400">{formatPrice(schedule.totalPaid)}</p></div>
          <div className="card p-5"><p className="text-xs text-secondary-400">Remaining</p><p className="text-xl font-bold text-yellow-400">{formatPrice(schedule.remainingBalance)}</p></div>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondary-400">{paidCount} of {totalCount} payments completed</span>
            <span className="text-primary-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700 bg-secondary-800/50">
                <th className="text-left px-6 py-4 text-sm text-secondary-400">#</th>
                <th className="text-left px-6 py-4 text-sm text-secondary-400">Due Date</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Amount Due</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Amount Paid</th>
                <th className="text-center px-6 py-4 text-sm text-secondary-400">Status</th>
                <th className="text-right px-6 py-4 text-sm text-secondary-400">Action</th>
              </tr></thead>
              <tbody>
                {schedule.payments?.map((p, i) => (
                  <tr key={i} className="border-b border-secondary-700/50 hover:bg-secondary-800/30">
                    <td className="px-6 py-4 text-sm font-medium">{p.paymentNumber}</td>
                    <td className="px-6 py-4 text-sm">{new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">{formatPrice(p.amountDue)}</td>
                    <td className="px-6 py-4 text-right text-sm">{formatPrice(p.amountPaid || 0)}</td>
                    <td className="px-6 py-4 text-center"><span className={`badge ${statusColor(p.status)} flex items-center gap-1 justify-center`}>{statusIcon(p.status)} {p.status}</span></td>
                    <td className="px-6 py-4 text-right">
                      {(p.status === 'due' || p.status === 'overdue') && (
                        <button
                          onClick={() => handlePayNow(p)}
                          disabled={paying === p.paymentNumber}
                          className="text-primary-400 text-sm hover:underline disabled:opacity-50 flex items-center gap-1 justify-end"
                        >
                          {paying === p.paymentNumber ? <><FaSpinner className="animate-spin" /> Processing...</> : 'Pay Now'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Schedule;
