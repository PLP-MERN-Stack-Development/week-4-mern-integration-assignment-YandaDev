import { createContext, useContext, useState, useEffect } from 'react';
import { postService } from '../services/api';

const PostContext = createContext();

export function usePosts() {
  return useContext(PostContext);
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getAllPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <PostContext.Provider value={{ posts, setPosts, loading }}>
      {children}
    </PostContext.Provider>
  );
}