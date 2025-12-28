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
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Battery90,
  Battery60,
  Battery30,
  Battery20
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UAVManagement = () => {
  const { token } = useAuth();
  const [uavs, setUavs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUAV, setEditingUAV] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    status: 'available',
    battery_level: 100,
    location: 'hangar'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUAVs();
  }, []);

  const fetchUAVs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/uavs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUavs(data.uavs);
      } else {
        setError('Failed to fetch UAVs');
      }
    } catch (error) {
      setError('Error fetching UAVs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (uav = null) => {
    if (uav) {
      setEditingUAV(uav);
      setFormData({
        name: uav.name,
        model: uav.model,
        status: uav.status,
        battery_level: uav.battery_level,
        location: uav.location
      });
    } else {
      setEditingUAV(null);
      setFormData({
        name: '',
        model: '',
        status: 'available',
        battery_level: 100,
        location: 'hangar'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUAV(null);
    setFormData({
      name: '',
      model: '',
      status: 'available',
      battery_level: 100,
      location: 'hangar'
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingUAV 
        ? `/api/uavs/${editingUAV.id}`
        : '/api/uavs';
      
      const method = editingUAV ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        handleCloseDialog();
        fetchUAVs();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      setError('Error saving UAV');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (uavId) => {
    if (!window.confirm('Are you sure you want to delete this UAV?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/uavs/${uavId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUAVs();
      } else {
        setError(data.message || 'Failed to delete UAV');
      }
    } catch (error) {
      setError('Error deleting UAV');
      console.error('Error:', error);
    }
  };

  const getBatteryIcon = (level) => {
    if (level >= 80) return <Battery90 color="success" />;
    if (level >= 60) return <Battery60 color="warning" />;
    if (level >= 30) return <Battery30 color="warning" />;
    return <Battery20 color="error" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'warning';
      case 'maintenance': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
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
          UAV Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUAVs}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add UAV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* UAV Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                UAV Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total UAVs: {uavs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available: {uavs.filter(u => u.status === 'available').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned: {uavs.filter(u => u.status === 'assigned').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maintenance: {uavs.filter(u => u.status === 'maintenance').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* UAV Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uavs.map((uav) => (
                  <TableRow key={uav.id}>
                    <TableCell>{uav.name}</TableCell>
                    <TableCell>{uav.model}</TableCell>
                    <TableCell>
                      <Chip
                        label={uav.status}
                        color={getStatusColor(uav.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getBatteryIcon(uav.battery_level)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {uav.battery_level}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{uav.location}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(uav)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(uav.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add/Edit UAV Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUAV ? 'Edit UAV' : 'Add New UAV'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="UAV Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Battery Level (%)"
                  type="number"
                  value={formData.battery_level}
                  onChange={(e) => setFormData({ ...formData, battery_level: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUAV ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UAVManagement; 