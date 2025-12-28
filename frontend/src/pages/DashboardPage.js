import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LocalShipping,
  Flight,
  Warning,
  Timeline,
  Assessment,
  Logout,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/WebSocketContext';
import { useAlert } from '../contexts/AlertContext';
import { useNavigate, Link } from 'react-router-dom';
import TransportMap from '../components/TransportMap';
import EnvironmentalCharts from '../components/EnvironmentalCharts';
import ChainOfCustody from '../components/ChainOfCustody';
import AlertPanel from '../components/AlertPanel';
import TransportStatus from '../components/TransportStatus';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Transport Management', icon: <LocalShipping />, path: '/transports' },
  { text: 'UAV Management', icon: <Flight />, path: '/uavs' },
  { text: 'Alert Management', icon: <Warning />, path: '/alerts' },
  { text: 'Blockchain Events', icon: <Timeline />, path: '/blockchain-events' },
  { text: 'Audit Reports', icon: <Assessment />, path: '/reports' },
  { text: 'New Transport', icon: <AddIcon />, path: '/transport/new' }
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTransport, setActiveTransport] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: [],
    humidity: []
  });

  useEffect(() => {
    if (socket) {
      socket.on('transport_update', (data) => {
        setActiveTransport(data);
      });

      socket.on('sensorData', (data) => {
        setEnvironmentalData(prev => ({
          temperature: [...prev.temperature.slice(-50), data.temperature],
          humidity: [...prev.humidity.slice(-50), data.humidity]
        }));
      });

      socket.on('alert', (data) => {
        addAlert(data.alerts);
      });

      return () => {
        socket.off('transport_update');
        socket.off('sensorData');
        socket.off('alert');
      };
    }
  }, [socket, addAlert]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            STOT-UB Dashboard
          </Typography>
          <Chip
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
            sx={{ mr: 2 }}
          />
          <Chip
            label={user?.role || 'User'}
            color="secondary"
            size="small"
            sx={{ mr: 2 }}
          />
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        <Container maxWidth="xl">
          {/* Welcome Section */}
          <Box mb={4}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.name || 'Operator'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage organ transportation operations in real-time.
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/transport/new')}
                      fullWidth
                    >
                      New Transport
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate('/transports')}
                      fullWidth
                    >
                      View Transports
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Flight />}
                      onClick={() => navigate('/uavs')}
                      fullWidth
                    >
                      Manage UAVs
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* System Status */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label={`WebSocket: ${isConnected ? 'Connected' : 'Disconnected'}`}
                      color={isConnected ? 'success' : 'error'}
                      size="small"
                    />
                    <Chip
                      label={`User: ${user?.role || 'Operator'}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Active Transports: ${activeTransport ? '1' : '0'}`}
                      color="info"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Environmental Monitoring */}
            <Grid item xs={12} md={6}>
              <EnvironmentalCharts data={environmentalData} />
            </Grid>
          </Grid>

          {/* Main Dashboard Content */}
          <Grid container spacing={3}>
            {/* Transport Map */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Live Transport Tracking
                  </Typography>
                  <TransportMap transport={activeTransport} />
                  {activeTransport && (
                    <Box sx={{ mt: 2 }}>
                      <Link to={`/transport/${activeTransport.transport_id}`}>View Live Transport Details</Link>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Alert Panel */}
            <Grid item xs={12} lg={4}>
              <AlertPanel />
            </Grid>

            {/* Active Transport Status */}
            {activeTransport && (
              <Grid item xs={12}>
                <TransportStatus transport={activeTransport} />
              </Grid>
            )}

            {/* Chain of Custody */}
            {activeTransport && (
              <Grid item xs={12}>
                <ChainOfCustody transportId={activeTransport.id} />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
} 