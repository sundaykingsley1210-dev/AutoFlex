const Vehicle = require('../models/Vehicle');

exports.getAllVehicles = async (req, res) => {
  try {
    const { search, brand, bodyType, fuelType, transmission, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    if (req.query.availability) {
      query.availability = req.query.availability;
    } else if (!req.user || req.user.role !== 'admin') {
      query.availability = 'available';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (bodyType) query.bodyType = { $regex: `^${bodyType}$`, $options: 'i' };
    if (fuelType) query.fuelType = { $regex: `^${fuelType}$`, $options: 'i' };
    if (transmission) query.transmission = { $regex: `^${transmission}$`, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const vehicles = await Vehicle.find(query).sort(sortOptions).skip(skip).limit(Number(limit));
    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
      success: true,
      vehicles,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vehicles' });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle.popularity += 1;
    await vehicle.save();

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vehicle' });
  }
};

exports.getFeaturedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ availability: 'available' })
      .sort({ popularity: -1, createdAt: -1 })
      .limit(8);

    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Get featured vehicles error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching featured vehicles' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error creating vehicle' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error updating vehicle' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting vehicle' });
  }
};
