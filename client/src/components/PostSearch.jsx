import { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { useCategories } from '../context/CategoriesContext';

function PostSearch() {
  const [query, setQuery] = useState('');
  const { searchPosts, filterByCategory, selectedCategory, loading } = usePosts();
  const { categories } = useCategories();

  const handleSearch = (e) => {
    e.preventDefault();
    searchPosts(query);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    filterByCategory(categoryId);
  };

  return (
    <div className="mb-8 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, content, or author..."
            className="form-input pl-10 pr-4"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Searching
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </div>
          )}
        </button>
      </form>
      
      <div className="flex items-center gap-4">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Filter by category:
        </label>
        <div className="relative">
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-select pr-10 appearance-none cursor-pointer"
            disabled={!categories || categories.length === 0}
          >
            <option value="">All categories</option>
            {categories && categories.length > 0 ? (
              categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
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
        {selectedCategory && (
          <button
            onClick={() => filterByCategory('')}
            className="btn btn-outline text-sm"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
}

export default PostSearch;
