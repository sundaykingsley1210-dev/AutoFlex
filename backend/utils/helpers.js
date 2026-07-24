const { v4: uuidv4 } = require('uuid');

const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `AFX-${timestamp}-${random}`;
};

const generatePaymentSchedule = (application) => {
  const { installmentMonths, monthlyPayment, totalAmount, depositAmount, createdAt } = application;
  const payments = [];
  const startDate = new Date(createdAt);
  let totalPaid = 0;

  for (let i = 1; i <= installmentMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const amountDue = i === installmentMonths
      ? totalAmount - depositAmount - (monthlyPayment * (installmentMonths - 1))
      : monthlyPayment;

    const now = new Date();
    let status = 'upcoming';
    if (dueDate < now) {
      status = 'overdue';
    } else if (dueDate.toDateString() === now.toDateString() || (dueDate < now && dueDate.getDate() === now.getDate())) {
      status = 'due';
    }

    payments.push({
      paymentNumber: i,
      dueDate,
      amountDue: Math.round(amountDue * 100) / 100,
      amountPaid: 0,
      status,
      paidAt: null,
      transactionRef: null
    });
  }

  return {
    payments,
    totalAmount: totalAmount - depositAmount,
    totalPaid: 0,
    remainingBalance: totalAmount - depositAmount
  };
};

const calculateMonthlyPayment = (price, deposit, months) => {
  const financeAmount = price - deposit;
  if (months <= 0) return financeAmount;
  return Math.round((financeAmount / months) * 100) / 100;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

module.exports = {
  generateTransactionRef,
  generatePaymentSchedule,
  calculateMonthlyPayment,
  formatDate,
  formatCurrency
};
