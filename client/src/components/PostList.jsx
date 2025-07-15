import { Link } from 'react-router-dom';

function PostList({ posts, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading posts...</p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <article key={post._id} className="card hover-lift group">
          {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
            <div className="relative overflow-hidden">
              <img
                src={`/uploads/${post.featuredImage}`}
                alt={post.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              {post.category && (
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                  {post.category.name}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              <Link to={`/posts/${post._id}`} className="hover:text-indigo-600">
                {post.title}
              </Link>
            </h2>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.content.substring(0, 150)}...
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {post.author?.username || 'Unknown'}
                </span>
              </div>
              
              {post.viewCount && (
                <span className="text-xs text-gray-500">
                  {post.viewCount} views
                </span>
              )}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <Link
              to={`/posts/${post._id}`}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
            >
              Read More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default PostList;