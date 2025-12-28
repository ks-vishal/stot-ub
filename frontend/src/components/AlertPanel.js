import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Collapse,
  Badge,
  Alert,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore,
  ExpandLess,
  Clear as ClearIcon
} from '@mui/icons-material';

const AlertPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        setUnreadCount(data.alerts?.filter(alert => !alert.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Mock data for demonstration
      setAlerts([
        {
          id: 1,
          type: 'warning',
          message: 'Temperature approaching upper limit: 7.2°C',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          transport_id: 'T001'
        },
        {
          id: 2,
          type: 'error',
          message: 'UAV battery level critical: 15%',
          timestamp: new Date(Date.now() - 600000),
          read: false,
          transport_id: 'T001'
        },
        {
          id: 3,
          type: 'info',
          message: 'Transport T001 arrived at destination',
          timestamp: new Date(Date.now() - 900000),
          read: true,
          transport_id: 'T001'
        }
      ]);
      setUnreadCount(2);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="default" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const markAsRead = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert =>
          alert.id === alertId ? { ...alert, read: true } : alert
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const clearAllAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAlerts([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Paper sx={{ p: 2, height: 400, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon color="primary" />
          </Badge>
          <Typography variant="h6">
            Alerts & Notifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={clearAllAlerts}>
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ height: 320, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Loading alerts...
              </Typography>
            </Box>
          ) : sortedAlerts.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                No alerts to display
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sortedAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem
                    sx={{
                      py: 1,
                      backgroundColor: alert.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {alert.message}
                          </Typography>
                          {!alert.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(alert.timestamp)}
                          </Typography>
                          {alert.transport_id && (
                            <Chip
                              label={`Transport ${alert.transport_id}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />

                    {!alert.read && (
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(alert.id)}
                        sx={{ ml: 1 }}
                      >
                        <SuccessIcon fontSize="small" color="success" />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < sortedAlerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AlertPanel; 