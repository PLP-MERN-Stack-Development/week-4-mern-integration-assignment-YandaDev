import { usePosts } from '../context/PostContext';

function Pagination() {
  const { pagination, currentPage, loadNextPage, loadPrevPage, loading } = usePosts();

  if (!pagination.totalPages || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center space-x-6 mt-12">
      <button
        onClick={loadPrevPage}
        disabled={!pagination.hasPrev || loading}
        className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </div>
      </button>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Page <span className="font-semibold text-indigo-600">{currentPage}</span> of <span className="font-semibold">{pagination.totalPages}</span>
        </span>
        <span className="text-xs text-gray-500">
          {pagination.totalPosts} total posts
        </span>
      </div>
      
      <button
        onClick={loadNextPage}
        disabled={!pagination.hasNext || loading}
        className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}

export default Pagination;
