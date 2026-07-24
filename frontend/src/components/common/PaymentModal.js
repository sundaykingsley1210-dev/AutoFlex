import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCreditCard, FaCheckCircle, FaTimesCircle, FaGlobe, FaUniversity } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import StripeCheckout from './StripeCheckout';

const PaymentModal = ({ isOpen, onClose, applicationId, amount, type = 'installment', description, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  useEffect(() => {
    api.get('/stripe/config').then(res => {
      setStripeEnabled(res.data.data?.enabled || false);
    }).catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleMonnifyPay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/initiate', { applicationId, amount, type });
      const { checkoutUrl, apiKey, contractCode, payment } = res.data.data;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (window.MonnifySDK) {
        window.MonnifySDK.initialize({
          amount, currency: 'NGN',
          reference: payment.paymentRef || payment.transactionRef,
          customerFullName: `${user.firstName || 'Customer'} ${user.lastName || ''}`,
          customerEmail: user.email || 'customer@autoflex.com',
          apiKey, contractCode,
          paymentDescription: description || `Payment for ${type}`,
          metadata: { applicationId, paymentType: type },
          onLoadStart: () => {},
          onLoadComplete: () => {},
          onComplete: async (response) => {
            if (response.paymentStatus === 'PAID') {
              setStatus('success');
              toast.success('Payment successful!');
              try { await api.get(`/payments/verify/${payment.transactionRef}`); } catch {}
              if (onPaymentSuccess) onPaymentSuccess();
              setTimeout(() => { setStatus(null); onClose(); }, 2000);
            } else {
              setStatus('failed');
              toast.error('Payment was not completed');
              setTimeout(() => setStatus(null), 3000);
            }
            setLoading(false);
          },
          onClose: (data) => { if (data?.responseCode === 'USER_CANCELLED') toast.info('Payment cancelled'); setLoading(false); }
        });
      } else {
        toast.error('Payment system is loading. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleStripeSuccess = () => {
    setStatus('success');
    if (onPaymentSuccess) onPaymentSuccess();
    setTimeout(() => { setStatus(null); onClose(); }, 2000);
  };

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-secondary-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-secondary-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Make a Payment</h3>
          <button onClick={onClose} className="text-secondary-400 hover:text-white transition"><FaTimes size={20} /></button>
        </div>

        {status === 'success' && (
          <div className="text-center py-8">
            <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">Payment Successful!</p>
            <p className="text-secondary-400">Your payment has been confirmed.</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8">
            <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">Payment Failed</p>
            <p className="text-secondary-400">Please try again.</p>
          </div>
        )}

        {!status && !paymentMethod && (
          <>
            <div className="bg-secondary-800/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary-400 text-sm">Amount</span>
                <span className="text-2xl font-bold text-primary-400">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-400 text-sm">Type</span>
                <span className="text-sm capitalize">{type}</span>
              </div>
              {description && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-secondary-400 text-sm">Description</span>
                  <span className="text-sm text-right max-w-[200px]">{description}</span>
                </div>
              )}
            </div>

            <p className="text-secondary-400 text-sm mb-4 text-center">Choose your payment method:</p>

            <div className="space-y-3">
              {stripeEnabled && (
                <button onClick={() => setPaymentMethod('stripe')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-secondary-600 hover:border-primary-500 hover:bg-primary-600/10 transition text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center"><FaCreditCard className="text-purple-400 text-xl" /></div>
                  <div>
                    <p className="font-semibold">Pay with Card</p>
                    <p className="text-xs text-secondary-400">Visa, Mastercard, AMEX worldwide</p>
                  </div>
                  <FaGlobe className="text-secondary-500 ml-auto" />
                </button>
              )}

              <button onClick={() => setPaymentMethod('monnify')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-secondary-600 hover:border-primary-500 hover:bg-primary-600/10 transition text-left">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center"><FaUniversity className="text-primary-400 text-xl" /></div>
                <div>
                  <p className="font-semibold">Pay with Bank Transfer</p>
                  <p className="text-xs text-secondary-400">Nigerian bank account (NGN)</p>
                </div>
              </button>
            </div>

            <p className="text-xs text-secondary-500 mt-4 text-center">International users: Card payment. Local users: Bank transfer.</p>
          </>
        )}

        {!status && paymentMethod === 'stripe' && (
          <StripeCheckout applicationId={applicationId} amount={amount} type={type} description={description} onSuccess={handleStripeSuccess} onCancel={() => setPaymentMethod(null)} />
        )}

        {!status && paymentMethod === 'monnify' && (
          <>
            <div className="bg-secondary-800/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary-400 text-sm">Amount</span>
                <span className="text-2xl font-bold text-primary-400">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-400 text-sm">Method</span>
                <span className="text-sm">Bank Transfer (NGN)</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-secondary-300">
                <FaUniversity className="text-primary-400" />
                <span>Pay via Nigerian bank transfer through Monnify</span>
              </div>
              <p className="text-xs text-secondary-500">You will be redirected to Monnify secure checkout.</p>
            </div>

            <button onClick={handleMonnifyPay} disabled={loading} className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : `Pay ${formatPrice(amount)}`}
            </button>
            <button onClick={() => setPaymentMethod(null)} className="w-full mt-3 py-2 text-secondary-400 hover:text-white transition text-sm">Back</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
