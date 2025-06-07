import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuth, hasRole } from '../utils/auth';
import VerifyForm from '../components/VerifyForm';

const VerifyPage = () => {
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
                        Verify Organ Delivery
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Confirm the successful delivery of an organ transport
                    </p>
                </div>
                <div className="mt-12">
                    <VerifyForm />
                </div>
            </div>
        </div>
    );
};

export default VerifyPage; 