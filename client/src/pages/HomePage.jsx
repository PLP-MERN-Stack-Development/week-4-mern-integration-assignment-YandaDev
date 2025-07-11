import { usePosts } from '../context/PostContext';
import PostList from '../components/PostList';

function HomePage() {
  const { posts, loading } = usePosts();
  return <PostList posts={posts} loading={loading} />;
}

export default HomePage;