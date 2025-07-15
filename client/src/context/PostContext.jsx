import { createContext, useContext, useState, useEffect } from 'react';
import { postService } from '../services/api';

const PostContext = createContext();

export function usePosts() {
  return useContext(PostContext);
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadPosts = async (page = 1, search = '', category = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getAllPosts(page, 10, category);
      if (search) {
        const searchResults = await postService.searchPosts(search);
        setPosts(searchResults);
        setPagination({});
      } else {
        setPosts(data.posts || data);
        setPagination(data.pagination || {});
      }
      setCurrentPage(page);
      setSearchQuery(search);
      setSelectedCategory(category);
    } catch (err) {
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Optimistic create
  const createPostOptimistic = async (postData) => {
    setError(null);
    const tempId = Date.now().toString();
    const optimisticPost = { ...postData, _id: tempId };
    setPosts(prev => [optimisticPost, ...prev]);
    try {
      const saved = await postService.createPost(postData);
      setPosts(prev => prev.map(p => (p._id === tempId ? saved : p)));
      return { success: true };
    } catch (err) {
      setPosts(prev => prev.filter(p => p._id !== tempId));
      setError('Failed to create post');
      return { success: false, error: err };
    }
  };

  // Optimistic update
  const updatePostOptimistic = async (id, postData) => {
    setError(null);
    const oldPost = posts.find(p => p._id === id);
    setPosts(prev => prev.map(p => (p._id === id ? { ...p, ...postData } : p)));
    try {
      const updated = await postService.updatePost(id, postData);
      setPosts(prev => prev.map(p => (p._id === id ? updated : p)));
      return { success: true };
    } catch (err) {
      setPosts(prev => prev.map(p => (p._id === id ? oldPost : p)));
      setError('Failed to update post');
      return { success: false, error: err };
    }
  };

  // Search posts
  const searchPosts = async (query) => {
    if (!query.trim()) {
      loadPosts(1, '', selectedCategory);
      return;
    }
    await loadPosts(1, query, '');
  };

  // Filter by category
  const filterByCategory = async (categoryId) => {
    await loadPosts(1, '', categoryId);
  };

  // Load next page
  const loadNextPage = () => {
    if (pagination.hasNext) {
      loadPosts(currentPage + 1, searchQuery, selectedCategory);
    }
  };

  // Load previous page
  const loadPrevPage = () => {
    if (pagination.hasPrev) {
      loadPosts(currentPage - 1, searchQuery, selectedCategory);
    }
  };

  const value = {
    posts,
    setPosts,
    pagination,
    loading,
    error,
    currentPage,
    searchQuery,
    selectedCategory,
    createPostOptimistic,
    updatePostOptimistic,
    searchPosts,
    filterByCategory,
    loadNextPage,
    loadPrevPage,
    loadPosts
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}