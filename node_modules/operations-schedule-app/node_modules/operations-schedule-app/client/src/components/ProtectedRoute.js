// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated()) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  if (!roles.includes(user.role)) {
    // If the user doesn't have the correct role, redirect to a forbidden page or home
    return <Navigate to="/" />;
  }

  // If authenticated and authorized, render the nested routes
  return <Outlet />;
};

export default ProtectedRoute;
