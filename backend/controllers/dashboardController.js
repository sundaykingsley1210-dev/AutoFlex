const Vehicle = require('../models/Vehicle');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const PaymentSchedule = require('../models/PaymentSchedule');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ user: userId })
      .populate('vehicle', 'name brand model year images price')
      .sort({ createdAt: -1 });

    const activeApplication = applications.find(app => app.status === 'active' || app.status === 'approved');

    let nextPayment = null;
    let paymentProgress = 0;

    if (activeApplication) {
      const schedule = await PaymentSchedule.findOne({ application: activeApplication._id });
      if (schedule) {
        const upcoming = schedule.payments.find(p => p.status === 'upcoming' || p.status === 'due');
        if (upcoming) {
          nextPayment = {
            amount: upcoming.amountDue,
            dueDate: upcoming.dueDate,
            paymentNumber: upcoming.paymentNumber
          };
        }
        paymentProgress = schedule.totalAmount > 0
          ? Math.round((schedule.totalPaid / schedule.totalAmount) * 100)
          : 0;
      }
    }

    const payments = await Payment.find({ user: userId })
      .populate('vehicle', 'name brand model images')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalPaidAgg = await Payment.aggregate([
      { $match: { user: userId, status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const featuredVehicles = await Vehicle.find({ availability: 'available' })
      .sort({ popularity: -1 })
      .limit(4);

    const activeVehicle = activeApplication ? activeApplication.vehicle : null;
    const totalPaidAmount = totalPaidAgg[0]?.total || 0;
    const remainingBalance = activeVehicle ? activeVehicle.price - totalPaidAmount : 0;

    res.status(200).json({
      success: true,
      vehicle: activeVehicle,
      totalPaid: totalPaidAmount,
      remainingBalance,
      nextPayment,
      paymentProgress,
      recentPayments: payments,
      featuredVehicles
    });
  } catch (error) {
    console.error('Get customer dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ availability: 'available' });

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalApplications = applicationsByStatus.reduce((sum, item) => sum + item.count, 0);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
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

    const recentPayments = await Payment.find({ status: 'successful' })
      .populate('user', 'firstName lastName email')
      .populate('vehicle', 'name brand model')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      totalCustomers,
      totalVehicles,
      availableVehicles,
      totalApplications,
      approvedApplications: applicationsByStatus.find(s => s._id === 'approved')?.count || 0,
      applicationsByStatus,
      totalRevenue: totalRevenue[0]?.total || 0,
      outstandingBalances: overduePayments[0]?.totalAmount || 0,
      monthlyRevenue,
      overduePayments: overduePayments[0]?.count || 0,
      recentApplications,
      recentPayments
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin dashboard' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    const total = await Notification.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { isRead: true });
    }

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};
