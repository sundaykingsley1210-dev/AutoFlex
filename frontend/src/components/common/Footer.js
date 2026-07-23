import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-secondary-900 border-t border-secondary-800 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaCar className="text-primary-400 text-2xl" />
            <span className="text-xl font-bold gradient-text">AutoFlex</span>
          </div>
          <p className="text-secondary-400 text-sm leading-relaxed mb-4">Drive your dream car with flexible financing options. We make car ownership accessible and affordable.</p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition"><FaFacebook /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition"><FaTwitter /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition"><FaInstagram /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition"><FaLinkedin /></a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <div className="space-y-2">
            <Link to="/vehicles" className="block text-secondary-400 hover:text-white text-sm transition">Browse Vehicles</Link>
            <Link to="/calculator" className="block text-secondary-400 hover:text-white text-sm transition">Payment Calculator</Link>
            <Link to="/register" className="block text-secondary-400 hover:text-white text-sm transition">Get Started</Link>
            <Link to="/login" className="block text-secondary-400 hover:text-white text-sm transition">Customer Login</Link>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <div className="space-y-2">
            <a href="#" className="block text-secondary-400 hover:text-white text-sm transition">Help Center</a>
            <a href="#" className="block text-secondary-400 hover:text-white text-sm transition">FAQs</a>
            <a href="#" className="block text-secondary-400 hover:text-white text-sm transition">Terms of Service</a>
            <a href="#" className="block text-secondary-400 hover:text-white text-sm transition">Privacy Policy</a>
          </div>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-secondary-400 text-sm"><FaMapMarkerAlt className="text-primary-400" /> 123 Auto Street, Austin, TX 78701</div>
            <div className="flex items-center gap-3 text-secondary-400 text-sm"><FaPhone className="text-primary-400" /> +1 (800) 555-AUTO</div>
            <div className="flex items-center gap-3 text-secondary-400 text-sm"><FaEnvelope className="text-primary-400" /> support@autoflex.com</div>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-800 pt-8 text-center text-secondary-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AutoFlex. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
