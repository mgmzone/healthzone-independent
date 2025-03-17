
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const AdminRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // Show loading state if auth state is still being determined
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated or not an admin
  if (!user || !profile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render child routes if authenticated and admin
  return <Outlet />;
};

export default AdminRoute;
