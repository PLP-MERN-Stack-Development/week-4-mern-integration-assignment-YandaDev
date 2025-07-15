import { useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

function PostItem({ post, loading }) {
  const [comments, setComments] = useState(post?.comments || []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  const handleCommentAdded = (newComments) => {
    setComments(newComments);
  };

  return (
    <article className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
          <img
            src={`/uploads/${post.featuredImage}`}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            {post.author && (
              <div className="flex items-center space-x-2">
                {post.author.avatar && (
                  <img
                    src={`/uploads/${post.author.avatar}`}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span>By {post.author.username}</span>
              </div>
            )}
            
            {post.category && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {post.category.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {post.viewCount && (
              <span>{post.viewCount} views</span>
            )}
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div className="prose max-w-none mb-8">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
      
      <div className="border-t pt-6">
        <CommentList comments={comments} />
        <CommentForm postId={post._id} onCommentAdded={handleCommentAdded} />
      </div>
    </article>
  );
}

export default PostItem;