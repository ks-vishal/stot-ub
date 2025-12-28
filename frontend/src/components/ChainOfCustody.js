import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalShipping,
  CheckCircle,
  Warning,
  Info,
  Security,
  LocationOn,
  Schedule
} from '@mui/icons-material';

const ChainOfCustody = ({ transportId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (transportId) {
      fetchChainOfCustody();
    }
  }, [transportId]);

  const fetchChainOfCustody = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transports/${transportId}/chain-of-custody`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching chain of custody:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'organ_retrieved':
        return <LocationOn color="primary" />;
      case 'transport_created':
        return <LocalShipping color="primary" />;
      case 'container_assigned':
        return <Security color="primary" />;
      case 'container_sealed':
        return <Security color="success" />;
      case 'transport_started':
        return <LocalShipping color="info" />;
      case 'location_update':
        return <LocationOn color="info" />;
      case 'arrival_confirmed':
        return <CheckCircle color="success" />;
      case 'container_unsealed':
        return <Security color="warning" />;
      case 'transport_completed':
        return <CheckCircle color="success" />;
      case 'alert_triggered':
        return <Warning color="error" />;
      default:
        return <Info color="default" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'organ_retrieved':
      case 'transport_created':
      case 'container_assigned':
        return 'primary';
      case 'container_sealed':
      case 'arrival_confirmed':
      case 'transport_completed':
        return 'success';
      case 'transport_started':
      case 'location_update':
        return 'info';
      case 'container_unsealed':
        return 'warning';
      case 'alert_triggered':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getEventDescription = (event) => {
    switch (event.event_type) {
      case 'organ_retrieved':
        return `Organ retrieved from ${event.details?.donor_hospital || 'donor hospital'}`;
      case 'transport_created':
        return `Transport created with ID: ${event.transport_id}`;
      case 'container_assigned':
        return `Container ${event.details?.container_id || 'N/A'} assigned to UAV ${event.details?.uav_id || 'N/A'}`;
      case 'container_sealed':
        return `Container sealed with hash: ${event.blockchain_hash?.substring(0, 16)}...`;
      case 'transport_started':
        return `Transport started from ${event.details?.source || 'source'}`;
      case 'location_update':
        return `Location updated: ${event.details?.latitude}, ${event.details?.longitude}`;
      case 'arrival_confirmed':
        return `Arrival confirmed at ${event.details?.destination || 'destination'}`;
      case 'container_unsealed':
        return `Container unsealed with hash: ${event.blockchain_hash?.substring(0, 16)}...`;
      case 'transport_completed':
        return `Transport completed successfully`;
      case 'alert_triggered':
        return `Alert: ${event.details?.message || 'Unknown alert'}`;
      default:
        return event.details?.message || 'Event occurred';
    }
  };

  if (!transportId) {
    return (
      <Paper sx={{ p: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Chain of Custody
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 'calc(100% - 60px)' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Select a transport to view chain of custody
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Chain of Custody
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ height: 320, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Loading chain of custody...
              </Typography>
            </Box>
          ) : events.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                No chain of custody events found
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {events.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemIcon>
                      {getEventIcon(event.event_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {getEventDescription(event)}
                          </Typography>
                          <Chip 
                            label={event.event_type.replace(/_/g, ' ')} 
                            size="small" 
                            color={getEventColor(event.event_type)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(event.timestamp)}
                          </Typography>
                          {event.blockchain_hash && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              Hash: {event.blockchain_hash.substring(0, 32)}...
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < events.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ChainOfCustody; 