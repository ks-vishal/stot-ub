import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Thermostat, Opacity } from '@mui/icons-material';

const EnvironmentalCharts = ({ data }) => {
  const { temperature = [], humidity = [] } = data;

  const getLatestValue = (array) => {
    return array.length > 0 ? array[array.length - 1] : 0;
  };

  const getStatusColor = (type, value) => {
    if (type === 'temperature') {
      if (value < 2 || value > 8) return 'error';
      if (value < 3 || value > 7) return 'warning';
      return 'success';
    }
    if (type === 'humidity') {
      if (value < 30 || value > 70) return 'error';
      if (value < 40 || value > 60) return 'warning';
      return 'success';
    }
    return 'default';
  };

  const latestTemp = getLatestValue(temperature);
  const latestHumidity = getLatestValue(humidity);

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Temperature */}
        <Grid item xs={6}>
          <Paper 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              border: 2,
              borderColor: `${getStatusColor('temperature', latestTemp)}.main`
            }}
          >
            <Thermostat 
              sx={{ 
                fontSize: 40, 
                color: `${getStatusColor('temperature', latestTemp)}.main`,
                mb: 1
              }} 
            />
            <Typography variant="h4" component="div" gutterBottom>
              {latestTemp.toFixed(1)}°C
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Temperature
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Target: 2-8°C
            </Typography>
          </Paper>
        </Grid>

        {/* Humidity */}
        <Grid item xs={6}>
          <Paper 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              border: 2,
              borderColor: `${getStatusColor('humidity', latestHumidity)}.main`
            }}
          >
            <Opacity 
              sx={{ 
                fontSize: 40, 
                color: `${getStatusColor('humidity', latestHumidity)}.main`,
                mb: 1
              }} 
            />
            <Typography variant="h4" component="div" gutterBottom>
              {latestHumidity.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Humidity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Target: 30-70%
            </Typography>
          </Paper>
        </Grid>

        {/* Mini Charts */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Trends
            </Typography>
            
            {/* Temperature Trend */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Temperature (°C)
              </Typography>
              <Box sx={{ 
                height: 60, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1,
                p: 1,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1
              }}>
                {temperature.slice(-10).map((temp, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      backgroundColor: getStatusColor('temperature', temp) === 'success' ? '#4caf50' : 
                                    getStatusColor('temperature', temp) === 'warning' ? '#ff9800' : '#f44336',
                      height: `${Math.max(10, (temp / 10) * 100)}%`,
                      borderRadius: '2px 2px 0 0',
                      minHeight: 2
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Humidity Trend */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Humidity (%)
              </Typography>
              <Box sx={{ 
                height: 60, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 1,
                p: 1,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1
              }}>
                {humidity.slice(-10).map((hum, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      backgroundColor: getStatusColor('humidity', hum) === 'success' ? '#4caf50' : 
                                    getStatusColor('humidity', hum) === 'warning' ? '#ff9800' : '#f44336',
                      height: `${Math.max(10, (hum / 100) * 100)}%`,
                      borderRadius: '2px 2px 0 0',
                      minHeight: 2
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnvironmentalCharts; 