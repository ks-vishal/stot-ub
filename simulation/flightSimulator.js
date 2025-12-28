const config = require('./config');

function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress
  };
}

function* flightPathGenerator(durationMs, intervalMs, start, end) {
  const steps = Math.ceil(durationMs / intervalMs);
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    yield interpolatePosition(start, end, progress);
  }
}

module.exports = {
  flightPathGenerator
};

