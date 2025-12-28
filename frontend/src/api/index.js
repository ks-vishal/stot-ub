import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Auth
export function login(username, password) {
  return api.post('/auth/login', { username, password });
}
export function verify() {
  return api.get('/auth/verify');
}

// Transport
export function createTransport(data) {
  return api.post('/transport/create', data);
}
export function trackTransport(transportId) {
  return api.get(`/transport/track/${transportId}`);
}
export function completeTransport(data) {
  return api.post('/transport/complete', data);
}

// Sensors
export function getRealtimeData(transportId) {
  return api.get(`/sensors/realtime/${transportId}`);
}
export function getAlerts(transportId) {
  return api.get(`/sensors/alerts/${transportId}`);
}

// Blockchain
export function getOrgan(organId) {
  return api.get(`/blockchain/organ/${organId}`);
}
export function getTransportBlockchain(transportId) {
  return api.get(`/blockchain/transport/${transportId}`);
}

// Reports
export function getAuditTrail() {
  return api.get('/reports/audit');
}
export function getOrganHistory(organId) {
  return api.get(`/reports/history/${organId}`);
} 