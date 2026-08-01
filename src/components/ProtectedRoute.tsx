import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
