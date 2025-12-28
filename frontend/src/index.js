import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { logFrontendError } from './utils/errorLogger';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.onerror = function (message, source, lineno, colno, error) {
  logFrontendError(message, { source, lineno, colno, stack: error?.stack });
};
window.onunhandledrejection = function (event) {
  logFrontendError(event.reason?.message || 'Unhandled rejection', { stack: event.reason?.stack });
}; 