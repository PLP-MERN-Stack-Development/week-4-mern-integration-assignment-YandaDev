import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostList from '../components/PostList';
import PostSearch from '../components/PostSearch';
import Pagination from '../components/Pagination';
import { postService } from '../services/api';

function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAll({ page: currentPage, limit: 6 });
      setPosts(data.posts || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  const displayPosts = searchTerm ? searchResults : posts;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 mb-12 rounded-3xl mx-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-yellow-300">MERN Blog</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Discover amazing stories, share your thoughts, and connect with writers from around the world.
          </p>
          {user ? (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Post
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-primary bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="card p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Find Your Next Great Read
          </h2>
          <PostSearch onSearch={handleSearch} onSearchTermChange={setSearchTerm} />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6 text-center hover-lift">
          <div className="text-3xl font-bold text-indigo-600 mb-2">{posts.length}</div>
          <div className="text-gray-600">Posts Available</div>
        </div>
        <div className="card p-6 text-center hover-lift">
          <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
          <div className="text-gray-600">Stories to Explore</div>
        </div>
        <div className="card p-6 text-center hover-lift">
          <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
          <div className="text-gray-600">Always Online</div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest Posts'}
          </h2>
          {user && (
            <Link
              to="/create"
              className="btn btn-primary hidden md:inline-flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading"></div>
          </div>
        ) : (
          <>
            <PostList posts={displayPosts} />
            
            {!searchTerm && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;