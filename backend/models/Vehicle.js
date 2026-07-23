const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1990,
    max: 2030
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  depositAmount: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: 0
  },
  monthlyInstallment: {
    type: Number,
    required: [true, 'Monthly installment is required'],
    min: 0
  },
  installmentMonths: {
    type: Number,
    required: [true, 'Installment months is required'],
    min: 1,
    max: 60
  },
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'truck', 'van', 'convertible'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual'],
    required: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  mileage: {
    type: Number,
    min: 0,
    default: 0
  },
  engine: {
    type: String,
    trim: true
  },
  horsepower: {
    type: Number,
    min: 0
  },
  features: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  description: {
    type: String,
    trim: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

vehicleSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
