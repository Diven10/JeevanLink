import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const rolePaths = {
  DONOR: '/donor/dashboard',
  HOSPITAL: '/hospital/dashboard',
  BLOOD_BANK: '/blood-bank/dashboard',
  ADMIN: '/admin/dashboard',
  RECIPIENT: '/recipient/dashboard',
};

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading your JeevanLink session…</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Never send an authenticated user to the public landing page just because
  // they opened a route belonging to another role.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={rolePaths[user.role] || '/'} replace />;
  }

  return children;
};
