import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/customer/Dashboard';
import Payments from './pages/customer/Payments';
import Applications from './pages/customer/Applications';
import ApplyVehicle from './pages/customer/ApplyVehicle';
import Notifications from './pages/customer/Notifications';
import Profile from './pages/customer/Profile';
import Schedule from './pages/customer/Schedule';
import PaymentCallback from './pages/customer/PaymentCallback';
import CustomerLayout from './components/customer/CustomerLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminVehicleForm from './pages/admin/AdminVehicleForm';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  return (
    <Router>
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/dashboard" element={<ProtectedRoute><CustomerLayout><Dashboard /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><CustomerLayout><Payments /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/applications" element={<ProtectedRoute><CustomerLayout><Applications /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/apply/:vehicleId" element={<ProtectedRoute><CustomerLayout><ApplyVehicle /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute><CustomerLayout><Notifications /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><CustomerLayout><Profile /></CustomerLayout></ProtectedRoute>} />
            <Route path="/dashboard/schedule/:applicationId" element={<ProtectedRoute><CustomerLayout><Schedule /></CustomerLayout></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/vehicles" element={<AdminRoute><AdminVehicles /></AdminRoute>} />
            <Route path="/admin/vehicles/new" element={<AdminRoute><AdminVehicleForm /></AdminRoute>} />
            <Route path="/admin/vehicles/:id/edit" element={<AdminRoute><AdminVehicleForm /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
            <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
            <Route path="/admin/schedules" element={<AdminRoute><AdminSchedules /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </div>
    </AuthProvider>
    </Router>
  );
}

export default App;
