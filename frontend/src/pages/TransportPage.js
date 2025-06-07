import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuth, hasRole } from '../utils/auth';
import TransportForm from '../components/TransportForm';

const TransportPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!requireAuth(navigate)) return;
        if (!hasRole('hospital')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        New Transport Request
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Fill in the details below to initiate a new organ transport
                    </p>
                </div>
                <div className="mt-12">
                    <TransportForm />
                </div>
            </div>
        </div>
    );
};

export default TransportPage; 