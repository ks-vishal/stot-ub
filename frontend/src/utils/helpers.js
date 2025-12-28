import { format, parseISO } from 'date-fns';

// Date formatting helpers
export const formatDate = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDuration = (hours) => {
  if (!hours || hours <= 0) return 'N/A';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

// Status helpers
export const getStatusColor = (status) => {
  const statusColors = {
    completed: 'success',
    in_progress: 'primary',
    initiated: 'info',
    alert: 'error',
    maintenance: 'warning',
    available: 'success',
    in_use: 'primary',
    offline: 'error',
    normal: 'default',
    urgent: 'warning',
    critical: 'error'
  };
  return statusColors[status] || 'default';
};

export const getStatusIcon = (status) => {
  const statusIcons = {
    completed: '✓',
    in_progress: '⟳',
    initiated: '▶',
    alert: '⚠',
    maintenance: '🔧',
    available: '✓',
    in_use: '⟳',
    offline: '✗'
  };
  return statusIcons[status] || '•';
};

// Environmental data helpers
export const checkEnvironmentalAlert = (temperature, humidity) => {
  const alerts = [];
  
  if (temperature < 2 || temperature > 8) {
    alerts.push({
      type: 'error',
      message: `Temperature out of range: ${temperature}°C (should be 2-8°C)`
    });
  } else if (temperature < 3 || temperature > 7) {
    alerts.push({
      type: 'warning',
      message: `Temperature approaching limits: ${temperature}°C`
    });
  }
  
  if (humidity < 45 || humidity > 65) {
    alerts.push({
      type: 'error',
      message: `Humidity out of range: ${humidity}% (should be 45-65%)`
    });
  } else if (humidity < 50 || humidity > 60) {
    alerts.push({
      type: 'warning',
      message: `Humidity approaching limits: ${humidity}%`
    });
  }
  
  return alerts;
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// String helpers
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatCamelCase = (str) => {
  if (!str) return '';
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Number helpers
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toFixed(decimals);
};

export const formatPercentage = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return `${Number(num).toFixed(1)}%`;
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

// Object helpers
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Local storage helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle helper
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}; 