import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

const UAVDetailsPanel = ({ uav, operator }) => {
  if (!uav) return null;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">UAV Details</Typography>
        <List>
          <ListItem><ListItemText primary="Model" secondary={uav.model || 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Manufacturer" secondary={uav.manufacturer || 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Status" secondary={uav.status || 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Battery" secondary={uav.current_battery ? `${uav.current_battery} Ah` : 'N/A'} /></ListItem>
          <ListItem><ListItemText primary="Max Payload" secondary={uav.max_payload ? `${uav.max_payload} kg` : 'N/A'} /></ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default UAVDetailsPanel; 