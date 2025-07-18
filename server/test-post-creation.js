// Simple test to check post creation API
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Category = require('./models/Category');
require('dotenv').config();

async function testPostCreation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No user found. Please register a user first.');
      process.exit(1);
    }
    console.log('✅ Found user:', user.username);

    // Find a category
    const category = await Category.findOne();
    if (!category) {
      console.error('❌ No category found. Please seed categories first.');
      process.exit(1);
    }
    console.log('✅ Found category:', category.name, 'ID:', category._id);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Generated JWT token');

    // Test with curl instead of fetch to avoid network issues
    console.log('\n🔄 Testing post creation...');
    console.log('You can manually test with this curl command:');
    console.log(`curl -X POST http://localhost:5000/api/posts \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Test Post",
    "content": "This is a test post content",
    "category": "${category._id}",
    "tags": "test,debugging"
  }'`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testPostCreation();
