import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ResolveIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  Warning,
  Error,
  Info,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AlertManagement = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    alertType: '',
    isResolved: ''
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.alertType) queryParams.append('alertType', filters.alertType);
      if (filters.isResolved !== '') queryParams.append('isResolved', filters.isResolved);

      const response = await fetch(`/api/alerts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      } else {
        setError('Failed to fetch alerts');
      }
    } catch (error) {
      setError('Error fetching alerts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolutionNotes: 'Resolved by operator'
        })
      });
      
      const data = await response.json();
      if (data.message) {
        fetchAlerts();
      } else {
        setError('Failed to resolve alert');
      }
    } catch (error) {
      setError('Error resolving alert');
      console.error('Error:', error);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      } else {
        setError('Failed to mark alert as read');
      }
    } catch (error) {
      setError('Error marking alert as read');
      console.error('Error:', error);
    }
  };

  const handleClearAllAlerts = async () => {
    if (!window.confirm('Are you sure you want to clear all unresolved alerts?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/alerts/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
      } else {
        setError('Failed to clear alerts');
      }
    } catch (error) {
      setError('Error clearing alerts');
      console.error('Error:', error);
    }
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setOpenDialog(true);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="warning" />;
      case 'medium':
        return <Info color="info" />;
      case 'low':
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Alert Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAlerts}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClearAllAlerts}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Alert Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alert Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Alerts: {alerts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unresolved: {alerts.filter(a => !a.is_resolved).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical: {alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High: {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Filters */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={filters.severity}
                      onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                      label="Severity"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.isResolved}
                      onChange={(e) => setFilters({ ...filters, isResolved: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="false">Unresolved</MenuItem>
                      <MenuItem value="true">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Alert Type"
                    value={filters.alertType}
                    onChange={(e) => setFilters({ ...filters, alertType: e.target.value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Severity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Transport</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getSeverityIcon(alert.severity)}
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{alert.alert_type}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {alert.transport?.id ? `Transport #${alert.transport.id}` : 'N/A'}
                    </TableCell>
                    <TableCell>{formatTimestamp(alert.created_at)}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.is_resolved ? 'Resolved' : 'Active'}
                        color={alert.is_resolved ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewAlert(alert)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {!alert.is_resolved && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <ResolveIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Alert Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Alert Details
          {selectedAlert && (
            <Box display="flex" alignItems="center" mt={1}>
              {getSeverityIcon(selectedAlert.severity)}
              <Chip
                label={selectedAlert.severity}
                color={getSeverityColor(selectedAlert.severity)}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Alert Type"
                  secondary={selectedAlert.alert_type}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Message"
                  secondary={selectedAlert.message}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={formatTimestamp(selectedAlert.created_at)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={selectedAlert.is_resolved ? 'Resolved' : 'Active'}
                />
              </ListItem>
              {selectedAlert.transport && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Related Transport"
                      secondary={`Transport #${selectedAlert.transport.id}`}
                    />
                  </ListItem>
                </>
              )}
              {selectedAlert.organ && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Related Organ"
                      secondary={`${selectedAlert.organ.organ_type} - ${selectedAlert.organ.organ_id}`}
                    />
                  </ListItem>
                </>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedAlert && !selectedAlert.is_resolved && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleResolveAlert(selectedAlert.id);
                setOpenDialog(false);
              }}
            >
              Resolve Alert
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertManagement; 