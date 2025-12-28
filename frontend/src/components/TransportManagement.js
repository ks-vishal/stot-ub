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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  LocationOn as ArriveIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TransportManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [organs, setOrgans] = useState([]);
  const [uavs, setUavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [formData, setFormData] = useState({
    organ_id: '',
    uav_id: '',
    route_notes: '',
    special_instructions: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transportsRes, organsRes, uavsRes] = await Promise.all([
        fetch('/api/transports', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/organs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/uavs', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [transportsData, organsData, uavsData] = await Promise.all([
        transportsRes.json(),
        organsRes.json(),
        uavsRes.json()
      ]);

      if (transportsData.success) setTransports(transportsData.transports);
      if (organsData.success) setOrgans(organsData.organs);
      if (uavsData.success) setUavs(uavsData.uavs);
    } catch (error) {
      setError('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      organ_id: '',
      uav_id: '',
      route_notes: '',
      special_instructions: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/transports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organ_id: formData.organ_id,
          uav_id: formData.uav_id,
          route_notes: formData.route_notes,
          special_instructions: formData.special_instructions
        })
      });
      const data = await response.json();
      if (data.success) {
        handleCloseDialog();
        fetchData();
      } else {
        setError(data.message || 'Failed to create transport');
      }
    } catch (error) {
      setError('Error creating transport');
      console.error('Error:', error);
    }
  };

  const handleAction = async (transportId, action) => {
    try {
      const response = await fetch(`/api/transports/${transportId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || `Failed to ${action} transport`);
      }
    } catch (error) {
      setError(`Error ${action}ing transport`);
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'arrived': return 'success';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'in_progress': return 1;
      case 'arrived': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const getAvailableUAVs = () => {
    return uavs.filter(uav => uav.status === 'available');
  };

  const getAvailableOrgans = () => {
    return organs.filter(organ => organ.status === 'pending');
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
          Transport Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Transport
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Transport Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transport Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transports: {transports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending: {transports.filter(t => t.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress: {transports.filter(t => t.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed: {transports.filter(t => t.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Transport Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Organ</TableCell>
                  <TableCell>UAV</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transports.map((transport) => (
                  <TableRow key={transport.id}>
                    <TableCell>{transport.id}</TableCell>
                    <TableCell>
                      {transport.organ?.organ_type} ({transport.organ?.organ_id})
                    </TableCell>
                    <TableCell>{transport.uav?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={transport.status}
                        color={getStatusColor(transport.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transport.estimated_duration} min</TableCell>
                    <TableCell>
                      <Chip
                        label={transport.priority}
                        color={transport.priority === 'high' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/transport/${transport.transport_id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {transport.status === 'pending' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAction(transport.id, 'start')}
                        >
                          <StartIcon />
                        </IconButton>
                      )}
                      {transport.status === 'in_progress' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAction(transport.id, 'arrive')}
                        >
                          <ArriveIcon />
                        </IconButton>
                      )}
                      {transport.status === 'arrived' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAction(transport.id, 'complete')}
                        >
                          <CompleteIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/transport/${transport.transport_id}/timeline`)}
                      >
                        <TimelineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Create Transport Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Transport</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Organ</InputLabel>
                  <Select
                    value={formData.organ_id}
                    onChange={(e) => setFormData({ ...formData, organ_id: e.target.value })}
                    label="Organ"
                  >
                    {getAvailableOrgans().map((organ) => (
                      <MenuItem key={organ.organ_id} value={organ.organ_id}>
                        {organ.organ_type} - {organ.organ_id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>UAV</InputLabel>
                  <Select
                    value={formData.uav_id}
                    onChange={(e) => setFormData({ ...formData, uav_id: e.target.value })}
                    label="UAV"
                  >
                    {getAvailableUAVs().map((uav) => (
                      <MenuItem key={uav.id} value={uav.id}>
                        {uav.name} ({uav.model})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Route Notes"
                  multiline
                  rows={3}
                  value={formData.route_notes}
                  onChange={(e) => setFormData({ ...formData, route_notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  multiline
                  rows={2}
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Transport
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransportManagement; 