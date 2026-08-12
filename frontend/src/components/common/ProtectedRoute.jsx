import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
