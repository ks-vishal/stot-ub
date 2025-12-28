const config = require('./config');

function triggerEmergency(type, data) {
  switch (type) {
    case 'temperature':
      data.temperature = config.TEMPERATURE_RANGE.max + 5;
      break;
    case 'humidity':
      data.humidity = config.HUMIDITY_RANGE.max + 10;
      break;
    case 'shock':
      data.vibration = config.ACCELERATION_RANGE.max + 3;
      break;
    case 'battery':
      data.batteryLevel = config.BATTERY_RANGE.min - 10;
      break;
    default:
      break;
  }
  data.emergency = type;
  return data;
}

module.exports = {
  triggerEmergency
};

