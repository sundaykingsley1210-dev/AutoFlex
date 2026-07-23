import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaCar, FaGasPump, FaCog, FaCalendarAlt, FaArrowRight, FaSlidersH } from 'react-icons/fa';
import api from '../utils/api';
import Loading from '../components/common/Loading';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 9;

  const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Ford', 'Hyundai', 'Lexus', 'Nissan'];
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Coupe', 'Convertible'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissions = ['Automatic', 'Manual'];

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (brand) params.append('brand', brand);
      if (bodyType) params.append('bodyType', bodyType);
      if (fuelType) params.append('fuelType', fuelType);
      if (transmission) params.append('transmission', transmission);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('sort', sort);
      params.append('page', page);
      params.append('limit', limit);
      const res = await api.get(`/vehicles?${params.toString()}`);
      setVehicles(res.data.vehicles || []);
      setTotal(res.data.total || 0);
    } catch { setVehicles([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, [search, brand, bodyType, fuelType, transmission, minPrice, maxPrice, sort, page]);

  const clearFilters = () => { setSearch(''); setBrand(''); setBodyType(''); setFuelType(''); setTransmission(''); setMinPrice(''); setMaxPrice(''); setPage(1); };

  const formatPrice = (p) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const totalPages = Math.ceil(total / limit);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Brand</label>
        <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1); }} className="input">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" className="input text-sm" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
          <input type="number" className="input text-sm" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
        </div>
      </div>
      <div>
        <label className="label">Body Type</label>
        <select value={bodyType} onChange={e => { setBodyType(e.target.value); setPage(1); }} className="input">
          <option value="">All Types</option>
          {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Fuel Type</label>
        <select value={fuelType} onChange={e => { setFuelType(e.target.value); setPage(1); }} className="input">
          <option value="">All Fuels</option>
          {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Transmission</label>
        <select value={transmission} onChange={e => { setTransmission(e.target.value); setPage(1); }} className="input">
          <option value="">All</option>
          {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button onClick={clearFilters} className="btn-secondary w-full text-sm flex items-center justify-center gap-2"><FaTimes /> Clear Filters</button>
    </div>
  );

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Vehicles</h1>
          <p className="text-secondary-400">Find your perfect car from our extensive collection</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><FaFilter /> Filters</h3>
              <FilterSidebar />
            </div>
          </div>

          <div className="flex-1">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input className="input pl-10" placeholder="Search vehicles..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="input w-auto min-w-[180px]">
                <option value="popularity">Most Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-secondary flex items-center gap-2 text-sm"><FaSlidersH /> Filters</button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden card p-6 mb-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><FaTimes /></button>
                </div>
                <FilterSidebar />
              </div>
            )}

            {/* Results Count */}
            <p className="text-secondary-400 text-sm mb-4">Showing {vehicles.length} of {total} vehicles</p>

            {/* Vehicle Grid */}
            {loading ? <Loading text="Loading vehicles..." /> : vehicles.length === 0 ? (
              <div className="text-center py-20">
                <FaCar className="text-6xl text-secondary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                <p className="text-secondary-400 mb-4">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map(v => (
                  <Link to={`/vehicles/${v._id}`} key={v._id} className="card-hover group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600'} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${v.availability === 'available' ? 'badge-success' : v.availability === 'reserved' ? 'badge-warning' : 'badge-danger'}`}>
                          {v.availability === 'available' ? 'Available' : v.availability === 'reserved' ? 'Reserved' : 'Sold'}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="badge bg-secondary-900/80 text-white">{v.year}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition">{v.name}</h3>
                      <p className="text-secondary-400 text-sm mb-3">{v.brand} • {v.model}</p>
                      <div className="flex items-center gap-4 text-xs text-secondary-400 mb-3">
                        <span className="flex items-center gap-1"><FaCog /> {v.transmission}</span>
                        <span className="flex items-center gap-1"><FaGasPump /> {v.fuelType}</span>
                        <span className="flex items-center gap-1"><FaCalendarAlt /> {v.year}</span>
                      </div>
                      <div className="border-t border-secondary-700 pt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xl font-bold text-primary-400">{formatPrice(v.price)}</p>
                            <p className="text-xs text-secondary-400">Deposit: {formatPrice(v.depositAmount)}</p>
                          </div>
                          <span className="text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">Details <FaArrowRight className="text-xs" /></span>
                        </div>
                        <div className="mt-2 bg-secondary-700/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-secondary-400">Monthly from</p>
                          <p className="text-sm font-bold text-accent-400">{formatPrice(v.monthlyInstallment)}/mo × {v.installmentMonths} months</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg font-medium transition ${page === p ? 'bg-primary-600 text-white' : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;