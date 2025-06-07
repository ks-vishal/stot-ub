class DroneSimulator {
  constructor() {
    this.activeFlights = new Map();
    this.droneFleet = new Map();
    this.initializeDroneFleet();
  }

  initializeDroneFleet() {
    // Initialize some dummy drones
    for (let i = 1; i <= 10; i++) {
      this.droneFleet.set(`UAV-${i}`, {
        id: `UAV-${i}`,
        status: 'available',
        batteryLevel: 100,
        maintenanceStatus: 'good',
        lastMaintenance: new Date().toISOString(),
        flightHours: 0
      });
    }
  }

  startFlight(transportId, source, destination) {
    // Find an available drone
    const availableDrone = Array.from(this.droneFleet.values())
      .find(drone => drone.status === 'available');

    if (!availableDrone) {
      throw new Error('No available drones');
    }

    // Calculate estimated flight parameters
    const flightPlan = this.calculateFlightPlan(source, destination);

    // Update drone status
    availableDrone.status = 'in-flight';
    
    const flight = {
      droneId: availableDrone.id,
      transportId,
      source,
      destination,
      startTime: new Date(),
      estimatedDuration: flightPlan.duration,
      currentLocation: { ...flightPlan.waypoints[0] },
      waypoints: flightPlan.waypoints,
      currentWaypoint: 0,
      status: 'in-progress'
    };

    // Start position updates
    const updateInterval = setInterval(() => {
      this.updateFlightPosition(flight);
    }, 5000);

    flight.updateInterval = updateInterval;
    this.activeFlights.set(transportId, flight);

    return {
      flightId: `${transportId}-${availableDrone.id}`,
      drone: availableDrone,
      estimatedDuration: flightPlan.duration,
      estimatedDistance: flightPlan.distance
    };
  }

  stopFlight(transportId) {
    const flight = this.activeFlights.get(transportId);
    if (!flight) {
      return;
    }

    clearInterval(flight.updateInterval);
    
    // Update drone status
    const drone = this.droneFleet.get(flight.droneId);
    drone.status = 'available';
    drone.flightHours += flight.estimatedDuration / 3600; // Convert seconds to hours

    this.activeFlights.delete(transportId);

    return {
      droneId: flight.droneId,
      flightDuration: (new Date() - flight.startTime) / 1000, // Duration in seconds
      status: 'completed'
    };
  }

  getFlightStatus(transportId) {
    const flight = this.activeFlights.get(transportId);
    if (!flight) {
      return null;
    }

    return {
      droneId: flight.droneId,
      currentLocation: flight.currentLocation,
      progress: (flight.currentWaypoint / flight.waypoints.length) * 100,
      status: flight.status,
      estimatedTimeRemaining: this.calculateRemainingTime(flight)
    };
  }

  // Simulated flight plan calculation
  calculateFlightPlan(source, destination) {
    // In a real implementation, this would use actual coordinates and pathfinding
    const waypoints = [
      { lat: 0, lng: 0 }, // Source
      { lat: 1, lng: 1 }, // Intermediate point
      { lat: 2, lng: 2 }  // Destination
    ];

    return {
      waypoints,
      duration: 1800, // 30 minutes in seconds
      distance: 50 // 50 km
    };
  }

  // Update the simulated position of the drone
  updateFlightPosition(flight) {
    if (flight.currentWaypoint >= flight.waypoints.length - 1) {
      flight.status = 'completed';
      this.stopFlight(flight.transportId);
      return;
    }

    const nextWaypoint = flight.waypoints[flight.currentWaypoint + 1];
    flight.currentLocation = {
      lat: (flight.currentLocation.lat + nextWaypoint.lat) / 2,
      lng: (flight.currentLocation.lng + nextWaypoint.lng) / 2
    };

    flight.currentWaypoint++;
  }

  calculateRemainingTime(flight) {
    const progress = flight.currentWaypoint / flight.waypoints.length;
    return Math.round(flight.estimatedDuration * (1 - progress));
  }

  // Get available drones
  getAvailableDrones() {
    return Array.from(this.droneFleet.values())
      .filter(drone => drone.status === 'available');
  }

  // Get drone status
  getDroneStatus(droneId) {
    return this.droneFleet.get(droneId);
  }
}

module.exports = new DroneSimulator(); 