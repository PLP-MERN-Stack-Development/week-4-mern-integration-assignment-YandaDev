const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  { name: 'Technology', description: 'Posts about technology, programming, and software development' },
  { name: 'Web Development', description: 'Frontend and backend web development topics' },
  { name: 'Programming', description: 'General programming concepts and tutorials' },
  { name: 'JavaScript', description: 'JavaScript programming language and frameworks' },
  { name: 'React', description: 'React.js library and ecosystem' },
  { name: 'Node.js', description: 'Node.js runtime and server-side development' },
  { name: 'Database', description: 'Database design, management, and optimization' },
  { name: 'DevOps', description: 'Development operations, deployment, and infrastructure' },
  { name: 'Mobile Development', description: 'Mobile app development for iOS and Android' },
  { name: 'AI & Machine Learning', description: 'Artificial intelligence and machine learning topics' },
  { name: 'Design', description: 'UI/UX design, graphics, and user experience' },
  { name: 'Career', description: 'Career advice, job searching, and professional development' },
  { name: 'Tutorials', description: 'Step-by-step tutorials and how-to guides' },
  { name: 'News', description: 'Latest news and updates in the tech world' },
  { name: 'Reviews', description: 'Product reviews and comparisons' }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-blog');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert seed categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories:`);
    createdCategories.forEach(cat => console.log(`- ${cat.name}`));

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
