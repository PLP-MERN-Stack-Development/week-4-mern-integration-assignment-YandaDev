// Simple script to check database contents
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const Category = require('./models/Category');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check posts
    const posts = await Post.find({});
    console.log(`\n📝 Posts in database: ${posts.length}`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (Published: ${post.isPublished})`);
    });

    // Check users
    const users = await User.find({});
    console.log(`\n👤 Users in database: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
    });

    // Check categories
    const categories = await Category.find({});
    console.log(`\n📂 Categories in database: ${categories.length}`);
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();
