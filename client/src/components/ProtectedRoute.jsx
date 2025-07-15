import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

function ProtectedRoute({ children }) {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
