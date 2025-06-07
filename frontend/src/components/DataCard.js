import React from 'react';

const DataCard = ({ title, data, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="mt-4 flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="mt-4 text-red-600">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="mt-4 text-gray-500">
                        No data available
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <div className="mt-4 space-y-4">
                    {Object.entries(data).map(([key, value]) => {
                        // Skip timestamp for now, it will be displayed separately
                        if (key === 'timestamp') return null;

                        // Handle nested objects (like GPS coordinates)
                        if (typeof value === 'object' && value !== null) {
                            return (
                                <div key={key} className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500 uppercase">{key}</h4>
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <div key={`${key}-${subKey}`} className="flex justify-between">
                                            <span className="text-sm text-gray-500">{subKey}</span>
                                            <span className="text-sm font-medium text-gray-900">{subValue}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        return (
                            <div key={key} className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500 uppercase">{key}</span>
                                <span className="text-sm font-medium text-gray-900">{value}</span>
                            </div>
                        );
                    })}
                    {data.timestamp && (
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Last updated</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(data.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataCard; 