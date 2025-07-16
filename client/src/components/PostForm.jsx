import { useState, useEffect } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

function PostForm({ onSubmit, initialData = {}, categories, loading, isEdit = false, postId }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { createPostOptimistic, updatePostOptimistic, error: postError } = usePosts();
  const { user } = useAuth();

  useEffect(() => {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    setCategory(initialData.category || '');
    setTags(initialData.tags?.join(', ') || '');
    if (initialData.featuredImage) {
      setImagePreview(`/uploads/${initialData.featuredImage}`);
    }
  }, [initialData]);

  // Validation logic
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 100) newErrors.title = 'Title must be under 100 characters';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (content.length < 10) newErrors.content = 'Content must be at least 10 characters';
    if (!category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    if (tags) {
      formData.append('tags', tags);
    }
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    try {
      let result;
      if (isEdit && postId) {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        console.log('Update response status:', response.status);
        console.log('Update response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
          let errorMessage = 'Failed to update post';
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error('Error parsing JSON error response:', jsonError);
              errorMessage = `Server error (${response.status})`;
            }
          } else {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorMessage = `Server error (${response.status}): ${textResponse.substring(0, 100)}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('Update success response:', responseData);
          result = { success: true, data: responseData };
        } else {
          console.log('Non-JSON update success response');
          result = { success: true };
        }
      } else {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
          let errorMessage = 'Failed to create post';
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              console.error('Error parsing JSON error response:', jsonError);
              errorMessage = `Server error (${response.status})`;
            }
          } else {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorMessage = `Server error (${response.status}): ${textResponse.substring(0, 100)}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('Success response:', responseData);
          result = { success: true, data: responseData };
        } else {
          console.log('Non-JSON success response');
          result = { success: true };
        }
      }
      
      if (result.success) {
        setErrors({});
        if (onSubmit) onSubmit({ title, content, category, tags });
      }
    } catch (error) {
      console.error('Post submission error:', error);
      setErrors(prev => ({ ...prev, form: error.message || 'An error occurred' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Post' : 'Create New Post'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your post"
                className="form-input"
                required
              />
              {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Featured Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-50 file:to-purple-50 file:text-indigo-600 hover:file:bg-gradient-to-r hover:file:from-indigo-100 hover:file:to-purple-100"
                />
              </div>
              {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
              {imagePreview && (
                <div className="mt-4">
                  <div className="relative w-48 h-48 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your post content here... Share your thoughts, ideas, and insights with the world."
                rows={12}
                className="form-input resize-none"
                required
              />
              {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="form-select appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
                {(!categories || categories.length === 0) && (
                  <div className="text-amber-600 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No categories available. Please create categories first.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="react, javascript, web development"
                  className="form-input"
                />
                <p className="text-sm text-gray-500">Separate tags with commas</p>
              </div>
            </div>

            {(errors.form || postError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm">{errors.form || postError}</span>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Post...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {isEdit ? 'Update Post' : 'Create Post'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostForm;