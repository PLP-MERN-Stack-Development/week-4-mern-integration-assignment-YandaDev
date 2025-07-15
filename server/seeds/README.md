# Database Seeds

This directory contains seed scripts to populate the database with initial data.

## Available Seeds

### Categories Seed (`seedCategories.js`)
Populates the database with default blog categories including:
- Technology
- Web Development
- Programming
- JavaScript
- React
- Node.js
- Database
- DevOps
- Mobile Development
- AI & Machine Learning
- Design
- Career
- Tutorials
- News
- Reviews

## Usage

### Run individual seed scripts:
```bash
# Seed categories
node seeds/seedCategories.js

# Or using npm script
npm run seed
```

### Run from project root:
```bash
# From the server directory
cd server
npm run seed
```

## Notes

- Make sure MongoDB is running before executing seed scripts
- The seed scripts will clear existing data and repopulate with fresh seed data
- Environment variables should be properly configured in `.env` file
- Each seed script connects to the database, performs operations, and closes the connection

## Environment Variables Required

- `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://localhost:27017/mern-blog`)
