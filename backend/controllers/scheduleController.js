const PaymentSchedule = require('../models/PaymentSchedule');
const Notification = require('../models/Notification');

exports.getSchedule = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const schedule = await PaymentSchedule.findOne({ application: applicationId })
      .populate('application', 'status vehicle')
      .populate('user', 'firstName lastName email');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Payment schedule not found' });
    }

    if (schedule.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching schedule' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { scheduleId, paymentNumber, status, amountPaid, transactionRef } = req.body;

    const schedule = await PaymentSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const payment = schedule.payments.find(p => p.paymentNumber === paymentNumber);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found in schedule' });
    }

    if (status) payment.status = status;
    if (amountPaid !== undefined) {
      payment.amountPaid = amountPaid;
      if (amountPaid >= payment.amountDue) {
        payment.status = 'paid';
        payment.paidAt = new Date();
      }
    }
    if (transactionRef) payment.transactionRef = transactionRef;

    schedule.totalPaid = schedule.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    schedule.remainingBalance = schedule.totalAmount - schedule.totalPaid;

    await schedule.save();

    await Notification.create({
      user: schedule.user,
      type: 'schedule_update',
      message: `Payment #${paymentNumber} status updated to ${payment.status}`,
      link: `/schedule/${schedule._id}`
    });

    res.status(200).json({ success: true, schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error updating schedule' });
  }
};
