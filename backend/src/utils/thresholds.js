const defaultThresholds = {
  temperature: { min: 2, max: 8 },
  humidity: { min: 45, max: 65 },
  vibration: { max: 5 },
  batteryLevel: { min: 20 }
};

async function getThresholds(transportId) {
  // In a real system, fetch from DB or config
  return defaultThresholds;
}

function checkThresholds(reading, thresholds) {
  const alerts = [];
  if (reading.temperature < thresholds.temperature.min) alerts.push('LOW_TEMPERATURE');
  if (reading.temperature > thresholds.temperature.max) alerts.push('HIGH_TEMPERATURE');
  if (reading.humidity < thresholds.humidity.min) alerts.push('LOW_HUMIDITY');
  if (reading.humidity > thresholds.humidity.max) alerts.push('HIGH_HUMIDITY');
  if (reading.vibration > thresholds.vibration.max) alerts.push('HIGH_VIBRATION');
  if (reading.batteryLevel < thresholds.batteryLevel.min) alerts.push('LOW_BATTERY');
  return alerts.length > 0 ? alerts : null;
}

module.exports = { getThresholds, checkThresholds }; 