import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../services/api';
import { useCategories } from '../context/CategoriesContext';
import PostForm from '../components/PostForm';

function CreateEditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      postService.getPost(id).then(data => {
        setInitialData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    if (id) {
      await postService.updatePost(id, data);
    } else {
      await postService.createPost(data);
    }
    setLoading(false);
    navigate('/');
  };

  return (
    <PostForm
      onSubmit={handleSubmit}
      initialData={initialData}
      categories={categories}
      loading={loading}
    />
  );
}

export default CreateEditPostPage;