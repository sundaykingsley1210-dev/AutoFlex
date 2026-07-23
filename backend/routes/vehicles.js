const express = require('express');
const router = express.Router();
const { getAllVehicles, getVehicle, getFeaturedVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/featured', getFeaturedVehicles);
router.get('/', getAllVehicles);
router.get('/:id', getVehicle);

router.post('/', protect, adminOnly, createVehicle);
router.put('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

module.exports = router;
