const Application = require('../models/Application');
const Vehicle = require('../models/Vehicle');
const PaymentSchedule = require('../models/PaymentSchedule');
const Notification = require('../models/Notification');
const { generatePaymentSchedule } = require('../utils/helpers');

exports.submitApplication = async (req, res) => {
  try {
    const { vehicleId, paymentPlan, documents } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.availability !== 'available') {
      return res.status(400).json({ success: false, message: 'Vehicle is not available' });
    }

    const application = await Application.create({
      user: req.user._id,
      vehicle: vehicleId,
      depositAmount: vehicle.depositAmount,
      totalAmount: vehicle.price,
      monthlyPayment: vehicle.monthlyInstallment,
      installmentMonths: vehicle.installmentMonths,
      paymentPlan: paymentPlan || 'monthly',
      documents: documents || []
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting application' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('vehicle', 'name brand model year images price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'name brand model year images price depositAmount monthlyInstallment installmentMonths')
      .populate('approvedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching application' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'name brand model year images price')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const application = await Application.findById(req.params.id).populate('vehicle');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.approvedBy = req.user._id;
    application.approvedAt = new Date();

    if (status === 'rejected') {
      application.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      const vehicle = await Vehicle.findById(application.vehicle._id);
      vehicle.availability = 'reserved';
      await vehicle.save();

      const scheduleData = {
        installmentMonths: application.installmentMonths,
        monthlyPayment: application.monthlyPayment,
        totalAmount: application.totalAmount,
        depositAmount: application.depositAmount,
        createdAt: application.createdAt
      };

      const scheduleResult = generatePaymentSchedule(scheduleData);

      await PaymentSchedule.create({
        application: application._id,
        user: application.user,
        ...scheduleResult
      });
    }

    await application.save();

    await Notification.create({
      user: application.user,
      type: 'application_update',
      message: status === 'approved'
        ? `Your application for ${application.vehicle.name} has been approved!`
        : `Your application for ${application.vehicle.name} has been ${status}.`,
      link: `/applications/${application._id}`
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ success: false, message: 'Server error reviewing application' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('vehicle');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status === 'completed' && application.vehicle) {
      await Vehicle.findByIdAndUpdate(application.vehicle._id, { availability: 'sold' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating application status' });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const uploadedFiles = (req.files || []).map(file => ({
      name: file.originalname,
      url: `/uploads/documents/${file.filename}`
    }));

    application.documents = [...(application.documents || []), ...uploadedFiles];
    await application.save();

    res.status(200).json({ success: true, message: 'Documents uploaded successfully', data: { documents: application.documents } });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading documents' });
  }
};
