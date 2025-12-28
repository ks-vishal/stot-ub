import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Avatar
} from '@mui/material';
import {
  LocalShipping,
  LocationOn,
  Schedule,
  Speed,
  Battery90,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';

const TransportStatus = ({ transport }) => {
  if (!transport) {
    return (
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Transport Status
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 'calc(100% - 60px)',
          flexDirection: 'column',
          gap: 2
        }}>
          <LocalShipping sx={{ fontSize: 60, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No active transport
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Start a new transport to begin monitoring
          </Typography>
        </Box>
      </Paper>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <LocalShipping color="primary" />;
      case 'pending':
        return <Schedule color="warning" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <LocalShipping color="default" />;
    }
  };

  const calculateProgress = () => {
    if (!transport.startTime || !transport.estimatedArrival) return 0;
    
    const start = new Date(transport.startTime).getTime();
    const end = new Date(transport.estimatedArrival).getTime();
    const now = Date.now();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getBatteryColor = (level) => {
    if (level <= 20) return 'error';
    if (level <= 40) return 'warning';
    return 'success';
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    
    return `${diffHours}h ${diffMins}m`;
  };

  const progress = calculateProgress();

  return (
    <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Transport Status
      </Typography>

      {/* Transport ID and Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar sx={{ bgcolor: `${getStatusColor(transport.status)}.main`, width: 32, height: 32 }}>
          {getStatusIcon(transport.status)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {transport.transportId || 'T001'}
          </Typography>
          <Chip 
            label={transport.status?.replace('_', ' ') || 'Unknown'} 
            size="small" 
            color={getStatusColor(transport.status)}
            variant="outlined"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          color={getStatusColor(transport.status)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Transport Details */}
      <Grid container spacing={2}>
        {/* Organ Info */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: 'primary.50', 
            borderRadius: 1,
            border: 1,
            borderColor: 'primary.200'
          }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Organ Details
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Type:</strong> {transport.organ?.organ_type || 'Heart'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Donor:</strong> {transport.organ?.donor_hospital || 'City General Hospital'}
            </Typography>
            <Typography variant="body2">
              <strong>Recipient:</strong> {transport.organ?.recipient_hospital || 'Metro Medical Center'}
            </Typography>
          </Box>
        </Grid>

        {/* UAV Info */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Speed sx={{ fontSize: 24, color: 'primary.main', mb: 0.5 }} />
            <Typography variant="body2" fontWeight="bold">
              {transport.speed || 0} km/h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Speed
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Battery90 
              sx={{ 
                fontSize: 24, 
                color: `${getBatteryColor(transport.batteryLevel || 80)}.main`, 
                mb: 0.5 
              }} 
            />
            <Typography variant="body2" fontWeight="bold">
              {transport.batteryLevel || 80}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Battery
            </Typography>
          </Box>
        </Grid>

        {/* Location Info */}
        <Grid item xs={12}>
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: 'info.50', 
            borderRadius: 1,
            border: 1,
            borderColor: 'info.200'
          }}>
            <Typography variant="subtitle2" color="info" gutterBottom>
              <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Current Location
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Lat:</strong> {transport.currentLocation?.lat || '40.7128°N'}
            </Typography>
            <Typography variant="body2">
              <strong>Lng:</strong> {transport.currentLocation?.lng || '-74.0060°W'}
            </Typography>
          </Box>
        </Grid>

        {/* Time Info */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Schedule sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" fontWeight="bold">
              {formatDuration(transport.startTime, transport.estimatedArrival)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Duration
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" fontWeight="bold">
              {transport.distance || 0} km
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Distance
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Alerts */}
      {transport.alerts && transport.alerts.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle2" color="warning" gutterBottom>
              <Warning sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Active Alerts
            </Typography>
            {transport.alerts.slice(0, 2).map((alert, index) => (
              <Chip 
                key={index}
                label={alert.message} 
                size="small" 
                color="warning" 
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            {transport.alerts.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{transport.alerts.length - 2} more alerts
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TransportStatus; 