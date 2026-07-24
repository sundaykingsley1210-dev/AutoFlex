import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const transactionRef = searchParams.get('transactionRef') || searchParams.get('paymentRef');
    if (!transactionRef) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/payments/verify/${transactionRef}`);
        if (res.data.verified) {
          setStatus('success');
          setPaymentData(res.data.payment);
        } else if (res.data.payment?.status === 'failed') {
          setStatus('failed');
          setPaymentData(res.data.payment);
        } else {
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            try {
              const pollRes = await api.get(`/payments/verify/${transactionRef}`);
              if (pollRes.data.verified) {
                clearInterval(poll);
                setStatus('success');
                setPaymentData(pollRes.data.payment);
              } else if (pollRes.data.payment?.status === 'failed' || attempts >= 10) {
                clearInterval(poll);
                setStatus(pollRes.data.payment?.status === 'failed' ? 'failed' : 'timeout');
                setPaymentData(pollRes.data.payment);
              }
            } catch {
              if (attempts >= 10) {
                clearInterval(poll);
                setStatus('timeout');
              }
            }
          }, 3000);
        }
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [searchParams]);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {status === 'verifying' && (
            <>
              <FaSpinner className="text-6xl text-primary-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-secondary-400">Please wait while we confirm your payment...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-secondary-400 mb-4">Your payment has been confirmed.</p>
              {paymentData && (
                <div className="bg-secondary-800/50 rounded-lg p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-secondary-400">Amount</span><span className="font-semibold">{formatPrice(paymentData.amount)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-secondary-400">Type</span><span className="capitalize">{paymentData.type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-secondary-400">Reference</span><span className="font-mono text-xs">{paymentData.transactionRef}</span></div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">Go to Dashboard <FaArrowRight /></Link>
                <Link to="/dashboard/payments" className="btn-secondary">View Payment History</Link>
              </div>
            </>
          )}
          {(status === 'failed' || status === 'error') && (
            <>
              <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-secondary-400 mb-6">Your payment could not be processed. Please try again.</p>
              <div className="flex flex-col gap-3">
                <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">Back to Dashboard <FaArrowRight /></Link>
                <Link to="/dashboard/payments" className="btn-secondary">View Payment History</Link>
              </div>
            </>
          )}
          {status === 'timeout' && (
            <>
              <FaSpinner className="text-6xl text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
              <p className="text-secondary-400 mb-6">Your payment is being processed. It may take a few minutes to confirm. Check your payment history shortly.</p>
              <div className="flex flex-col gap-3">
                <Link to="/dashboard/payments" className="btn-primary flex items-center justify-center gap-2">Check Payment History <FaArrowRight /></Link>
                <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
