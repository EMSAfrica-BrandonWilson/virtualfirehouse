import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't check while still loading authentication state
    if (loading) return;

    // Define protected paths that require authentication
    const protectedPaths = ['/admin', '/control', '/operations', '/fire-safety', '/maintenance', '/training', '/account'];
    
    // Check if current path requires authentication
    const isProtectedPath = protectedPaths.some(protectedPath => 
      location.pathname.startsWith(protectedPath)
    );

    // If trying to access a protected path without authentication
    if (isProtectedPath && !user) {
      navigate('/access-denied', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
};
