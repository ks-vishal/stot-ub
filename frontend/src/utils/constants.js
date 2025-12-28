// Application Constants
export const APP_NAME = 'STOT-UB';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// WebSocket Events
export const WS_EVENTS = {
  TRANSPORT_UPDATE: 'transport_update',
  SENSOR_DATA: 'sensor_data',
  ALERT: 'alert',
  UAV_STATUS: 'uav_status',
  BLOCKCHAIN_EVENT: 'blockchain_event'
};

// Transport Status
export const TRANSPORT_STATUS = {
  INITIATED: 'initiated',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ALERT: 'alert'
};

// Alert Types
export const ALERT_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

// Environmental Thresholds
export const ENVIRONMENTAL_THRESHOLDS = {
  TEMPERATURE: {
    MIN: 2,
    MAX: 8,
    WARNING_MIN: 3,
    WARNING_MAX: 7
  },
  HUMIDITY: {
    MIN: 45,
    MAX: 65,
    WARNING_MIN: 50,
    WARNING_MAX: 60
  }
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  DOCTOR: 'doctor',
  TECHNICIAN: 'technician',
  VIEWER: 'viewer'
};

// UAV Status
export const UAV_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline'
};

// Blockchain Event Types
export const BLOCKCHAIN_EVENTS = {
  ORGAN_CREATED: 'OrganCreated',
  TRANSPORT_INITIATED: 'TransportInitiated',
  CUSTODY_TRANSFERRED: 'CustodyTransferred',
  TRANSPORT_COMPLETED: 'TransportCompleted',
  ALERT_TRIGGERED: 'AlertTriggered'
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [40.7128, -74.0060], // New York
  DEFAULT_ZOOM: 10,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

// Chart Colors
export const CHART_COLORS = {
  TEMPERATURE: '#ff6b35',
  HUMIDITY: '#4ecdc4',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd HH:mm:ss',
  SHORT: 'MM/dd/yyyy'
}; 