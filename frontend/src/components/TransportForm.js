import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { initiateTransport } from '../utils/api';

const TransportForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organID: '',
        sourceHospital: '',
        destinationHospital: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await initiateTransport(formData);
            toast.success('Transport initiated successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate transport');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Initiate Transport</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="organID" className="block text-sm font-medium text-gray-700">
                        Organ ID
                    </label>
                    <input
                        type="text"
                        id="organID"
                        name="organID"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.organID}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="sourceHospital" className="block text-sm font-medium text-gray-700">
                        Source Hospital
                    </label>
                    <input
                        type="text"
                        id="sourceHospital"
                        name="sourceHospital"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.sourceHospital}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="destinationHospital" className="block text-sm font-medium text-gray-700">
                        Destination Hospital
                    </label>
                    <input
                        type="text"
                        id="destinationHospital"
                        name="destinationHospital"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.destinationHospital}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Initiating...
                            </>
                        ) : 'Initiate Transport'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransportForm; 