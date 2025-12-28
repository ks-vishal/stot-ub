import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuditReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transports, setTransports] = useState([]);
  const [blockchainEvents, setBlockchainEvents] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    transportId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch transports
      const transportResponse = await fetch('/api/transports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (transportResponse.ok) {
        const transportData = await transportResponse.json();
        setTransports(transportData.transports || []);
      }

      // Fetch blockchain events
      const eventResponse = await fetch('/api/blockchain-events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setBlockchainEvents(eventData.events || []);
      }
    } catch (error) {
      console.error('Error fetching audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const getEventTypeColor = (eventType) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const exportReport = (type) => {
    // Mock export functionality
    const data = type === 'transports' ? transports : blockchainEvents;
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0] || {}).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransports = transports.filter(transport => {
    if (filters.status !== 'all' && transport.status !== filters.status) return false;
    if (filters.transportId && !transport.transport_id?.includes(filters.transportId)) return false;
    if (filters.dateFrom && new Date(transport.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(transport.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  const filteredEvents = blockchainEvents.filter(event => {
    if (filters.transportId && !event.transport_id?.includes(filters.transportId)) return false;
    if (filters.dateFrom && new Date(event.timestamp) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(event.timestamp) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Audit Reports & Analytics
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{transports.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Transports</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{blockchainEvents.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Blockchain Events</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {transports.filter(t => t.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {transports.filter(t => t.status === 'in_progress').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Filters" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Date To"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Transport ID"
                  value={filters.transportId}
                  onChange={(e) => handleFilterChange('transportId', e.target.value)}
                  placeholder="Search by Transport ID"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Transport History" />
            <Tab label="Blockchain Audit Trail" />
          </Tabs>
        </Box>

        {/* Transport History Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Transport History</Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportReport('transports')}
              variant="outlined"
            >
              Export CSV
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transport ID</TableCell>
                    <TableCell>Organ Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransports.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell>{transport.transport_id}</TableCell>
                      <TableCell>{transport.organ?.organ_type || 'N/A'}</TableCell>
                      <TableCell>{transport.organ?.donor_hospital || 'N/A'}</TableCell>
                      <TableCell>{transport.organ?.recipient_hospital || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transport.status?.replace('_', ' ')} 
                          color={getStatusColor(transport.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(transport.created_at)}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/transport/${transport.transport_id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Blockchain Audit Trail Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Blockchain Audit Trail</Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportReport('events')}
              variant="outlined"
            >
              Export CSV
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Transport ID</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Blockchain Hash</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Chip 
                          label={event.event_type?.replace(/_/g, ' ')} 
                          color={getEventTypeColor(event.event_type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{event.transport_id}</TableCell>
                      <TableCell>{formatDate(event.timestamp)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {event.blockchain_hash?.substring(0, 16)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {event.details?.message || 'No details'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
} 