const mongoose = require('mongoose');

const paymentScheduleSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payments: [{
    paymentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'due', 'paid', 'overdue'],
      default: 'upcoming'
    },
    paidAt: { type: Date },
    transactionRef: { type: String }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  remainingBalance: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentSchedule', paymentScheduleSchema);
