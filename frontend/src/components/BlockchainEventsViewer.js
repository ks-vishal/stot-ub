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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  LocalShipping as TransportIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const BlockchainEventsViewer = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    event_type: '',
    transport_id: '',
    organ_id: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.event_type) queryParams.append('event_type', filters.event_type);
      if (filters.transport_id) queryParams.append('transport_id', filters.transport_id);
      if (filters.organ_id) queryParams.append('organ_id', filters.organ_id);

      const response = await fetch(`/api/blockchain-events?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setError('Failed to fetch blockchain events');
      }
    } catch (error) {
      setError('Error fetching blockchain events');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'transport_created':
      case 'transport_started':
      case 'transport_completed':
        return <TransportIcon color="primary" />;
      case 'organ_registered':
      case 'organ_retrieved':
        return <PersonIcon color="success" />;
      case 'container_assigned':
      case 'container_sealed':
      case 'container_unsealed':
        return <SecurityIcon color="warning" />;
      case 'arrival_confirmed':
        return <ScheduleIcon color="info" />;
      default:
        return <TimelineIcon color="default" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'transport_created':
      case 'transport_started':
        return 'primary';
      case 'transport_completed':
      case 'organ_registered':
        return 'success';
      case 'container_assigned':
      case 'container_sealed':
      case 'container_unsealed':
        return 'warning';
      case 'arrival_confirmed':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatEventType = (eventType) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEventDetails = (event) => {
    const details = [];
    
    if (event.transport_id) {
      details.push({ label: 'Transport ID', value: event.transport_id });
    }
    if (event.organ_id) {
      details.push({ label: 'Organ ID', value: event.organ_id });
    }
    if (event.uav_id) {
      details.push({ label: 'UAV ID', value: event.uav_id });
    }
    if (event.operator_id) {
      details.push({ label: 'Operator ID', value: event.operator_id });
    }
    if (event.transaction_hash) {
      details.push({ 
        label: 'Transaction Hash', 
        value: event.transaction_hash,
        isHash: true
      });
    }
    if (event.event_data) {
      try {
        const parsedData = typeof event.event_data === 'string' 
          ? JSON.parse(event.event_data) 
          : event.event_data;
        
        Object.entries(parsedData).forEach(([key, value]) => {
          details.push({ 
            label: key.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '), 
            value: value 
          });
        });
      } catch (e) {
        details.push({ label: 'Event Data', value: event.event_data });
      }
    }
    
    return details;
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
          Blockchain Events
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchEvents}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Event Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Events: {events.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transport Events: {events.filter(e => e.event_type.includes('transport')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organ Events: {events.filter(e => e.event_type.includes('organ')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Container Events: {events.filter(e => e.event_type.includes('container')).length}
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
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={filters.event_type}
                      onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
                      label="Event Type"
                    >
                      <MenuItem value="">All Events</MenuItem>
                      <MenuItem value="transport_created">Transport Created</MenuItem>
                      <MenuItem value="transport_started">Transport Started</MenuItem>
                      <MenuItem value="transport_completed">Transport Completed</MenuItem>
                      <MenuItem value="organ_registered">Organ Registered</MenuItem>
                      <MenuItem value="container_assigned">Container Assigned</MenuItem>
                      <MenuItem value="container_sealed">Container Sealed</MenuItem>
                      <MenuItem value="container_unsealed">Container Unsealed</MenuItem>
                      <MenuItem value="arrival_confirmed">Arrival Confirmed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Transport ID"
                    value={filters.transport_id}
                    onChange={(e) => setFilters({ ...filters, transport_id: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Organ ID"
                    value={filters.organ_id}
                    onChange={(e) => setFilters({ ...filters, organ_id: e.target.value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Events Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Transport ID</TableCell>
                  <TableCell>Organ ID</TableCell>
                  <TableCell>UAV ID</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getEventIcon(event.event_type)}
                        <Chip
                          label={formatEventType(event.event_type)}
                          color={getEventColor(event.event_type)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{event.transport_id || 'N/A'}</TableCell>
                    <TableCell>{event.organ_id || 'N/A'}</TableCell>
                    <TableCell>{event.uav_id || 'N/A'}</TableCell>
                    <TableCell>{event.operator_id || 'N/A'}</TableCell>
                    <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewEvent(event)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {selectedEvent && getEventIcon(selectedEvent.event_type)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {selectedEvent && formatEventType(selectedEvent.event_type)}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Event Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {getEventDetails(selectedEvent).map((detail, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={detail.label}
                            secondary={
                              detail.isHash ? (
                                <Typography
                                  variant="body2"
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    wordBreak: 'break-all'
                                  }}
                                >
                                  {detail.value}
                                </Typography>
                              ) : (
                                detail.value
                              )
                            }
                          />
                        </ListItem>
                        {index < getEventDetails(selectedEvent).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Raw Event Data</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {JSON.stringify(selectedEvent, null, 2)}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockchainEventsViewer; 