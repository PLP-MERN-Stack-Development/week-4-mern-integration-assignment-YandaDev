import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    postService.getById(id)
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post.');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.delete(id);
      navigate('/');
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    }
  };

  const handleCommentAdded = (newComment) => {
    setPost(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));
  };

  const handleCommentDeleted = (commentId) => {
    setPost(prev => ({
      ...prev,
      comments: prev.comments.filter(comment => comment._id !== commentId)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Link to="/" className="text-blue-500 hover:text-blue-700">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user && (user._id === post.author._id || user.role === 'admin');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post Header */}
      <div className="card overflow-hidden mb-8">
        {post.image && (
          <div className="relative">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
            
            {canEdit && (
              <div className="flex space-x-3">
                <Link
                  to={`/edit/${post._id}`}
                  className="btn btn-secondary"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-gray-600 text-sm mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-medium">{post.author?.username || 'Unknown'}</span>
            </div>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.category && (
              <>
                <span>•</span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {post.category.name}
                </span>
              </>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    <span>#</span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="card">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({post.comments?.length || 0})
          </h2>

          {user ? (
            <div className="mb-8">
              <CommentForm
                postId={post._id}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Login
                </Link>{' '}
                to leave a comment
              </p>
            </div>
          )}

          <CommentList
            comments={post.comments || []}
            currentUser={user}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all posts
        </Link>
      </div>
    </div>
  );
}

export default PostPage;