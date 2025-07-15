// Test script to verify post creation works
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testPostCreation() {
  try {
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed, please register first');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful!');

    // Get categories to use a valid category ID
    const categoriesResponse = await fetch('http://localhost:5000/api/categories');
    const categories = await categoriesResponse.json();
    const categoryId = categories[0]._id;
    console.log('Using category:', categories[0].name);

    // Create a test post
    const formData = new FormData();
    formData.append('title', 'Test Post Title');
    formData.append('content', 'This is a test post content to verify post creation works properly.');
    formData.append('category', categoryId);
    formData.append('tags', 'test, verification, api');

    const postResponse = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (postResponse.ok) {
      const post = await postResponse.json();
      console.log('Post created successfully!');
      console.log('Post ID:', post._id);
      console.log('Post Title:', post.title);
    } else {
      const error = await postResponse.json();
      console.error('Post creation failed:', error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPostCreation();
