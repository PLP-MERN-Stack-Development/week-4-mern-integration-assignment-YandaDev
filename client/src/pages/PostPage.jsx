import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../services/api';
import PostItem from '../components/PostItem';

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    postService.getPost(id)
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return <PostItem post={post} loading={false} />;
}

export default PostPage;