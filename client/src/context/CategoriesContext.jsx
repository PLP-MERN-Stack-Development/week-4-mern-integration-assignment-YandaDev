import { createContext, useContext, useState, useEffect } from 'react';
import { categoryService } from '../services/api';

const CategoriesContext = createContext();

export function useCategories() {
  return useContext(CategoriesContext);
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetchCategories = () => {
    fetchCategories();
  };

  return (
    <CategoriesContext.Provider value={{ 
      categories, 
      setCategories, 
      loading, 
      error, 
      refetchCategories 
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}