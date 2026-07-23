import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCalculator as FaCalc, FaMoneyBillWave, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import api from '../utils/api';
import Loading from '../components/common/Loading';

const Calculator = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [depositPercent, setDepositPercent] = useState(10);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    api.get('/vehicles?limit=50&availability=available').then(res => {
      const vList = res.data.vehicles || [];
      setVehicles(vList);
      const vId = searchParams.get('vehicle');
      if (vId) { const found = vList.find(v => v._id === vId); if (found) setSelectedVehicle(found); }
      if (vList.length > 0 && !selectedVehicle) setSelectedVehicle(vList[0]);
    }).catch(() => {});
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  if (!selectedVehicle) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;

  const price = selectedVehicle.price;
  const deposit = Math.round(price * depositPercent / 100);
  const balance = price - deposit;
  const monthly = Math.ceil(balance / months);
  const totalPayable = deposit + (monthly * months);

  const schedule = Array.from({ length: months }, (_, i) => {
    const due = new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000);
    return { num: i + 1, date: due.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }), amount: monthly };
  });

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FaCalc className="text-primary-400 text-4xl mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Payment Calculator</h1>
          <p className="text-secondary-400 max-w-xl mx-auto">Calculate your monthly payments and plan your financing</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Select Vehicle</h2>
              <select value={selectedVehicle?._id || ''} onChange={e => setSelectedVehicle(vehicles.find(v => v._id === e.target.value))} className="input">
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} - {formatPrice(v.price)}</option>)}
              </select>
            </div>
            <div className="card p-6">
              <div className="relative mb-4">
                <img src={selectedVehicle.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400'} alt={selectedVehicle.name} className="w-full h-40 object-cover rounded-lg" />
              </div>
              <h3 className="font-bold text-lg">{selectedVehicle.name}</h3>
              <p className="text-secondary-400 text-sm">{selectedVehicle.year} • {selectedVehicle.transmission}</p>
              <p className="text-primary-400 font-bold text-xl mt-2">{formatPrice(selectedVehicle.price)}</p>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Down Payment</h2>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2"><span className="text-secondary-400">Deposit: {depositPercent}%</span><span className="font-semibold">{formatPrice(deposit)}</span></div>
                <input type="range" min="5" max="50" step="5" value={depositPercent} onChange={e => setDepositPercent(Number(e.target.value))} className="w-full accent-primary-500" />
                <div className="flex justify-between text-xs text-secondary-500 mt-1"><span>5%</span><span>50%</span></div>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Repayment Duration</h2>
              <div className="grid grid-cols-2 gap-2">
                {[12, 24, 36, 48].map(o => (
                  <button key={o} onClick={() => setMonths(o)} className={`py-3 rounded-lg font-semibold transition ${months === o ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'}`}>{o} months</button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-5 text-center"><FaMoneyBillWave className="text-primary-400 text-2xl mx-auto mb-2" /><p className="text-xs text-secondary-400 mb-1">Remaining Balance</p><p className="text-xl font-bold">{formatPrice(balance)}</p></div>
              <div className="card p-5 text-center border-primary-500/50"><FaCalendarAlt className="text-accent-400 text-2xl mx-auto mb-2" /><p className="text-xs text-secondary-400 mb-1">Monthly Payment</p><p className="text-2xl font-black text-primary-400">{formatPrice(monthly)}</p></div>
              <div className="card p-5 text-center"><FaChartLine className="text-yellow-400 text-2xl mx-auto mb-2" /><p className="text-xs text-secondary-400 mb-1">Total Payable</p><p className="text-xl font-bold">{formatPrice(totalPayable)}</p></div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Payment Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-secondary-400">Vehicle Price</span><span className="font-semibold">{formatPrice(price)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Down Payment ({depositPercent}%)</span><span className="text-accent-400 font-semibold">-{formatPrice(deposit)}</span></div>
                <div className="flex justify-between border-t border-secondary-700 pt-3"><span className="text-secondary-400">Amount to Finance</span><span className="font-semibold">{formatPrice(balance)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Duration</span><span className="font-semibold">{months} months</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Monthly Payment</span><span className="text-lg font-bold text-primary-400">{formatPrice(monthly)}</span></div>
                <div className="flex justify-between border-t border-secondary-700 pt-3"><span className="text-white font-semibold">Total Amount Payable</span><span className="text-lg font-bold gradient-text">{formatPrice(totalPayable)}</span></div>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Payment Schedule</h2>
              <div className="max-h-96 overflow-y-auto">
                <div className="flex justify-between py-3 border-b border-secondary-700 text-sm font-semibold text-secondary-400"><span>Down Payment</span><span>Upon Approval</span><span className="text-primary-400">{formatPrice(deposit)}</span></div>
                {schedule.map(s => (
                  <div key={s.num} className="flex justify-between py-3 border-b border-secondary-700/50 text-sm"><span className="text-secondary-300">Month {s.num}</span><span className="text-secondary-400">{s.date}</span><span className="font-medium">{formatPrice(s.amount)}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
