import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const steps = ['Organ Details', 'Transport Information', 'Route Planning', 'Confirmation'];

export default function TransportFormPage() {
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uavs, setUavs] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [organs, setOrgans] = useState([]);

  const [formData, setFormData] = useState({
    organId: '',
    donorHospital: '',
    recipientHospital: '',
    // urgency: 'normal', // Remove if not used elsewhere
    uavId: '',
    routeNotes: '',
    specialInstructions: '',
    confirmed: false
  });

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch available UAVs
      const uavResponse = await fetch('/api/uavs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (uavResponse.ok) {
        const uavData = await uavResponse.json();
        setUavs(uavData.uavs || []);
      }

      // Fetch available organs
      const organResponse = await fetch('/api/organs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (organResponse.ok) {
        const organData = await organResponse.json();
        setOrgans(organData.organs || []);
      }

      // Mock hospitals data
      setHospitals([
        { id: 1, name: 'City General Hospital', location: 'New York, NY' },
        { id: 2, name: 'Memorial Medical Center', location: 'Boston, MA' },
        { id: 3, name: 'University Hospital', location: 'Philadelphia, PA' },
        { id: 4, name: 'Metro Medical Center', location: 'Chicago, IL' },
        { id: 5, name: 'Regional Health Center', location: 'Los Angeles, CA' }
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addAlert({
        type: 'error',
        message: 'Failed to load initial data',
        title: 'Error'
      });
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.organId || !formData.donorHospital || !formData.recipientHospital) {
          addAlert({
            type: 'error',
            message: 'Please fill in all required organ details',
            title: 'Validation Error'
          });
          return false;
        }
        break;
      case 1:
        if (!formData.uavId) {
          addAlert({
            type: 'error',
            message: 'Please select a UAV',
            title: 'Validation Error'
          });
          return false;
        }
        break;
      case 2:
        if (!formData.routeNotes || !formData.specialInstructions) {
          addAlert({
            type: 'error',
            message: 'Please fill in route notes and special instructions',
            title: 'Validation Error'
          });
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const transportResponse = await fetch('/api/transports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          organ_id: formData.organId,
          uav_id: formData.uavId,
          route_notes: formData.routeNotes,
          special_instructions: formData.specialInstructions
        })
      });
      if (!transportResponse.ok) {
        throw new Error('Failed to create transport');
      }
      const transportData = await transportResponse.json();
      addAlert({
        type: 'success',
        message: `Transport created successfully! Transport ID: ${transportData.transport.transport_id}`,
        title: 'Success'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating transport:', error);
      addAlert({
        type: 'error',
        message: error.message || 'Failed to create transport',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Organ</InputLabel>
                <Select
                  value={formData.organId}
                  onChange={(e) => handleInputChange('organId', e.target.value)}
                  required
                >
                  {organs.filter(organ => organ.status !== 'delivered').map(organ => (
                    <MenuItem key={organ.id} value={organ.organ_id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{organ.organ_type} - {organ.blood_type}</span>
                        <Chip
                          label={organ.status}
                          size="small"
                          color={organ.status === 'available' ? 'success' : 'warning'}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Donor Hospital</InputLabel>
                <Select
                  value={formData.donorHospital}
                  onChange={(e) => handleInputChange('donorHospital', e.target.value)}
                  required
                >
                  {hospitals.map(hospital => (
                    <MenuItem key={hospital.id} value={hospital.name}>
                      {hospital.name} - {hospital.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Recipient Hospital</InputLabel>
                <Select
                  value={formData.recipientHospital}
                  onChange={(e) => handleInputChange('recipientHospital', e.target.value)}
                  required
                >
                  {hospitals.map(hospital => (
                    <MenuItem key={hospital.id} value={hospital.name}>
                      {hospital.name} - {hospital.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Urgency Level</InputLabel>
                <Select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select UAV</InputLabel>
                <Select
                  value={formData.uavId}
                  onChange={(e) => handleInputChange('uavId', e.target.value)}
                  required
                >
                  {uavs.filter(uav => uav.status === 'available').map(uav => (
                    <MenuItem key={uav.id} value={uav.id}>
                      {uav.name} ({uav.model})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Duration (hours)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                required
                inputProps={{ min: 1, max: 24 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Route Notes"
                multiline
                rows={3}
                value={formData.routeNotes}
                onChange={(e) => handleInputChange('routeNotes', e.target.value)}
                placeholder="Any specific route considerations or waypoints..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Special handling instructions, temperature requirements, etc..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all information before confirming the transport.
            </Alert>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader title="Transport Summary" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Organ ID:</Typography>
                    <Typography variant="body1">{formData.organId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">UAV ID:</Typography>
                    <Typography variant="body1">{formData.uavId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">From:</Typography>
                    <Typography variant="body1">{formData.donorHospital}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">To:</Typography>
                    <Typography variant="body1">{formData.recipientHospital}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                    <Typography variant="body1">{formData.estimatedDuration} hours</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Priority:</Typography>
                    <Typography variant="body1">{formData.priority}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create New Transport
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Creating Transport...' : 'Create Transport'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<CheckCircleIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 