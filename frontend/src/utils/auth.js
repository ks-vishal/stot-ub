export const setAuthToken = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getRole = () => {
    return localStorage.getItem('role');
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const hasRole = (requiredRole) => {
    const userRole = getRole();
    return userRole === requiredRole;
};

export const requireAuth = (navigate) => {
    if (!isAuthenticated()) {
        navigate('/login');
        return false;
    }
    return true;
}; 