import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import TransportMap from '../components/TransportMap';
import EnvironmentalCharts from '../components/EnvironmentalCharts';
import { useSocket } from '../contexts/WebSocketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UAVDetailsPanel from '../components/UAVDetailsPanel';
import SensorDetailsPanel from '../components/SensorDetailsPanel';
import { startTransport as startTransportOnChain, completeTransport as completeTransportOnChain, alertOnChain } from '../utils/blockchain';

const TransportDetailPage = () => {
  const { transportId } = useParams();
  const { socket, isConnected } = useSocket();
  const [transport, setTransport] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: [],
    humidity: [],
    battery: [],
    latitude: [],
    longitude: [],
    vibration: [],
    signal: [],
    speed: [],
    altitude: []
  });
  const [pathHistory, setPathHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [uav, setUav] = useState(null);
  const [operator, setOperator] = useState(null);

  // Fetch initial transport data
  const fetchTransport = useCallback(async () => {
    try {
      const res = await fetch(`/api/transports/${transportId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTransport(data.transport);
        if (data.transport?.uav) setUav(data.transport.uav);
        if (data.transport?.currentLocation?.lat && data.transport?.currentLocation?.lng) {
          setPathHistory([{ lat: data.transport.currentLocation.lat, lng: data.transport.currentLocation.lng }]);
        } else {
          setPathHistory([]);
        }
      }
    } catch (err) {
      // handle error
    }
  }, [transportId]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  // Fetch sensor history for path on mount
  useEffect(() => {
    async function fetchSensorHistory() {
      try {
        const res = await fetch(`/api/sensors/history/${transportId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const { readings } = await res.json();
          if (Array.isArray(readings) && readings.length > 0) {
            // Build pathHistory from readings
            const path = readings.map(r => ({ lat: Number(r.latitude), lng: Number(r.longitude) }));
            setPathHistory(path);
            // Optionally, initialize environmentalData arrays from history
            setEnvironmentalData({
              temperature: readings.map(r => Number(r.temperature)),
              humidity: readings.map(r => Number(r.humidity)),
              battery: readings.map(r => Number(r.battery_level)),
              latitude: readings.map(r => Number(r.latitude)),
              longitude: readings.map(r => Number(r.longitude)),
              vibration: readings.map(r => Number(r.vibration_level)),
              signal: readings.map(r => Number(r.signal_strength)),
              speed: readings.map(r => Number(r.speed)),
              altitude: readings.map(r => Number(r.altitude)),
            });
          }
        }
      } catch (err) {
        // handle error
      }
    }
    fetchSensorHistory();
  }, [transportId]);

  // Fetch alert history for this transport
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(`/api/alerts/transport/${transportId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        // handle error
      }
    }
    fetchAlerts();
  }, [transportId]);

  // Subscribe to transport room and listen for sensorData and alert events
  useEffect(() => {
    if (!socket || !transport || !transport.transport_id) return;
    socket.emit('subscribe-transport', transport.transport_id);
    const handleSensorData = (data) => {
      setEnvironmentalData(prev => ({
        temperature: [...prev.temperature.slice(-49), data.temperature],
        humidity: [...prev.humidity.slice(-49), data.humidity],
        battery: [...prev.battery.slice(-49), data.battery],
        latitude: [...prev.latitude.slice(-49), data.latitude],
        longitude: [...prev.longitude.slice(-49), data.longitude],
        vibration: [...(prev.vibration || []).slice(-49), data.vibration_level],
        signal: [...(prev.signal || []).slice(-49), data.signal_strength],
        speed: [...(prev.speed || []).slice(-49), data.speed],
        altitude: [...(prev.altitude || []).slice(-49), data.altitude],
      }));
      setTransport(prev => prev ? {
        ...prev,
        currentLocation: { lat: data.latitude, lng: data.longitude }
      } : prev);
      setPathHistory(prev => {
        if (!data.latitude || !data.longitude) return prev;
        if (prev.length === 0 || prev[prev.length - 1].lat !== data.latitude || prev[prev.length - 1].lng !== data.longitude) {
          return [...prev, { lat: data.latitude, lng: data.longitude }];
        }
        return prev;
      });
    };
    const handleAlert = (alertPayload) => {
      // alertPayload.alerts can be an array or single alert
      const newAlerts = Array.isArray(alertPayload.alerts) ? alertPayload.alerts : [alertPayload.alerts];
      setAlerts(prev => [...newAlerts, ...prev]);
      newAlerts.forEach(alert => {
        console.log('Received alert:', alert);
        toast.error(`ALERT: ${alert}`);
      });
    };
    socket.on('sensorData', handleSensorData);
    socket.on('alert', handleAlert);
    return () => {
      socket.off('sensorData', handleSensorData);
      socket.off('alert', handleAlert);
    };
  }, [socket, transport]);

  useEffect(() => {
    setPathHistory([]);
  }, [transportId]);

  // Fetch operator details if operator_id is present
  useEffect(() => {
    const operatorId = uav?.operator_id || transport?.operator_id;
    if (operatorId) {
      fetch(`/api/users/${operatorId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.user) setOperator(data.user);
        })
        .catch(() => {});
    } else {
      setOperator(null);
    }
  }, [uav, transport]);

  if (!transport) {
    return <Typography>Loading transport details...</Typography>;
  }

  return (
    <Box sx={{
      p: 0,
      m: 0,
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #f5f8fa 0%, #e8ecf3 100%)',
      boxSizing: 'border-box',
      overflow: 'hidden', // Prevent whole page from scrolling
    }}>
      <Box sx={{ px: 4, pt: 3, pb: 0 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
          Transport Details
        </Typography>
        <Chip label={isConnected ? 'Live' : 'Offline'} color={isConnected ? 'success' : 'error'} sx={{ mb: 2 }} />
      </Box>
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 110px)', px: 4, pb: 3 }}>
        {/* Map Column */}
        <Grid item xs={12} md={8.5} lg={8.5} sx={{ height: '100%' }}>
          <Paper
            sx={{
              p: 0,
              height: '100%',
              borderRadius: 3,
              boxShadow: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 400 }}>
              <TransportMap 
                transport={transport} 
                pathHistory={pathHistory} 
                latestSensorData={(() => {
                  const idx = environmentalData.latitude.length - 1;
                  if (idx >= 0) {
                    return {
                      latitude: environmentalData.latitude[idx],
                      longitude: environmentalData.longitude[idx],
                      temperature: environmentalData.temperature[idx],
                      humidity: environmentalData.humidity[idx],
                      battery_level: environmentalData.battery[idx],
                      speed: environmentalData.speed ? environmentalData.speed[idx] : undefined,
                      timestamp: undefined
                    };
                  }
                  return null;
                })()}
              />
            </Box>
          </Paper>
        </Grid>
        {/* Right Column: All Panels Stacked Vertically */}
        <Grid item xs={12} md={3.5} lg={3.5} sx={{ height: '100%' }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2, // Spacing between the vertical panels
            height: '100%',
            overflowY: 'auto', // Allow this column to scroll if content overflows
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '4px' }
          }}>
            {/* Environmental Charts Panel */}
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Environmental Charts</Typography>
              <EnvironmentalCharts data={environmentalData} />
            </Paper>
            {/* UAV and Sensor Details Side by Side */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>UAV Details</Typography>
                  <UAVDetailsPanel uav={uav} operator={operator} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Sensor Details</Typography>
                  <SensorDetailsPanel
                    latestSensorData={(() => {
                      const idx = environmentalData.latitude.length - 1;
                      if (idx >= 0) {
                        return {
                          humidity: environmentalData.humidity[idx],
                          vibration_level: environmentalData.vibration ? environmentalData.vibration[idx] : undefined,
                          signal_strength: environmentalData.signal ? environmentalData.signal[idx] : undefined,
                          speed: environmentalData.speed ? environmentalData.speed[idx] : undefined,
                          altitude: environmentalData.altitude ? environmentalData.altitude[idx] : undefined,
                        };
                      }
                      return null;
                    })()}
                    history={environmentalData}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <ToastContainer position="top-right" />
    </Box>
  );
};

export default TransportDetailPage;