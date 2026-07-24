import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const StripeCheckoutForm = ({ applicationId, amount, type, description, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/callback`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      const res = await api.post('/stripe/confirm', { paymentIntentId: paymentIntentIdRef.current });
      if (res.data.data?.verified) {
        setStatus('success');
        toast.success('Payment successful!');
        setTimeout(() => onSuccess?.(), 2000);
      } else {
        setStatus('pending');
        toast.info('Payment is being processed...');
        setTimeout(() => onSuccess?.(), 3000);
      }
    } catch (err) {
      toast.error('Payment verification failed');
    }
    setLoading(false);
  };

  const [clientSecret, setClientSecret] = useState(null);
  const paymentIntentIdRef = React.useRef(null);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const res = await api.post('/stripe/create-payment-intent', {
          applicationId, amount, currency: 'usd', type
        });
        setClientSecret(res.data.data.clientSecret);
        paymentIntentIdRef.current = res.data.data.paymentIntentId;
      } catch (err) {
        toast.error('Failed to initialize payment');
      }
    };
    createIntent();
  }, [applicationId, amount, type]);

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
        <p className="text-xl font-bold mb-2">Payment Successful!</p>
        <p className="text-secondary-400">Your payment has been confirmed.</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="text-4xl text-primary-400 mx-auto mb-3 animate-spin" />
        <p className="text-secondary-400">Initializing payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-secondary-800/50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-secondary-400 text-sm">Amount</span>
          <span className="text-2xl font-bold text-primary-400">${amount.toLocaleString()}</span>
        </div>
        {description && (
          <div className="flex justify-between items-center">
            <span className="text-secondary-400 text-sm">Description</span>
            <span className="text-sm text-right">{description}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : `Pay $${amount.toLocaleString()}`}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel} className="w-full mt-3 py-2 text-secondary-400 hover:text-white transition text-sm">
          Cancel
        </button>
      )}
    </form>
  );
};

const StripeCheckout = ({ applicationId, amount, type, description, onSuccess, onCancel }) => {
  const [publishableKey, setPublishableKey] = useState(null);

  useEffect(() => {
    api.get('/stripe/config').then(res => {
      if (res.data.data?.publishableKey) {
        setPublishableKey(res.data.data.publishableKey);
      }
    }).catch(() => {});
  }, []);

  if (!publishableKey) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="text-4xl text-primary-400 mx-auto mb-3 animate-spin" />
        <p className="text-secondary-400">Loading payment system...</p>
      </div>
    );
  }

  return (
    <Elements stripe={loadStripe(publishableKey)} options={{ appearance: { theme: 'night', variables: { colorPrimary: '#3b82f6', colorBackground: '#1e293b', colorText: '#f8fafc', colorDanger: '#ef4444', borderRadius: '12px' } } }}>
      <StripeCheckoutForm applicationId={applicationId} amount={amount} type={type} description={description} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default StripeCheckout;
