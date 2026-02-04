import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/error/AccessDenied';

const ProtectedRoute = ({ children, feature }) => {
    const token = localStorage.getItem('token');

    // Redirect to login if no token exists
    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    const { hasPermission, loading, mustChangePassword } = useAuth();

    // Force password change if required
    if (mustChangePassword) {
        return <Navigate to="/auth/change-password" replace />;
    }

    if (loading) {
        return <div style={loadingStyle}>Authenticating Secure Connection...</div>;
    }

    const authorized = hasPermission(feature, 'Read');

    if (!authorized) {
        return <AccessDenied feature={feature} />;
    }

    return children;
};

const loadingStyle = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    backgroundColor: '#f8fafc'
};

export default ProtectedRoute;
