import { createContext, useContext, useState, useEffect } from 'react';
import { postService } from '../services/api';

const PostContext = createContext();

export function usePosts() {
  return useContext(PostContext);
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    postService.getAllPosts()
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load posts');
        setLoading(false);
      });
  }, []);

  // Optimistic create
  const createPostOptimistic = async (postData) => {
    setError(null);
    // Optimistically add the post to UI
    const tempId = Date.now().toString();
    const optimisticPost = { ...postData, _id: tempId };
    setPosts(prev => [optimisticPost, ...prev]);
    try {
      const saved = await postService.createPost(postData);
      // Replace temp post with saved post
      setPosts(prev => prev.map(p => (p._id === tempId ? saved : p)));
      return { success: true };
    } catch (err) {
      // Remove the optimistic post if API fails
      setPosts(prev => prev.filter(p => p._id !== tempId));
      setError('Failed to create post');
      return { success: false, error: err };
    }
  };

  // Optimistic update
  const updatePostOptimistic = async (id, postData) => {
    setError(null);
    // Save old post for rollback
    const oldPost = posts.find(p => p._id === id);
    setPosts(prev => prev.map(p => (p._id === id ? { ...p, ...postData } : p)));
    try {
      const updated = await postService.updatePost(id, postData);
      setPosts(prev => prev.map(p => (p._id === id ? updated : p)));
      return { success: true };
    } catch (err) {
      // Rollback on failure
      setPosts(prev => prev.map(p => (p._id === id ? oldPost : p)));
      setError('Failed to update post');
      return { success: false, error: err };
    }
  };

  return (
    <PostContext.Provider value={{
      posts, setPosts, loading, error,
      createPostOptimistic,
      updatePostOptimistic,
    }}>
      {children}
    </PostContext.Provider>
  );
}