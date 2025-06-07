import React from 'react';
import { toast } from 'react-toastify';

const AlertModal = ({ alert, onDismiss }) => {
    const getAlertColor = () => {
        switch (alert?.type) {
            case 'temperature':
                return 'bg-red-50 text-red-800 border-red-200';
            case 'humidity':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'shock':
                return 'bg-orange-50 text-orange-800 border-orange-200';
            default:
                return 'bg-blue-50 text-blue-800 border-blue-200';
        }
    };

    const getAlertIcon = () => {
        switch (alert?.type) {
            case 'temperature':
                return (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                );
            case 'humidity':
                return (
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                );
            case 'shock':
                return (
                    <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const handleDismiss = () => {
        onDismiss();
        toast.info('Alert dismissed');
    };

    if (!alert) return null;

    return (
        <div className={`rounded-md border p-4 ${getAlertColor()}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {getAlertIcon()}
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium">
                        Alert for Organ ID: {alert.organId}
                    </h3>
                    <div className="mt-2 text-sm">
                        <p>{alert.message}</p>
                        {alert.data && (
                            <div className="mt-2 space-y-1">
                                {Object.entries(alert.data).map(([key, value]) => (
                                    key !== 'timestamp' && (
                                        <div key={key} className="flex justify-between text-xs">
                                            <span className="font-medium">{key}:</span>
                                            <span>{value}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                        {alert.data?.timestamp && (
                            <div className="mt-2 text-xs">
                                <span className="font-medium">Time:</span>{' '}
                                {new Date(alert.data.timestamp).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                getAlertColor().replace('bg-', 'hover:bg-').replace('text-', 'hover:text-')
                            }`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal; 