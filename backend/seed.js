const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Application = require('./models/Application');
const Payment = require('./models/Payment');
const PaymentSchedule = require('./models/PaymentSchedule');
const Notification = require('./models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

const seedData = async () => {
  try {
    await connectDB();

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already seeded. Skipping...');
      mongoose.connection.close();
      return;
    }

    console.log('Cleared existing data');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'AutoFlex',
      email: 'admin@autoflex.com',
      password: 'admin123',
      phone: '+2348012345678',
      role: 'admin',
      address: { street: '123 Admin Street', city: 'Lagos', state: 'Lagos', zipCode: '100001', country: 'Nigeria' },
      isVerified: true
    });

    const customers = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+2348023456789',
        role: 'customer',
        address: { street: '45 Victoria Island', city: 'Lagos', state: 'Lagos', zipCode: '101001', country: 'Nigeria' },
        identification: { type: 'drivers_license', number: 'DL-12345678' },
        employment: { employer: 'Tech Corp', position: 'Software Engineer', monthlyIncome: 500000 },
        isVerified: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+2348034567890',
        role: 'customer',
        address: { street: '78 Ikeja GRA', city: 'Lagos', state: 'Lagos', zipCode: '100271', country: 'Nigeria' },
        identification: { type: 'nin', number: 'NIN-87654321' },
        employment: { employer: 'Finance Ltd', position: 'Accountant', monthlyIncome: 350000 },
        isVerified: true
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        password: 'password123',
        phone: '+2348045678901',
        role: 'customer',
        address: { street: '12 Abuja Phase 1', city: 'Abuja', state: 'FCT', zipCode: '900001', country: 'Nigeria' },
        identification: { type: 'passport', number: 'AB1234567' },
        employment: { employer: 'Oil Company', position: 'Engineer', monthlyIncome: 800000 },
        isVerified: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@example.com',
        password: 'password123',
        phone: '+2348056789012',
        role: 'customer',
        address: { street: '56 Port Harcourt Road', city: 'Port Harcourt', state: 'Rivers', zipCode: '500001', country: 'Nigeria' },
        identification: { type: 'voters_card', number: 'VC-11223344' },
        employment: { employer: 'Hospital', position: 'Doctor', monthlyIncome: 700000 },
        isVerified: true
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david@example.com',
        password: 'password123',
        phone: '+2348067890123',
        role: 'customer',
        address: { street: '89 Kano Road', city: 'Kano', state: 'Kano', zipCode: '700001', country: 'Nigeria' },
        identification: { type: 'drivers_license', number: 'DL-98765432' },
        employment: { employer: 'Manufacturing Co', position: 'Manager', monthlyIncome: 450000 },
        isVerified: true
      }
    ]);

    console.log('Created admin and customers');

    const vehicles = await Vehicle.insertMany([
      {
        name: 'Toyota Camry 2024',
        brand: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 35000000,
        depositAmount: 5000000,
        monthlyInstallment: 875000,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Silver',
        mileage: 15000,
        engine: '2.5L 4-Cylinder',
        horsepower: 203,
        features: ['Leather Seats', 'Sunroof', 'Apple CarPlay', 'Blind Spot Monitor', 'Adaptive Cruise Control'],
        images: ['/uploads/images/toyota-camry-1.jpg', '/uploads/images/toyota-camry-2.jpg'],
        availability: 'available',
        description: 'The Toyota Camry 2024 offers a perfect blend of comfort, reliability, and modern technology. With its sleek design and advanced safety features, it is ideal for both city driving and long journeys.',
        popularity: 85
      },
      {
        name: 'Honda CR-V 2024',
        brand: 'Honda',
        model: 'CR-V',
        year: 2024,
        price: 42000000,
        depositAmount: 6000000,
        monthlyInstallment: 1050000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Black',
        mileage: 12000,
        engine: '1.5L Turbo',
        horsepower: 190,
        features: ['All-Wheel Drive', 'Panoramic Roof', 'Wireless Charging', 'Heated Seats', 'Honda Sensing'],
        images: ['/uploads/images/honda-cr-v-1.jpg', '/uploads/images/honda-cr-v-2.jpg'],
        availability: 'available',
        description: 'The Honda CR-V 2024 combines spacious interior with impressive fuel efficiency. Perfect for families seeking comfort and versatility.',
        popularity: 78
      },
      {
        name: 'BMW 3 Series 2024',
        brand: 'BMW',
        model: '3 Series',
        year: 2024,
        price: 65000000,
        depositAmount: 10000000,
        monthlyInstallment: 1625000,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'White',
        mileage: 8000,
        engine: '2.0L TwinPower Turbo',
        horsepower: 255,
        features: ['M Sport Package', 'Harman Kardon Sound', 'Head-Up Display', 'Gesture Control', 'Wireless Apple CarPlay'],
        images: ['/uploads/images/bmw-3-series-1.jpg', '/uploads/images/bmw-3-series-2.jpg'],
        availability: 'available',
        description: 'The BMW 3 Series 2024 delivers dynamic performance with luxurious comfort. Experience the ultimate driving machine.',
        popularity: 92
      },
      {
        name: 'Mercedes-Benz C-Class 2024',
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2024,
        price: 72000000,
        depositAmount: 12000000,
        monthlyInstallment: 1800000,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Midnight Blue',
        mileage: 5000,
        engine: '2.0L Turbo',
        horsepower: 258,
        features: ['MBUX System', 'Burmester Sound', 'Ambient Lighting', 'Air Suspension', 'Driver Assistance Package'],
        images: ['/uploads/images/mercedes-c-class-1.jpg', '/uploads/images/mercedes-c-class-2.jpg'],
        availability: 'available',
        description: 'The Mercedes-Benz C-Class 2024 sets new standards in luxury and innovation. A masterpiece of engineering.',
        popularity: 95
      },
      {
        name: 'Ford Explorer 2024',
        brand: 'Ford',
        model: 'Explorer',
        year: 2024,
        price: 48000000,
        depositAmount: 7000000,
        monthlyInstallment: 1200000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Red',
        mileage: 18000,
        engine: '2.3L EcoBoost',
        horsepower: 300,
        features: ['Three-Row Seating', 'SYNC 4', '360 Camera', 'Towing Package', 'Ford Co-Pilot360'],
        images: ['/uploads/images/ford-explorer-1.jpg', '/uploads/images/ford-explorer-2.jpg'],
        availability: 'available',
        description: 'The Ford Explorer 2024 is built for adventure with its powerful engine and spacious interior. Perfect for large families.',
        popularity: 72
      },
      {
        name: 'Hyundai Tucson 2024',
        brand: 'Hyundai',
        model: 'Tucson',
        year: 2024,
        price: 32000000,
        depositAmount: 5000000,
        monthlyInstallment: 800000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'hybrid',
        transmission: 'automatic',
        color: 'Green',
        mileage: 10000,
        engine: '1.6L Hybrid',
        horsepower: 180,
        features: ['Hybrid Powertrain', 'Digital Cockpit', 'Smart Parking', 'Highway Driving Assist', 'Blind-Spot View Monitor'],
        images: ['/uploads/images/hyundai-tucson-1.jpg', '/uploads/images/hyundai-tucson-2.jpg'],
        availability: 'available',
        description: 'The Hyundai Tucson 2024 Hybrid combines eco-friendly driving with cutting-edge technology and bold design.',
        popularity: 68
      },
      {
        name: 'Toyota RAV4 2024',
        brand: 'Toyota',
        model: 'RAV4',
        year: 2024,
        price: 38000000,
        depositAmount: 5500000,
        monthlyInstallment: 950000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'hybrid',
        transmission: 'automatic',
        color: 'Pearl White',
        mileage: 14000,
        engine: '2.5L Hybrid',
        horsepower: 219,
        features: ['Electronic On-Demand AWD', 'Toyota Safety Sense', 'Wireless Charging', 'JBL Audio', 'Panoramic Moonroof'],
        images: ['/uploads/images/toyota-rav4-1.jpg', '/uploads/images/toyota-rav4-2.jpg'],
        availability: 'available',
        description: 'The Toyota RAV4 2024 Hybrid delivers exceptional fuel efficiency without compromising on capability or style.',
        popularity: 82
      },
      {
        name: 'Honda Civic 2024',
        brand: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 28000000,
        depositAmount: 4000000,
        monthlyInstallment: 700000,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Grey',
        mileage: 20000,
        engine: '1.5L Turbo',
        horsepower: 180,
        features: ['Honda Sensing', 'Bose Premium Audio', 'Wireless Apple CarPlay', 'Dual-Zone Climate', 'Sport Mode'],
        images: ['/uploads/images/honda-civic-1.jpg', '/uploads/images/honda-civic-2.jpg'],
        availability: 'available',
        description: 'The Honda Civic 2024 offers a sporty driving experience with refined comfort and advanced technology.',
        popularity: 70
      },
      {
        name: 'BMW X5 2024',
        brand: 'BMW',
        model: 'X5',
        year: 2024,
        price: 85000000,
        depositAmount: 15000000,
        monthlyInstallment: 2125000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Alpine White',
        mileage: 6000,
        engine: '3.0L Inline-6 Turbo',
        horsepower: 335,
        features: ['xDrive AWD', 'Sky Lounge Panoramic Roof', 'Bowers & Wilkins Sound', 'Gesture Control', 'Remote 3D View'],
        images: ['/uploads/images/bmw-x5-1.jpg', '/uploads/images/bmw-x5-2.jpg'],
        availability: 'available',
        description: 'The BMW X5 2024 combines commanding presence with uncompromising luxury and performance.',
        popularity: 88
      },
      {
        name: 'Mercedes-Benz GLC 2024',
        brand: 'Mercedes-Benz',
        model: 'GLC',
        year: 2024,
        price: 78000000,
        depositAmount: 13000000,
        monthlyInstallment: 1950000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Obsidian Black',
        mileage: 7000,
        engine: '2.0L Turbo',
        horsepower: 258,
        features: ['4MATIC AWD', 'MBUX Infotainment', 'Burmester Surround Sound', 'Head-Up Display', 'Air Body Control'],
        images: ['/uploads/images/mercedes-glc-1.jpg', '/uploads/images/mercedes-glc-2.jpg'],
        availability: 'available',
        description: 'The Mercedes-Benz GLC 2024 redefines the luxury SUV segment with its perfect balance of comfort and performance.',
        popularity: 80
      },
      {
        name: 'Ford Mustang 2024',
        brand: 'Ford',
        model: 'Mustang',
        year: 2024,
        price: 55000000,
        depositAmount: 8000000,
        monthlyInstallment: 1375000,
        installmentMonths: 36,
        bodyType: 'coupe',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Grabber Blue',
        mileage: 3000,
        engine: '5.0L V8',
        horsepower: 480,
        features: ['Performance Package', 'MagnaRide Suspension', 'B&O Sound System', 'Track Apps', 'Line Lock'],
        images: ['/uploads/images/ford-mustang-1.jpg', '/uploads/images/ford-mustang-2.jpg'],
        availability: 'available',
        description: 'The Ford Mustang 2024 delivers iconic American muscle with modern technology and unmatched performance.',
        popularity: 90
      },
      {
        name: 'Hyundai Elantra 2024',
        brand: 'Hyundai',
        model: 'Elantra',
        year: 2024,
        price: 25000000,
        depositAmount: 4000000,
        monthlyInstallment: 625000,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Electric Shadow',
        mileage: 16000,
        engine: '2.0L Atkinson Cycle',
        horsepower: 147,
        features: ['SmartSense Safety', 'Wireless Android Auto', 'Digital Key', 'Driver Attention Warning', 'Lane Following Assist'],
        images: ['/uploads/images/hyundai-elantra-1.jpg', '/uploads/images/hyundai-elantra-2.jpg'],
        availability: 'available',
        description: 'The Hyundai Elantra 2024 offers exceptional value with its bold design and comprehensive technology package.',
        popularity: 65
      },
      {
        name: 'Toyota Land Cruiser 2024',
        brand: 'Toyota',
        model: 'Land Cruiser',
        year: 2024,
        price: 95000000,
        depositAmount: 18000000,
        monthlyInstallment: 2375000,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'diesel',
        transmission: 'automatic',
        color: 'Savannah Beige',
        mileage: 2000,
        engine: '3.3L V6 Twin-Turbo Diesel',
        horsepower: 304,
        features: ['Multi-Terrain Select', 'Crawl Control', 'Kinetic Dynamic Suspension', 'Premium JBL Audio', '360-degree Camera'],
        images: ['/uploads/images/toyota-land-cruiser-1.jpg', '/uploads/images/toyota-land-cruiser-2.jpg'],
        availability: 'available',
        description: 'The Toyota Land Cruiser 2024 is the ultimate off-road vehicle with unmatched reliability and luxury.',
        popularity: 98
      }
    ]);

    console.log('Created vehicles');

    const demoApplications = await Application.insertMany([
      {
        user: customers[0]._id,
        vehicle: vehicles[0]._id,
        status: 'active',
        depositAmount: 5000000,
        totalAmount: 35000000,
        monthlyPayment: 875000,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'ID Card', url: '/uploads/documents/id-card.pdf' }, { name: 'Proof of Address', url: '/uploads/documents/proof-address.pdf' }],
        approvedBy: admin._id,
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        user: customers[1]._id,
        vehicle: vehicles[2]._id,
        status: 'approved',
        depositAmount: 10000000,
        totalAmount: 65000000,
        monthlyPayment: 1625000,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'ID Card', url: '/uploads/documents/id-card-2.pdf' }],
        approvedBy: admin._id,
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        user: customers[2]._id,
        vehicle: vehicles[4]._id,
        status: 'pending',
        depositAmount: 7000000,
        totalAmount: 48000000,
        monthlyPayment: 1200000,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'Employment Letter', url: '/uploads/documents/employment.pdf' }]
      },
      {
        user: customers[3]._id,
        vehicle: vehicles[10]._id,
        status: 'active',
        depositAmount: 8000000,
        totalAmount: 55000000,
        monthlyPayment: 1375000,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'Bank Statement', url: '/uploads/documents/bank-statement.pdf' }],
        approvedBy: admin._id,
        approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        user: customers[4]._id,
        vehicle: vehicles[6]._id,
        status: 'rejected',
        depositAmount: 5500000,
        totalAmount: 38000000,
        monthlyPayment: 950000,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [],
        rejectionReason: 'Insufficient income documentation'
      }
    ]);

    console.log('Created applications');

    const demoPayments = await Payment.insertMany([
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 5000000, type: 'deposit', transactionRef: 'AFX-DEPOSIT-001', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 875000, type: 'installment', transactionRef: 'AFX-INST-001', status: 'successful', paymentMethod: 'monniepay' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 875000, type: 'installment', transactionRef: 'AFX-INST-002', status: 'successful', paymentMethod: 'monniepay' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 875000, type: 'installment', transactionRef: 'AFX-INST-003', status: 'successful', paymentMethod: 'monniepay' },
      { user: customers[1]._id, application: demoApplications[1]._id, vehicle: vehicles[2]._id, amount: 10000000, type: 'deposit', transactionRef: 'AFX-DEPOSIT-002', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 8000000, type: 'deposit', transactionRef: 'AFX-DEPOSIT-003', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 1375000, type: 'installment', transactionRef: 'AFX-INST-004', status: 'successful', paymentMethod: 'monniepay' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 1375000, type: 'installment', transactionRef: 'AFX-INST-005', status: 'successful', paymentMethod: 'monniepay' }
    ]);

    console.log('Created payments');

    const schedulePayments1 = [];
    for (let i = 1; i <= 36; i++) {
      const dueDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dueDate.setMonth(dueDate.getMonth() + i);
      const isPaid = i <= 3;
      schedulePayments1.push({
        paymentNumber: i,
        dueDate,
        amountDue: i === 36 ? 35000000 - 5000000 - (875000 * 35) : 875000,
        amountPaid: isPaid ? (i === 36 ? 35000000 - 5000000 - (875000 * 35) : 875000) : 0,
        status: isPaid ? 'paid' : i === 4 ? 'due' : 'upcoming',
        paidAt: isPaid ? new Date() : null,
        transactionRef: isPaid ? `AFX-INST-00${i}` : null
      });
    }

    const schedulePayments2 = [];
    for (let i = 1; i <= 36; i++) {
      const dueDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      dueDate.setMonth(dueDate.getMonth() + i);
      const isPaid = i <= 2;
      schedulePayments2.push({
        paymentNumber: i,
        dueDate,
        amountDue: i === 36 ? 55000000 - 8000000 - (1375000 * 35) : 1375000,
        amountPaid: isPaid ? (i === 36 ? 55000000 - 8000000 - (1375000 * 35) : 1375000) : 0,
        status: isPaid ? 'paid' : i === 3 ? 'overdue' : 'upcoming',
        paidAt: isPaid ? new Date() : null,
        transactionRef: isPaid ? `AFX-INST-00${i + 3}` : null
      });
    }

    await PaymentSchedule.insertMany([
      {
        application: demoApplications[0]._id,
        user: customers[0]._id,
        payments: schedulePayments1,
        totalAmount: 30000000,
        totalPaid: 2625000,
        remainingBalance: 27375000
      },
      {
        application: demoApplications[3]._id,
        user: customers[3]._id,
        payments: schedulePayments2,
        totalAmount: 47000000,
        totalPaid: 2750000,
        remainingBalance: 44250000
      }
    ]);

    console.log('Created payment schedules');

    await Notification.insertMany([
      { user: customers[0]._id, type: 'payment_received', message: 'Payment of ₦5,000,000 received successfully.', isRead: true, link: '/payments' },
      { user: customers[0]._id, type: 'payment_due', message: 'Your next installment of ₦875,000 is due soon.', isRead: false, link: '/schedule' },
      { user: customers[1]._id, type: 'application_update', message: 'Your application for BMW 3 Series 2024 has been approved!', isRead: false, link: '/applications' },
      { user: customers[3]._id, type: 'payment_due', message: 'Payment #3 for Ford Mustang 2024 is overdue.', isRead: false, link: '/schedule' },
      { user: customers[4]._id, type: 'application_update', message: 'Your application for Toyota RAV4 2024 has been rejected. Reason: Insufficient income documentation.', isRead: true, link: '/applications' }
    ]);

    console.log('Created notifications');

    await Vehicle.findByIdAndUpdate(vehicles[0]._id, { availability: 'sold' });
    await Vehicle.findByIdAndUpdate(vehicles[2]._id, { availability: 'reserved' });
    await Vehicle.findByIdAndUpdate(vehicles[10]._id, { availability: 'sold' });

    console.log('Updated vehicle availability');

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@autoflex.com / admin123');
    console.log('Customers: john@example.com / password123');
    console.log('           jane@example.com / password123');
    console.log('           mike@example.com / password123');
    console.log('           sarah@example.com / password123');
    console.log('           david@example.com / password123');
    console.log(`Vehicles: ${vehicles.length}`);
    console.log(`Applications: ${demoApplications.length}`);
    console.log(`Payments: ${demoPayments.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(0);
  }
};

seedData().catch(() => {
  console.log('Seed skipped - database not available');
  process.exit(0);
});
