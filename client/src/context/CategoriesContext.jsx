import { createContext, useContext, useState, useEffect } from 'react';
import { categoryService } from '../services/api';

const CategoriesContext = createContext();

export function useCategories() {
  return useContext(CategoriesContext);
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAllCategories().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, setCategories, loading }}>
      {children}
    </CategoriesContext.Provider>
  );
}