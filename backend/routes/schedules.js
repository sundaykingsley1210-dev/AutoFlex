const express = require('express');
const router = express.Router();
const { getSchedule, updateSchedule } = require('../controllers/scheduleController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:applicationId', protect, getSchedule);
router.put('/update', protect, adminOnly, updateSchedule);

module.exports = router;
