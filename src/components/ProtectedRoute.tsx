import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccessDenied } from '../pages/AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#1177BB'
      }}>
        Loading...
      </div>
    );
  }

  // If authentication is required and user is not logged in, show access denied
  if (requireAuth && !user) {
    return <AccessDenied />;
  }

  // If user is authenticated or authentication is not required, render children
  return <>{children}</>;
};
