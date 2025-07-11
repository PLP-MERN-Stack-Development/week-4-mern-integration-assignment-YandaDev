import { Link } from 'react-router-dom';

function PostList({ posts, loading }) {
  if (loading) return <p>Loading posts...</p>;
  if (!posts.length) return <p>No posts found.</p>;

  return (
    <div>
      {posts.map(post => (
        <div key={post._id} className="card">
          <h2>
            <Link to={`/posts/${post._id}`}>{post.title}</Link>
          </h2>
          <p>{post.content.slice(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
}

export default PostList;