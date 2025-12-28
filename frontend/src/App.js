import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider, Box, AppBar, Toolbar, Button, Typography, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { AlertProvider } from './contexts/AlertContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransportFormPage from './pages/TransportFormPage';
import AuditReportsPage from './pages/AuditReportsPage';
import UAVManagement from './components/UAVManagement';
import TransportManagement from './components/TransportManagement';
import AlertManagement from './components/AlertManagement';
import BlockchainEventsViewer from './components/BlockchainEventsViewer';
import TransportDetailPage from './pages/TransportDetailPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea', // Indigo-purple
      light: '#a78bfa',
      dark: '#4F46E5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#764ba2', // Purple
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#fff',
    },
    success: {
      main: '#10B981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#06B6D4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    }, subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 400 },
    body1: { fontWeight: 400, fontSize: '1rem' },
    body2: { fontWeight: 400, fontSize: '0.95rem' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 4px rgba(102, 126, 234, 0.08)',
    '0px 4px 8px rgba(102, 126, 234, 0.12)',
    '0px 8px 16px rgba(102, 126, 234, 0.16)',
    '0px 12px 24px rgba(102, 126, 234, 0.2)',
    '0px 16px 32px rgba(102, 126, 234, 0.24)',
    '0px 20px 40px rgba(102, 126, 234, 0.28)',
    '0px 24px 48px rgba(102, 126, 234, 0.32)',
    '0px 2px 4px rgba(102, 126, 234, 0.08)',
    '0px 4px 8px rgba(102, 126, 234, 0.12)',
    '0px 8px 16px rgba(102, 126, 234, 0.16)',
    '0px 12px 24px rgba(102, 126, 234, 0.2)',
    '0px 16px 32px rgba(102, 126, 234, 0.24)',
    '0px 20px 40px rgba(102, 126, 234, 0.28)',
    '0px 24px 48px rgba(102, 126, 234, 0.32)',
    '0px 2px 4px rgba(102, 126, 234, 0.08)',
    '0px 4px 8px rgba(102, 126, 234, 0.12)',
    '0px 8px 16px rgba(102, 126, 234, 0.16)',
    '0px 12px 24px rgba(102, 126, 234, 0.2)',
    '0px 16px 32px rgba(102, 126, 234, 0.24)',
    '0px 20px 40px rgba(102, 126, 234, 0.28)',
    '0px 24px 48px rgba(102, 126, 234, 0.32)',
    '0px 2px 4px rgba(102, 126, 234, 0.08)',
    '0px 4px 8px rgba(102, 126, 234, 0.12)',
    '0px 8px 16px rgba(102, 126, 234, 0.16)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
        },
        a: {
          color: '#2563eb',
          textDecoration: 'none',
          transition: 'color 0.2s',
          '&:hover': {
            color: '#1e40af',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(102, 126, 234, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.2)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(102, 126, 234, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.12)',
        },
        elevation3: {
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.16)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.85)',
          color: '#1e293b',
          boxShadow: '0 2px 8px rgba(30,41,59,0.06)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '10px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(30,41,59,0.10)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Layout Component for Management Pages
const ManagementLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            STOT-UB Management
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <WebSocketProvider>
              <AlertProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transport/new"
                      element={
                        <ProtectedRoute>
                          <TransportFormPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transports"
                      element={
                        <ProtectedRoute>
                          <ManagementLayout>
                            <TransportManagement />
                          </ManagementLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/uavs"
                      element={
                        <ProtectedRoute>
                          <ManagementLayout>
                            <UAVManagement />
                          </ManagementLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/alerts"
                      element={
                        <ProtectedRoute>
                          <ManagementLayout>
                            <AlertManagement />
                          </ManagementLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blockchain-events"
                      element={
                        <ProtectedRoute>
                          <ManagementLayout>
                            <BlockchainEventsViewer />
                          </ManagementLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute>
                          <ManagementLayout>
                            <AuditReportsPage />
                          </ManagementLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transport/:transportId"
                      element={
                        <ProtectedRoute>
                          <TransportDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Router>
              </AlertProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  );
}

export default App; 