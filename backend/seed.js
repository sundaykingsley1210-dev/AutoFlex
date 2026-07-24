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
        employment: { employer: 'Tech Corp', position: 'Software Engineer', monthlyIncome: 45000 },
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
        employment: { employer: 'Finance Ltd', position: 'Accountant', monthlyIncome: 55000 },
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
        employment: { employer: 'Oil Company', position: 'Engineer', monthlyIncome: 40000 },
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
        employment: { employer: 'Hospital', position: 'Doctor', monthlyIncome: 60000 },
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
        employment: { employer: 'Manufacturing Co', position: 'Manager', monthlyIncome: 35000 },
        isVerified: true
      }
    ]);

    console.log('Created admin and customers');

    const vehicles = await Vehicle.insertMany([
      {
        name: 'Tesla Model 3 2024',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        price: 42990,
        depositAmount: 6449,
        monthlyInstallment: 1014,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Pearl White',
        mileage: 100,
        engine: 'Dual Motor AWD',
        horsepower: 510,
        features: ['Autopilot', '15" Touchscreen', 'Premium Interior', 'Full Self-Driving Capability', 'Glass Roof'],
        images: ['https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800', 'https://images.unsplash.com/photo-1617886903355-9354e4e4e384?w=800'],
        availability: 'available',
        description: 'Tesla Model 3 delivers exceptional range, cutting-edge technology, and a thrilling driving experience. Features Autopilot and a minimalist interior with a 15-inch touchscreen.',
        popularity: 95
      },
      {
        name: 'Tesla Model Y 2024',
        brand: 'Tesla',
        model: 'Model Y',
        year: 2024,
        price: 52490,
        depositAmount: 7874,
        monthlyInstallment: 1234,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Midnight Cherry Red',
        mileage: 50,
        engine: 'Dual Motor AWD',
        horsepower: 456,
        features: ['Autopilot', 'Panoramic Glass Roof', 'Heated Seats', 'Full Self-Driving Capability', 'Towing Package'],
        images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'],
        availability: 'available',
        description: 'Tesla Model Y is the most practical and versatile Tesla, combining SUV capability with sporty performance. Perfect for families who want electric freedom.',
        popularity: 98
      },
      {
        name: 'Tesla Model S 2024',
        brand: 'Tesla',
        model: 'Model S',
        year: 2024,
        price: 84990,
        depositAmount: 12749,
        monthlyInstallment: 1983,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Obsidian Black',
        mileage: 25,
        engine: 'Tri Motor AWD',
        horsepower: 1020,
        features: ['Plaid Powertrain', 'Yoke Steering', '17" Cinematic Display', 'Active Noise Cancellation', '21-speaker Audio'],
        images: ['https://images.unsplash.com/photo-1617469955236-6f2348937d54?w=800', 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800'],
        availability: 'available',
        description: 'Tesla Model S Plaid is the fastest production sedan ever made. With 1,020 horsepower and a 0-60 time of 1.99 seconds, it redefines performance.',
        popularity: 92
      },
      {
        name: 'Tesla Model X 2024',
        brand: 'Tesla',
        model: 'Model X',
        year: 2024,
        price: 94990,
        depositAmount: 14249,
        monthlyInstallment: 2211,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Pearl White',
        mileage: 30,
        engine: 'Tri Motor AWD',
        horsepower: 1020,
        features: ['Falcon Wing Doors', '17" Cinematic Display', '6-Seat Configuration', 'Bioweapon Defense Mode', 'Towing Package'],
        images: ['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
        availability: 'available',
        description: 'Tesla Model X is the most capable SUV ever built. With Falcon Wing doors, seating for up to 7, and Plaid powertrain, it combines luxury with utility.',
        popularity: 88
      },
      {
        name: 'Tesla Cybertruck 2024',
        brand: 'Tesla',
        model: 'Cybertruck',
        year: 2024,
        price: 79990,
        depositAmount: 11999,
        monthlyInstallment: 1862,
        installmentMonths: 36,
        bodyType: 'truck',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Stainless Steel',
        mileage: 100,
        engine: 'Tri Motor AWD',
        horsepower: 845,
        features: ['Adaptive Air Suspension', 'Vault Storage', '6ft Bed', 'Onboard Power', 'Armored Glass'],
        images: ['https://images.unsplash.com/photo-1635220230870-3e6b8b3b5f5e?w=800', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
        availability: 'available',
        description: 'Tesla Cybertruck is the most capable pickup truck ever built. With its ultra-hard stainless steel exoskeleton and 845 horsepower, it is built for any terrain.',
        popularity: 96
      },
      {
        name: 'Tesla Model 3 Highland 2024',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        price: 46990,
        depositAmount: 7049,
        monthlyInstallment: 1098,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Ultra Red',
        mileage: 10,
        engine: 'Dual Motor AWD',
        horsepower: 510,
        features: ['Refreshed Design', 'Ambient Lighting', 'Rear Display', 'Improved Suspension', 'Autopilot'],
        images: ['https://images.unsplash.com/photo-1617886903355-9354e4e4e384?w=800', 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800'],
        availability: 'available',
        description: 'Tesla Model 3 Highland features a refreshed exterior design, improved interior materials, and enhanced ride comfort. The most refined Model 3 yet.',
        popularity: 93
      },
      {
        name: 'Tesla Model Y Long Range 2024',
        brand: 'Tesla',
        model: 'Model Y',
        year: 2024,
        price: 48990,
        depositAmount: 7349,
        monthlyInstallment: 1151,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Quicksilver',
        mileage: 50,
        engine: 'Dual Motor AWD',
        horsepower: 346,
        features: ['330mi Range', 'Autopilot', 'All-Wheel Drive', 'Heated Seats', 'Power Liftgate'],
        images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'],
        availability: 'available',
        description: 'Tesla Model Y Long Range delivers 330 miles of range with all-wheel drive. The perfect blend of efficiency, range, and versatility.',
        popularity: 97
      },
      {
        name: 'Tesla Model S Plaid 2024',
        brand: 'Tesla',
        model: 'Model S',
        year: 2024,
        price: 99990,
        depositAmount: 14999,
        monthlyInstallment: 2333,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Deep Blue',
        mileage: 10,
        engine: 'Tri Motor AWD',
        horsepower: 1020,
        features: ['Plaid Powertrain', 'Track Mode', 'Carbon Fiber Spoiler', '17" Display', '200mph Top Speed'],
        images: ['https://images.unsplash.com/photo-1617469955236-6f2348937d54?w=800', 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800'],
        availability: 'available',
        description: 'Tesla Model S Plaid is the quickest production car ever made. With 1,020 horsepower and 200mph top speed, it is pure electric performance.',
        popularity: 90
      },
      {
        name: 'Tesla Model X Plaid 2024',
        brand: 'Tesla',
        model: 'Model X',
        year: 2024,
        price: 104990,
        depositAmount: 15749,
        monthlyInstallment: 2434,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Solid Black',
        mileage: 15,
        engine: 'Tri Motor AWD',
        horsepower: 1020,
        features: ['Plaid Powertrain', 'Falcon Wing Doors', '6-Seat Configuration', '17" Display', '2.5s 0-60mph'],
        images: ['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
        availability: 'available',
        description: 'Tesla Model X Plaid combines SUV versatility with Plaid performance. Falcon Wing doors, 6-seat luxury, and 0-60 in 2.5 seconds.',
        popularity: 87
      },
      {
        name: 'Tesla Cyberbeast 2024',
        brand: 'Tesla',
        model: 'Cybertruck',
        year: 2024,
        price: 99990,
        depositAmount: 14999,
        monthlyInstallment: 2333,
        installmentMonths: 36,
        bodyType: 'truck',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Stainless Steel',
        mileage: 50,
        engine: 'Tri Motor AWD',
        horsepower: 845,
        features: ['600mi Range', 'Towing 14,000lbs', 'Adaptive Air Suspension', 'Onboard Power', 'Vault Storage'],
        images: ['https://images.unsplash.com/photo-1635220230870-3e6b8b3b5f5e?w=800', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
        availability: 'available',
        description: 'Tesla Cyberbeast is the ultimate performance truck. With 845 horsepower, 600 miles of range, and 14,000lb towing capacity, it dominates everything.',
        popularity: 94
      },
      {
        name: 'Tesla Model 3 Standard 2024',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        price: 38990,
        depositAmount: 5849,
        monthlyInstallment: 920,
        installmentMonths: 36,
        bodyType: 'sedan',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Stealth Grey',
        mileage: 100,
        engine: 'RWD',
        horsepower: 271,
        features: ['Autopilot', '15" Touchscreen', '272mi Range', 'Cloth Interior', 'Glass Roof'],
        images: ['https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800', 'https://images.unsplash.com/photo-1617886903355-9354e4e4e384?w=800'],
        availability: 'available',
        description: 'Tesla Model 3 Standard is the most affordable way to own a Tesla. With 272 miles of range and Autopilot, it is the perfect entry into electric driving.',
        popularity: 88
      },
      {
        name: 'Tesla Model Y Performance 2024',
        brand: 'Tesla',
        model: 'Model Y',
        year: 2024,
        price: 57490,
        depositAmount: 8624,
        monthlyInstallment: 1340,
        installmentMonths: 36,
        bodyType: 'suv',
        fuelType: 'electric',
        transmission: 'automatic',
        color: 'Ultra Red',
        mileage: 25,
        engine: 'Dual Motor AWD',
        horsepower: 456,
        features: ['Performance Package', 'Carbon Fiber Spoiler', '21" Wheels', 'Lowered Suspension', 'Track Mode'],
        images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'],
        availability: 'available',
        description: 'Tesla Model Y Performance delivers sporty acceleration with 0-60 in 3.5 seconds. The most exciting electric SUV for thrill seekers.',
        popularity: 91
      }
    ]);

    console.log('Created vehicles');

    const demoApplications = await Application.insertMany([
      {
        user: customers[0]._id,
        vehicle: vehicles[0]._id,
        status: 'active',
        depositAmount: 6449,
        totalAmount: 42990,
        monthlyPayment: 1014,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'ID Card', url: '/uploads/documents/id-card.pdf' }, { name: 'Proof of Address', url: '/uploads/documents/proof-address.pdf' }],
        approvedBy: admin._id,
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        user: customers[1]._id,
        vehicle: vehicles[4]._id,
        status: 'approved',
        depositAmount: 11999,
        totalAmount: 79990,
        monthlyPayment: 1862,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'ID Card', url: '/uploads/documents/id-card-2.pdf' }],
        approvedBy: admin._id,
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        user: customers[2]._id,
        vehicle: vehicles[1]._id,
        status: 'pending',
        depositAmount: 7874,
        totalAmount: 52490,
        monthlyPayment: 1234,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [{ name: 'Employment Letter', url: '/uploads/documents/employment.pdf' }]
      },
      {
        user: customers[3]._id,
        vehicle: vehicles[10]._id,
        status: 'active',
        depositAmount: 5849,
        totalAmount: 38990,
        monthlyPayment: 920,
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
        depositAmount: 7349,
        totalAmount: 48990,
        monthlyPayment: 1151,
        installmentMonths: 36,
        paymentPlan: 'monthly',
        documents: [],
        rejectionReason: 'Insufficient income documentation'
      }
    ]);

    console.log('Created applications');

    const demoPayments = await Payment.insertMany([
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 6449, type: 'deposit', transactionRef: 'AFX-DEPOSIT-001', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 1014, type: 'installment', transactionRef: 'AFX-INST-001', status: 'successful', paymentMethod: 'monnify' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 1014, type: 'installment', transactionRef: 'AFX-INST-002', status: 'successful', paymentMethod: 'monnify' },
      { user: customers[0]._id, application: demoApplications[0]._id, vehicle: vehicles[0]._id, amount: 1014, type: 'installment', transactionRef: 'AFX-INST-003', status: 'successful', paymentMethod: 'monnify' },
      { user: customers[1]._id, application: demoApplications[1]._id, vehicle: vehicles[4]._id, amount: 11999, type: 'deposit', transactionRef: 'AFX-DEPOSIT-002', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 5849, type: 'deposit', transactionRef: 'AFX-DEPOSIT-003', status: 'successful', paymentMethod: 'bank_transfer' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 920, type: 'installment', transactionRef: 'AFX-INST-004', status: 'successful', paymentMethod: 'monnify' },
      { user: customers[3]._id, application: demoApplications[3]._id, vehicle: vehicles[10]._id, amount: 920, type: 'installment', transactionRef: 'AFX-INST-005', status: 'successful', paymentMethod: 'monnify' }
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
        amountDue: i === 36 ? 42990 - 6449 - (1014 * 35) : 1014,
        amountPaid: isPaid ? (i === 36 ? 42990 - 6449 - (1014 * 35) : 1014) : 0,
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
        amountDue: i === 36 ? 38990 - 5849 - (920 * 35) : 920,
        amountPaid: isPaid ? (i === 36 ? 38990 - 5849 - (920 * 35) : 920) : 0,
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
        totalAmount: 36541,
        totalPaid: 3042,
        remainingBalance: 33499
      },
      {
        application: demoApplications[3]._id,
        user: customers[3]._id,
        payments: schedulePayments2,
        totalAmount: 33141,
        totalPaid: 1840,
        remainingBalance: 31301
      }
    ]);

    console.log('Created payment schedules');

    await Notification.insertMany([
      { user: customers[0]._id, type: 'payment_received', message: 'Payment of $6,449 received successfully.', isRead: true, link: '/payments' },
      { user: customers[0]._id, type: 'payment_due', message: 'Your next installment of $1,014 is due soon.', isRead: false, link: '/schedule' },
      { user: customers[1]._id, type: 'application_update', message: 'Your application for Tesla Cybertruck 2024 has been approved!', isRead: false, link: '/applications' },
      { user: customers[3]._id, type: 'payment_due', message: 'Payment #3 for Tesla Model 3 Standard 2024 is overdue.', isRead: false, link: '/schedule' },
      { user: customers[4]._id, type: 'application_update', message: 'Your application for Tesla Model Y Long Range 2024 has been rejected. Reason: Insufficient income documentation.', isRead: true, link: '/applications' }
    ]);

    console.log('Created notifications');

    await Vehicle.findByIdAndUpdate(vehicles[0]._id, { availability: 'sold' });
    await Vehicle.findByIdAndUpdate(vehicles[4]._id, { availability: 'reserved' });
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
