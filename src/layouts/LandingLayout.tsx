/**
 * LandingLayout - Layout for landing page (no sidebar, no header)
 * Used for public marketing pages for non-authenticated users
 */

import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function LandingLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // If user is authenticated, don't render anything (redirect handles it)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: '#040C18' }}>
      <Outlet />
    </div>
  );
}
