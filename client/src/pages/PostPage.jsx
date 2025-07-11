import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../services/api';
import PostItem from '../components/PostItem';

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getPost(id).then(data => {
      setPost(data);
      setLoading(false);
    });
  }, [id]);

  return <PostItem post={post} loading={loading} />;
}

export default PostPage;