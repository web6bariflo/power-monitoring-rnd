import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const stored = localStorage.getItem('loggedData');
  const userData = stored ? JSON.parse(stored) : null;

  // Check for User_name instead of user
  return userData?.User_name ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
