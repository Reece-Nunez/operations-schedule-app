import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated, loading } = useUser();

  if (loading) {
    // Optionally, show a loading state if user data is being fetched
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  // Check if the user's role is allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
