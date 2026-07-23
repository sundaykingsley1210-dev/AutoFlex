const express = require('express');
const router = express.Router();
const { getCustomerDashboard, getAdminDashboard, getNotifications, markNotificationRead } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/customer', protect, getCustomerDashboard);
router.get('/admin', protect, adminOnly, getAdminDashboard);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
