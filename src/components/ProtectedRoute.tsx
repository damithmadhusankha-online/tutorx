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
    const logoutRole = localStorage.getItem('logout_role');
    const loginPath = logoutRole === 'teacher' ? '/login/teacher' : '/login';
    // Clear it so it doesn't persist forever
    localStorage.removeItem('logout_role');
    
    // Redirect them to the correct login page
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
