const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Employer = require('./models/Employer');

// Test database connection and basic auth functionality
async function testAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected successfully');

    // Test 1: Check if we can create a test user
    console.log('\n🧪 Testing User Creation...');
    
    // Clean up any existing test users
    await User.deleteOne({ email: 'test@example.com' });
    await Employer.deleteOne({ email: 'testemployer@example.com' });

    // Create test jobseeker
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: true // Skip email verification for testing
    });
    console.log('✅ Test jobseeker created:', testUser.email, 'Role:', testUser.role);

    // Create test employer
    const testEmployer = await Employer.create({
      name: 'Test Employer',
      email: 'testemployer@example.com',
      password: hashedPassword,
      isVerified: true // Skip email verification for testing
    });
    console.log('✅ Test employer created:', testEmployer.email, 'Role:', testEmployer.role);

    // Test 2: Check password comparison
    console.log('\n🧪 Testing Password Comparison...');
    const passwordMatch = await bcrypt.compare('TestPass123!', testUser.password);
    console.log('✅ Password comparison works:', passwordMatch);

    // Test 3: Check JWT token generation
    console.log('\n🧪 Testing JWT Token Generation...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: testUser._id, role: testUser.role }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: process.env.ACCESS_EXPIRES }
    );
    console.log('✅ JWT token generated successfully');

    // Test 4: Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('✅ JWT token verified:', decoded);

    console.log('\n✅ All tests passed! Your auth system should work now.');
    console.log('\n📝 Test credentials:');
    console.log('Jobseeker - Email: test@example.com, Password: TestPass123!');
    console.log('Employer - Email: testemployer@example.com, Password: TestPass123!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

testAuth();