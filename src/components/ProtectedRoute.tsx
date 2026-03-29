import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'admin' | 'driver' | 'user';
  requireAdmin?: boolean; // Alias for requiredRole='admin'
}

export function ProtectedRoute({ children, requiredRole, requireAdmin }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // ✅ Called unconditionally — ProtectedRoute always renders inside LanguageProvider
  // (App → LanguageProvider → AuthProvider → RouterProvider → ProtectedRoute)
  const { language } = useLanguage();

  const loadingText = language === 'ar' ? 'جاري التحقق من الهوية...' : 'Checking authentication...';

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-background"
        role="status"
        aria-label={loadingText}
        aria-live="polite"
      >
        <LoadingSpinner />
        <p className="mt-4 text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page but preserve intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Role-based access control
  const isAdminRequired = requireAdmin || requiredRole === 'admin';
  if (isAdminRequired) {
    const isAdmin = profile?.role === 'admin' ||
      user.email === 'admin@wasel.com';
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // If children provided, render them; otherwise use Outlet for nested routes
  return <>{children || <Outlet />}</>;
}