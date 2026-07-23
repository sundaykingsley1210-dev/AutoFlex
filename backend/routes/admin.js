const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const PaymentSchedule = require('../models/PaymentSchedule');
const Notification = require('../models/Notification');

router.post('/bootstrap-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const { email } = req.body;
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User promoted to admin', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: 'approved' });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const overduePayments = await PaymentSchedule.aggregate([
      { $unwind: '$payments' },
      { $match: { 'payments.status': 'overdue' } },
      { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: '$payments.amountDue' } } }
    ]);

    const recentApplications = await Application.find()
      .populate('user', 'firstName lastName email')
      .populate('vehicle', 'name brand model year images')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      totalCustomers,
      totalVehicles,
      totalApplications,
      approvedApplications,
      totalRevenue: totalRevenue[0]?.total || 0,
      outstandingBalances: overduePayments[0]?.totalAmount || 0,
      overduePayments: overduePayments[0]?.count || 0,
      recentApplications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

router.get('/customers', protect, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
});

router.get('/applications', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'name brand model year images price depositAmount monthlyInstallment installmentMonths')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
});

router.get('/payments', protect, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .populate('vehicle', 'name brand model year')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
});

router.get('/schedules', protect, adminOnly, async (req, res) => {
  try {
    const schedules = await PaymentSchedule.find()
      .populate('application', 'status')
      .populate('user', 'firstName lastName email')
      .populate({ path: 'application', populate: { path: 'vehicle', select: 'name brand model year' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching schedules' });
  }
});

router.post('/notifications', protect, adminOnly, async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const notification = await Notification.create({ user: userId, type, message });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending notification' });
  }
});

router.post('/vehicles', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating vehicle' });
  }
});

router.put('/vehicles/:id', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating vehicle' });
  }
});

router.delete('/vehicles/:id', protect, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.status(200).json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting vehicle' });
  }
});

module.exports = router;
