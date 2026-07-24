import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCar, FaGasPump, FaCog, FaCalendarAlt, FaTachometerAlt, FaPalette, FaCogs, FaHorse, FaArrowLeft, FaCalculator, FaCheck, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import PaymentModal from '../components/common/PaymentModal';

const VehicleDetail = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showDepositPayment, setShowDepositPayment] = useState(false);
  const [depositApplicationId, setDepositApplicationId] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/vehicles/${id}`).then(res => setVehicle(res.data.vehicle || res.data)).catch(() => toast.error('Vehicle not found')).finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>;
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><FaCar className="text-6xl text-secondary-600 mx-auto mb-4" /><h2 className="text-2xl font-bold">Vehicle Not Found</h2><Link to="/vehicles" className="btn-primary mt-4 inline-block">Back to Vehicles</Link></div></div>;

  const schedule = Array.from({ length: vehicle.installmentMonths }, (_, i) => ({
    month: i + 1,
    amount: vehicle.monthlyInstallment,
    dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
  }));

  const specs = [
    { icon: <FaCalendarAlt />, label: 'Year', value: vehicle.year },
    { icon: <FaGasPump />, label: 'Fuel Type', value: vehicle.fuelType },
    { icon: <FaCog />, label: 'Transmission', value: vehicle.transmission },
    { icon: <FaTachometerAlt />, label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A' },
    { icon: <FaPalette />, label: 'Color', value: vehicle.color || 'N/A' },
    { icon: <FaCogs />, label: 'Engine', value: vehicle.engine || 'N/A' },
    { icon: <FaHorse />, label: 'Horsepower', value: vehicle.horsepower ? `${vehicle.horsepower} HP` : 'N/A' },
    { icon: <FaCar />, label: 'Body Type', value: vehicle.bodyType || 'N/A' },
  ];

  const placeholderImages = [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  ];
  const images = vehicle.images?.length > 0 ? vehicle.images : placeholderImages;

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/vehicles" className="inline-flex items-center gap-2 text-secondary-400 hover:text-white transition mb-6"><FaArrowLeft /> Back to Vehicles</Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="card overflow-hidden mb-4">
              <img src={images[activeImg]} alt={vehicle.name} className="w-full h-96 object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`rounded-lg overflow-hidden border-2 transition ${activeImg === i ? 'border-primary-500' : 'border-secondary-700 hover:border-secondary-500'}`}>
                  <img src={img} alt="" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <span className={`badge ${vehicle.availability === 'available' ? 'badge-success' : 'badge-danger'} mb-2`}>{vehicle.availability === 'available' ? 'Available' : 'Sold'}</span>
              <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
              <p className="text-secondary-400">{vehicle.brand} • {vehicle.model} • {vehicle.year}</p>
            </div>

            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Pricing & Financing</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-secondary-400">Total Price</span><span className="text-2xl font-bold text-primary-400">{formatPrice(vehicle.price)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Initial Deposit (10%)</span><span className="font-semibold">{formatPrice(vehicle.depositAmount)}</span></div>
                <div className="flex justify-between"><span className="text-secondary-400">Remaining Balance</span><span className="font-semibold">{formatPrice(vehicle.price - vehicle.depositAmount)}</span></div>
                <div className="border-t border-secondary-700 pt-3">
                  <div className="flex justify-between"><span className="text-secondary-400">Monthly Payment</span><span className="text-xl font-bold text-accent-400">{formatPrice(vehicle.monthlyInstallment)}</span></div>
                  <div className="flex justify-between"><span className="text-secondary-400">Duration</span><span className="font-semibold">{vehicle.installmentMonths} months</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {vehicle.availability === 'available' && (
                <>
                  <button onClick={() => { if (!isAuthenticated) { toast.info('Please login to apply'); navigate('/login'); return; } navigate(`/dashboard/apply/${vehicle._id}`); }} className="btn-primary flex-1">Apply Now</button>
                  <button onClick={() => {
                    if (!isAuthenticated) { toast.info('Please login to apply'); navigate('/login'); return; }
                    navigate(`/dashboard/apply/${vehicle._id}`);
                  }} className="btn-secondary flex-1 flex items-center justify-center gap-2"><FaCreditCard /> Quick Deposit</button>
                </>
              )}
              <Link to={`/calculator?vehicle=${vehicle._id}`} className="btn-secondary flex-1 flex items-center justify-center gap-2"><FaCalculator /> Calculate Payment</Link>
            </div>

            {/* Specs */}
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400">{s.icon}</div>
                    <div><p className="text-xs text-secondary-400">{s.label}</p><p className="font-medium text-sm">{s.value}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm"><FaCheck className="text-accent-400 text-xs" /> {f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Schedule Preview */}
        <div className="mt-12 card p-6">
          <h2 className="text-xl font-bold mb-6">Estimated Payment Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-secondary-700"><th className="text-left py-3 text-sm font-semibold text-secondary-400">Month</th><th className="text-left py-3 text-sm font-semibold text-secondary-400">Due Date</th><th className="text-right py-3 text-sm font-semibold text-secondary-400">Amount</th><th className="text-right py-3 text-sm font-semibold text-secondary-400">Status</th></tr></thead>
              <tbody>
                <tr className="border-b border-secondary-700/50"><td className="py-3 text-sm">Down Payment</td><td className="py-3 text-sm text-secondary-400">Upon Approval</td><td className="py-3 text-right font-semibold text-primary-400">{formatPrice(vehicle.depositAmount)}</td><td className="py-3 text-right"><span className="badge badge-info">Due First</span></td></tr>
                {schedule.slice(0, 6).map(s => (
                  <tr key={s.month} className="border-b border-secondary-700/50"><td className="py-3 text-sm">Month {s.month}</td><td className="py-3 text-sm text-secondary-400">{s.dueDate}</td><td className="py-3 text-right font-semibold">{formatPrice(s.amount)}</td><td className="py-3 text-right"><span className="badge badge-warning">Upcoming</span></td></tr>
                ))}
              </tbody>
            </table>
            {vehicle.installmentMonths > 6 && <p className="text-center text-secondary-400 text-sm mt-4">... and {vehicle.installmentMonths - 6} more months</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;