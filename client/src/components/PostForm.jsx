import { useState, useEffect } from 'react';
import { usePosts } from '../context/PostContext';

function PostForm({ onSubmit, initialData = {}, categories, loading, isEdit = false, postId }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [errors, setErrors] = useState({});
  const { createPostOptimistic, updatePostOptimistic, error: postError } = usePosts();

  useEffect(() => {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    setCategory(initialData.category || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    let result;
    if (isEdit && postId) {
      result = await updatePostOptimistic(postId, { title, content, category });
    } else {
      result = await createPostOptimistic({ title, content, category });
    }
    if (result && !result.success) {
      setErrors(prev => ({ ...prev, form: result.error?.message || 'An error occurred' }));
    } else {
      setErrors({});
      if (onSubmit) onSubmit({ title, content, category });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
      </div>
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        {errors.content && <div style={{ color: 'red' }}>{errors.content}</div>}
      </div>
      <div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <div style={{ color: 'red' }}>{errors.category}</div>}
      </div>
      {errors.form && <div style={{ color: 'red' }}>{errors.form}</div>}
      {postError && <div style={{ color: 'red' }}>{postError}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

export default PostForm;