// Test script to simulate frontend FormData post creation
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Category = require('./models/Category');
require('dotenv').config();

async function testFormDataPost() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.error('No user found.');
      process.exit(1);
    }

    // Find a category
    const category = await Category.findOne();
    if (!category) {
      console.error('No category found.');
      process.exit(1);
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Test using curl with multipart/form-data (like frontend FormData)
    console.log('Testing with FormData (multipart/form-data):');
    console.log(`curl -X POST http://localhost:5000/api/posts \\
  -H "Authorization: Bearer ${token}" \\
  -F "title=Test FormData Post" \\
  -F "content=This is a test post using FormData" \\
  -F "category=${category._id}" \\
  -F "tags=test,formdata"`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testFormDataPost();
