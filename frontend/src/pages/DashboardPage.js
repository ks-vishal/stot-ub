import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requireAuth, hasRole } from '../utils/auth';
import { getTransportHistory } from '../utils/api';
import socketService from '../utils/socket';
import DataCard from '../components/DataCard';
import AlertModal from '../components/AlertModal';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [organId, setOrganId] = useState('');
    const [history, setHistory] = useState([]);
    const [sensorData, setSensorData] = useState(null);
    const [uavData, setUavData] = useState(null);
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!requireAuth(navigate)) return;

        // Connect to WebSocket
        const socket = socketService.connect();

        // Subscribe to real-time updates
        socketService.subscribe('sensorUpdate', (data) => {
            setSensorData(data);
        });

        socketService.subscribe('uavUpdate', (data) => {
            setUavData(data);
        });

        socketService.subscribe('alert', (alertData) => {
            setAlert(alertData);
            toast.error(`Alert: ${alertData.message}`);
        });

        return () => {
            socketService.unsubscribeAll();
            socketService.disconnect();
        };
    }, [navigate]);

    const fetchTransportHistory = async () => {
        if (!organId) {
            toast.warn('Please enter an Organ ID');
            return;
        }

        setLoading(true);
        try {
            const response = await getTransportHistory(organId);
            setHistory(response.history);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch transport history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Transport Monitoring Dashboard
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        {hasRole('hospital') && (
                            <button
                                type="button"
                                onClick={() => navigate('/transport/new')}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                New Transport
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6">
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text"
                            value={organId}
                            onChange={(e) => setOrganId(e.target.value)}
                            placeholder="Enter Organ ID"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300"
                        />
                        <button
                            type="button"
                            onClick={fetchTransportHistory}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Alert */}
                {alert && (
                    <div className="mt-6">
                        <AlertModal alert={alert} onDismiss={() => setAlert(null)} />
                    </div>
                )}

                {/* Data Grid */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Transport History */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Transport History
                            </h3>
                            <div className="mt-4">
                                {history.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-my-5 divide-y divide-gray-200">
                                            {history.map((item, index) => (
                                                <li key={index} className="py-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                From: {item.sourceHospital}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                To: {item.destinationHospital}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(item.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {item.alert && (
                                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Alert
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No history available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Real-time Data */}
                    <div className="space-y-6">
                        <DataCard
                            title="Sensor Data"
                            data={sensorData}
                            loading={false}
                        />
                        <DataCard
                            title="UAV Data"
                            data={uavData}
                            loading={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 