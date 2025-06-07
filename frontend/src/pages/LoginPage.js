import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <LoginForm />
        </div>
    );
};

export default LoginPage; 