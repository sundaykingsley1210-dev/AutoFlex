const express = require('express');
const router = express.Router();
const { submitApplication, getMyApplications, getApplication, getAllApplications, reviewApplication, updateApplicationStatus, uploadDocuments } = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.get('/my', protect, getMyApplications);
router.get('/', protect, adminOnly, getAllApplications);
router.get('/:id', protect, getApplication);
router.post('/', protect, submitApplication);
router.post('/:id/documents', protect, uploadMultiple('documents', 5), uploadDocuments);
router.put('/:id/review', protect, adminOnly, reviewApplication);
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);

module.exports = router;
