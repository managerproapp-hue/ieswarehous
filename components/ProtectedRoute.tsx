
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ROLE_DASHBOARD_PATHS } from '../constants';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser, activeRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!activeRole) {
    // If authenticated but no role is selected, go to role selector
    return <Navigate to="/select-profile" replace />;
  }
  
  if (location.pathname === '/' || location.pathname === '/#/') {
      return <Navigate to={ROLE_DASHBOARD_PATHS[activeRole]} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
      // If user tries to access a page their active role can't access
      return <Navigate to={ROLE_DASHBOARD_PATHS[activeRole]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
