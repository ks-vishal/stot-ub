const config = require('./config');
const { flightPathGenerator } = require('./flightSimulator');

function randomInRange(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function maybeEmergency(value, min, max, probability) {
  if (Math.random() < probability) {
    // Simulate out-of-range value
    return Math.random() < 0.5 ? min - randomInRange(1, 3) : max + randomInRange(1, 3);
  }
  return value;
}

function* sensorDataGenerator(transportId, durationMs, intervalMs, donor, recipient) {
  const flightGen = flightPathGenerator(durationMs, intervalMs, donor, recipient);
  let battery = config.BATTERY_RANGE.max;
  for (let i = 0; ; i++) {
    const gps = flightGen.next().value || recipient;
    const temperature = maybeEmergency(
      randomInRange(config.TEMPERATURE_RANGE.min, config.TEMPERATURE_RANGE.max),
      config.TEMPERATURE_RANGE.min,
      config.TEMPERATURE_RANGE.max,
      config.EMERGENCY_PROBABILITY
    );
    const humidity = maybeEmergency(
      randomInRange(config.HUMIDITY_RANGE.min, config.HUMIDITY_RANGE.max),
      config.HUMIDITY_RANGE.min,
      config.HUMIDITY_RANGE.max,
      config.EMERGENCY_PROBABILITY
    );
    const acceleration = maybeEmergency(
      randomInRange(config.ACCELERATION_RANGE.min, config.ACCELERATION_RANGE.max),
      config.ACCELERATION_RANGE.min,
      config.ACCELERATION_RANGE.max,
      config.EMERGENCY_PROBABILITY
    );
    battery = Math.max(config.BATTERY_RANGE.min, battery - randomInRange(0.1, 0.5));
    yield {
      transportId,
      timestamp: Date.now(),
      temperature,
      humidity,
      pressure: randomInRange(950, 1050, 2),
      latitude: gps.lat,
      longitude: gps.lng,
      altitude: randomInRange(100, 200),
      speed: config.FLIGHT_SPEED_KMPH,
      batteryLevel: battery,
      vibration: acceleration,
      accelerometer: acceleration,
      light: randomInRange(100, 1000),
      signal: randomInRange(-90, -40, 0)
    };
  }
}

module.exports = {
  sensorDataGenerator
};

