import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const SensorDetailsPanel = ({ latestSensorData, history }) => {
  if (!latestSensorData) return null;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Sensor Details</Typography>
        <List>
          <ListItem><ListItemText primary="Humidity" secondary={latestSensorData.humidity !== undefined ? `${latestSensorData.humidity}%` : 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Vibration" secondary={latestSensorData.vibration_level !== undefined ? `${latestSensorData.vibration_level}g` : 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Signal" secondary={latestSensorData.signal_strength !== undefined ? `${latestSensorData.signal_strength} dBm` : 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Speed" secondary={latestSensorData.speed !== undefined ? `${latestSensorData.speed} m/s` : 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Altitude" secondary={latestSensorData.altitude !== undefined ? `${latestSensorData.altitude} m` : 'N/A'} /></ListItem>
        </List>
        {/* Optionally, render a table of recent sensor readings */}
      </CardContent>
    </Card>
  );
};

export default SensorDetailsPanel; 