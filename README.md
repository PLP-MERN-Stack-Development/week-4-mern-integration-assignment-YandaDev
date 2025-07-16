# MERN Stack Blog Application

A full-stack blog application built with MongoDB, Express.js, React.js, and Node.js that demonstrates seamless integration between front-end and back-end components.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features Overview](#features-overview)
- [Database Models](#database-models)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- User authentication and authorization (register, login, logout)
- Create, read, update, and delete blog posts
- Category management for organizing posts
- Image upload for featured post images
- User comments on blog posts
- Search functionality for posts
- Pagination for post listings
- Responsive design with modern UI

### Advanced Features
- Protected routes requiring authentication
- Role-based access control
- Image upload with file validation
- Real-time search with debouncing
- Optimistic UI updates
- Error handling and loading states
- Toast notifications for user feedback

## Technologies Used

### Frontend
- **React 19.1.0** - JavaScript library for building user interfaces
- **React Router DOM 7.6.3** - Declarative routing for React
- **Axios 1.10.0** - Promise-based HTTP client
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Vite 4.6.0** - Build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 8.16.2** - MongoDB object modeling
- **JSON Web Tokens 9.0.2** - Authentication tokens
- **bcryptjs 3.0.2** - Password hashing
- **Multer 2.0.1** - File upload middleware
- **Express Validator 7.2.1** - Input validation

## Project Structure

```
mern-blog/
├── client/                     # React frontend
│   ├── public/                 # Static files
│   │   └── vite.svg           # Vite logo
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable components
│   │   │   ├── CommentForm.jsx
│   │   │   ├── CommentList.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── PostForm.jsx
│   │   │   ├── PostItem.jsx
│   │   │   ├── PostList.jsx
│   │   │   ├── PostSearch.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CategoriesContext.jsx
│   │   │   └── PostContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useApi.js
│   │   ├── pages/             # Page components
│   │   │   ├── CreateEditPostPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── PostPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Application entry point
│   ├── package.json           # Client dependencies
│   └── vite.config.js         # Vite configuration
├── server/                    # Express.js backend
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   ├── models/               # Mongoose models
│   │   ├── Category.js       # Category model
│   │   ├── Post.js           # Post model
│   │   └── User.js           # User model
│   ├── routes/               # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── categories.js     # Category routes
│   │   └── posts.js          # Post routes
│   ├── seeds/                # Database seeding
│   │   ├── README.md         # Seeding instructions
│   │   └── seedCategories.js # Category seeding script
│   ├── uploads/              # Uploaded images directory
│   ├── server.js             # Main server file
│   └── package.json          # Server dependencies
├── README.md                 # Project documentation
└── Week4-Assignment.md       # Assignment instructions
```

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **pnpm** package manager
- **Git**

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mern-blog
```

2. Install server dependencies:
```bash
cd server
pnpm install
```

3. Install client dependencies:
```bash
cd ../client
pnpm install
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-blog
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-blog
```

## Running the Application

### Development Mode

1. Start the MongoDB service (if running locally):
```bash
mongod
```

2. Start the server (from the server directory):
```bash
cd server
pnpm run dev
```

3. Start the client (from the client directory):
```bash
cd client
pnpm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Seeding the Database

To populate the database with sample categories:
```bash
cd server
pnpm run seed
```

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- Body: `{ username, email, password }`
- Returns: User object and JWT token

#### Login User
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: User object and JWT token

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Returns: Current user object

### Posts Endpoints

#### Get All Posts
- **GET** `/api/posts`
- Query: `?page=1&limit=10&search=keyword`
- Returns: Posts array with pagination info

#### Get Single Post
- **GET** `/api/posts/:id`
- Returns: Single post object with comments

#### Create Post
- **POST** `/api/posts`
- Headers: `Authorization: Bearer <token>`
- Body: FormData with title, content, category, featuredImage
- Returns: Created post object

#### Update Post
- **PUT** `/api/posts/:id`
- Headers: `Authorization: Bearer <token>`
- Body: FormData with updated fields
- Returns: Updated post object

#### Delete Post
- **DELETE** `/api/posts/:id`
- Headers: `Authorization: Bearer <token>`
- Returns: Success message

#### Search Posts
- **GET** `/api/posts/search?q=keyword`
- Returns: Matching posts array

### Categories Endpoints

#### Get All Categories
- **GET** `/api/categories`
- Returns: Categories array

#### Create Category
- **POST** `/api/categories`
- Headers: `Authorization: Bearer <token>`
- Body: `{ name, description }`
- Returns: Created category object

### Comments Endpoints

#### Add Comment
- **POST** `/api/posts/:id/comments`
- Headers: `Authorization: Bearer <token>`
- Body: `{ content }`
- Returns: Created comment object

#### Delete Comment
- **DELETE** `/api/posts/:postId/comments/:commentId`
- Headers: `Authorization: Bearer <token>`
- Returns: Success message

## Features Overview

### User Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes for authenticated users
- Password hashing with bcryptjs

### Post Management
- Create rich blog posts with categories
- Upload featured images for posts
- Edit and delete own posts
- View detailed post pages

### Search and Discovery
- Search posts by title and content
- Filter posts by categories
- Pagination for better performance
- Responsive post listings

### Comments System
- Add comments to blog posts
- Delete own comments
- Real-time comment updates
- User-friendly comment interface

### User Interface
- Modern, responsive design
- Loading states and error handling
- Toast notifications
- Smooth navigation with React Router

## Database Models

### User Model
```javascript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (default: 'user')
  createdAt: Date
  updatedAt: Date
}
```

### Post Model
```javascript
{
  title: String (required)
  content: String (required)
  author: ObjectId (ref: User)
  category: ObjectId (ref: Category)
  featuredImage: String
  tags: [String]
  comments: [Comment Schema]
  createdAt: Date
  updatedAt: Date
}
```

### Category Model
```javascript
{
  name: String (required, unique)
  description: String
  createdAt: Date
  updatedAt: Date
}
```

### Comment Schema
```javascript
{
  content: String (required)
  author: ObjectId (ref: User)
  createdAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details. 