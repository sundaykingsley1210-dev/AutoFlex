import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaSearch, FaFileAlt, FaCheckCircle, FaShieldAlt, FaMoneyBillWave, FaHeadset, FaClock, FaStar, FaQuoteLeft, FaArrowRight, FaChevronRight } from 'react-icons/fa';
import api from '../utils/api';

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  useEffect(() => {
    api.get('/vehicles?limit=6&sort=popularity').then(res => setFeaturedVehicles(res.data.vehicles || [])).catch(() => {});
  }, []);

  const steps = [
    { icon: <FaSearch className="text-3xl" />, title: 'Browse Vehicles', desc: 'Explore our wide selection of quality vehicles and find your perfect match.' },
    { icon: <FaFileAlt className="text-3xl" />, title: 'Apply for Financing', desc: 'Complete a simple application with your details and preferred payment plan.' },
    { icon: <FaCheckCircle className="text-3xl" />, title: 'Get Approved', desc: 'Our team reviews your application quickly and provides a decision.' },
    { icon: <FaCar className="text-3xl" />, title: 'Drive Away', desc: 'Make your down payment and drive your dream car home today.' },
  ];

  const benefits = [
    { icon: <FaMoneyBillWave />, title: 'Flexible Payments', desc: 'Choose a payment plan that fits your budget with terms from 12 to 48 months.' },
    { icon: <FaClock />, title: 'Fast Approval', desc: 'Get approved within 24-48 hours with our streamlined process.' },
    { icon: <FaShieldAlt />, title: 'Secure Platform', desc: 'Your data and transactions are protected with bank-level security.' },
    { icon: <FaHeadset />, title: '24/7 Support', desc: 'Our dedicated support team is always available to help you.' },
  ];

  const testimonials = [
    { name: 'James Rodriguez', role: 'Business Owner', image: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'AutoFlex made it incredibly easy to get my dream car. The flexible payment plan fits perfectly with my business cash flow. Highly recommended!', rating: 5 },
    { name: 'Sarah Mitchell', role: 'Software Engineer', image: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'The process was smooth from start to finish. I was approved within 24 hours and driving my new car the same week. Amazing service!', rating: 5 },
    { name: 'Michael Chen', role: 'Medical Doctor', image: 'https://randomuser.me/api/portraits/men/67.jpg', text: 'As a young professional, AutoFlex helped me own a car without breaking the bank. The monthly payments are very reasonable. Thank you AutoFlex!', rating: 5 },
  ];

  const faqs = [
    { q: 'How does the financing work?', a: 'You select a vehicle, make an initial deposit (typically 10-30% of the price), and pay the remaining balance in equal monthly installments over your chosen term.' },
    { q: 'What documents do I need?', a: 'You need a valid government-issued ID, proof of address, proof of income (pay slips or bank statements), and employment verification.' },
    { q: 'How long does approval take?', a: 'Most applications are reviewed within 24-48 hours. Once approved, you can make your down payment and take delivery of your vehicle.' },
    { q: 'Can I pay off early?', a: 'Yes! You can make additional payments or pay off your remaining balance at any time without any prepayment penalties.' },
    { q: 'What happens if I miss a payment?', a: 'We offer a 5-day grace period. If payment is not received, a late fee may apply. Contact us immediately if you are having difficulty making a payment.' },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);

  const [openFaq, setOpenFaq] = useState(-1);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-900 to-primary-900/30"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 rounded-full glass text-primary-300 text-sm font-medium mb-6">🚗 America's #1 Car Financing Platform</div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Drive Your <span className="gradient-text">Dream Car.</span><br />Pay Your Way.
            </h1>
            <p className="text-xl text-secondary-300 mb-8 max-w-xl leading-relaxed">
              Own your dream car with flexible installment plans. Low deposits, affordable monthly payments, and a seamless buying experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/vehicles" className="btn-primary flex items-center justify-center gap-2 text-lg">
                Browse Vehicles <FaArrowRight />
              </Link>
              <Link to="/register" className="btn-secondary flex items-center justify-center gap-2 text-lg">
                Get Started <FaChevronRight />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-secondary-900 to-transparent"></div>
      </section>

      {/* Stats */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ num: '500+', label: 'Cars Available' }, { num: '10,000+', label: 'Happy Customers' }, { num: '98%', label: 'Approval Rate' }, { num: '$50B+', label: 'Cars Financed' }].map((s, i) => (
              <div key={i} className="text-center glass rounded-xl p-6">
                <div className="text-3xl md:text-4xl font-black gradient-text mb-2">{s.num}</div>
                <div className="text-secondary-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      {featuredVehicles.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Vehicles</h2>
              <p className="text-secondary-400 max-w-2xl mx-auto">Explore our most popular vehicles available for financing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((v) => (
                <Link to={`/vehicles/${v._id}`} key={v._id} className="card-hover group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600'} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${v.availability === 'available' ? 'badge-success' : 'badge-danger'}`}>
                        {v.availability === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition">{v.name}</h3>
                    <p className="text-secondary-400 text-sm mb-3">{v.year} • {v.transmission} • {v.fuelType}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-bold text-primary-400">{formatPrice(v.price)}</p>
                        <p className="text-xs text-secondary-400">From {formatPrice(v.monthlyInstallment)}/mo</p>
                      </div>
                      <span className="text-primary-400 group-hover:translate-x-1 transition-transform"><FaArrowRight /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/vehicles" className="btn-primary inline-flex items-center gap-2">View All Vehicles <FaArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-secondary-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-secondary-400">Four simple steps to your dream car</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary-600/20 border-2 border-primary-500 flex items-center justify-center text-primary-400 mx-auto mb-4 relative z-10">{s.icon}</div>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-primary-500/30 z-0"></div>}
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-secondary-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AutoFlex?</h2>
            <p className="text-secondary-400">We make car ownership simple and accessible</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="card-hover p-6 text-center group">
                <div className="w-14 h-14 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all text-2xl">{b.icon}</div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-secondary-400 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-secondary-400">Join thousands of satisfied car owners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <FaQuoteLeft className="text-primary-500/30 text-3xl mb-4" />
                <p className="text-secondary-300 mb-6 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} className="text-yellow-400 text-sm" />)}
                </div>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-secondary-400 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-secondary-400">Everything you need to know about AutoFlex</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-secondary-700/50 transition">
                  <span className="font-semibold">{f.q}</span>
                  <FaChevronRight className={`text-secondary-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-secondary-300 text-sm leading-relaxed">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920)', backgroundSize: 'cover' }}></div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Drive Your Dream Car?</h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">Start your journey today with as little as 10% down payment. Browse our selection and find your perfect car.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/vehicles" className="bg-white text-primary-700 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition-all">Browse Vehicles</Link>
                <Link to="/register" className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-all">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
