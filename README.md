# STOT-UB (Secure and Transparent Organ Transportation System)

A comprehensive system for hospitals and Organ Procurement Organizations (OPOs) to securely track and monitor organ transportation using blockchain technology, IoT sensors, and UAV (drone) data.

```ascii
                                 STOT-UB Architecture
+-------------+     +-----------------+     +------------------+
|   React     |     |    Express.js   |     |    Hardhat      |
|  Frontend   |<--->|     Backend     |<--->|   Blockchain    |
| :5173      |     | :3000           |     | :8545           |
+-------------+     +-----------------+     +------------------+
                           ↑                        ↑
                           |                        |
                   +---------------+         +--------------+
                   |  MQTT Broker  |         |   SQLite    |
                   |    :1883      |         |  Database   |
                   +---------------+         +--------------+
```

## Overview

STOT-UB provides a secure and transparent platform for organ transportation tracking with:

- Real-time organ transport monitoring with IoT sensors
- Blockchain-based chain of custody verification
- UAV/drone tracking integration
- Automated alerts for environmental deviations
- Role-based access control (Hospital, OPO, Transport)
- Complete audit trail of organ movement

### Key Features
- Transport initiation and verification
- Real-time monitoring of:
  - Temperature (Alert if > 5°C)
  - Humidity
  - GPS location
  - Shock/Impact sensors
- Smart contract-based verification
- Live UAV tracking data
- Environmental condition alerts

## Architecture

### Components
1. **Backend (Express.js)**
   - RESTful API endpoints
   - Socket.IO real-time updates
   - MQTT client for IoT data
   - Blockchain integration
   - SQLite database management

2. **Frontend (React + Vite)**
   - Real-time dashboard
   - Transport management interface
   - Interactive maps
   - Alert monitoring
   - Tailwind CSS styling

3. **Blockchain (Hardhat)**
   - Private Ethereum network
   - Smart contracts for transport verification
   - Immutable transport records

4. **IoT/UAV Integration**
   - MQTT protocol
   - Sensor data processing
   - Real-time monitoring
   - Alert generation

## Project Structure
```
stot-ub/
├── backend/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── transport.js      # Transport management
│   ├── mqtt/
│   │   └── mqttService.js    # IoT communication
│   ├── blockchain/
│   │   └── TransportContract.js
│   └── iot/                  # IoT simulation
├── frontend/
│   └── src/                  # React components
├── database/
│   └── stot.db              # SQLite database
└── scripts/
    ├── init-db.sql
    ├── start-backend.sh
    └── start-frontend.sh
```

## API Endpoints

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration

### Transport Management
- `POST /transport/initiate` - Start new transport
- `GET /transport/:organID` - Get transport status
- `GET /sensors/:organID` - Get sensor data
- `GET /uav/:flightID` - Get UAV tracking data
- `POST /transport/verify` - Verify delivery

### Socket.IO Events
- `sensorUpdate` - Real-time sensor data
- `uavUpdate` - UAV position updates
- `alert` - Environmental alerts

## Setup and Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd stot-ub
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

3. **Initialize Database**
   ```bash
   sqlite3 database/stot.db < backend/scripts/init-db.sql
   ```

4. **Start Services**
   ```bash
   # Start MQTT Broker
   mosquitto -c /etc/mosquitto/mosquitto.conf

   # Start Hardhat Node
   cd backend && npx hardhat node

   # Start IoT Simulation
   cd backend/iot && node simulator.js

   # Start Backend
   cd backend && npm start

   # Start Frontend
   cd frontend && npm run dev
   ```

## Testing

1. **Login**
   - URL: http://localhost:5173/login
   - Credentials: hospital@stotub.com / pass123

2. **Initiate Transport**
   - Navigate to: /transport/new
   - Fill required details
   - Submit transport request

3. **Monitor**
   - Dashboard: http://localhost:5173/dashboard
   - Check sensor data:
     - Temperature: 4°C
     - Humidity: 60%
     - Location: {lat: 40.7128, lng: -74.0060}
     - Shock: 0g

4. **Verify Delivery**
   - Navigate to: /verify
   - Enter transport ID
   - Confirm delivery

## Environment Variables
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
MQTT_BROKER=mqtt://localhost:1883
BLOCKCHAIN_URL=http://localhost:8545
JWT_SECRET=your-secret-key
```

## Development Notes

- Backend runs on http://localhost:3000
- Frontend runs on http://localhost:5173
- Hardhat network on http://localhost:8545
- MQTT broker on localhost:1883
- All IoT values are simulated constants
- Uses SQLite for persistent storage
- Real-time updates via Socket.IO

## License

ISC 