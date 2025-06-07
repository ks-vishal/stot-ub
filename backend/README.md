# STOT-UB Backend

Backend server for the Secure and Transparent Organ Transportation System, handling API endpoints, blockchain integration, and IoT communication.

## Components

### 1. Express Server (server.js)
- Main application server
- Socket.IO integration
- MQTT client setup
- Route management
- Error handling
- Database initialization

### 2. Authentication (routes/auth.js)
- JWT-based authentication
- Role-based access control
- Password hashing (bcrypt)
- Session management

### 3. Transport Management (routes/transport.js)
- Transport initiation
- Status updates
- Blockchain integration
- IoT data handling
- Delivery verification

### 4. Blockchain Integration (blockchain/)
- Smart contract interaction
- Transport verification
- Status management
- History tracking

### 5. IoT Integration (mqtt/, iot/)
- MQTT client setup
- Sensor data processing
- Real-time monitoring
- Alert generation

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Transport Management
```
POST /api/transport/initiate
POST /api/transport/:transportId/status
GET  /api/transport/:transportId
GET  /api/transport/:organID
GET  /api/sensors/:organID
GET  /api/uav/:flightID
POST /api/transport/verify
```

### Socket.IO Events
```
sensorUpdate  - Emits sensor data updates
uavUpdate     - Emits UAV position updates
alert         - Emits environmental alerts
```

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Initialization**
   ```bash
   sqlite3 ../database/stot.db < scripts/init-db.sql
   ```

4. **Start Services**
   ```bash
   # Start Hardhat Node
   npx hardhat node

   # Start MQTT Broker
   mosquitto

   # Start IoT Simulation
   cd iot && node simulator.js

   # Start Server
   npm start
   ```

## Testing

### Endpoint Testing
```bash
# Authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@stotub.com","password":"pass123"}'

# Initiate Transport
curl -X POST http://localhost:3000/api/transport/initiate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"organID":"ORG123","sourceHospital":"H1","destinationHospital":"H2"}'
```

### IoT Simulation Values
```javascript
const simulatedData = {
  temperature: 4,    // Celsius
  humidity: 60,      // Percentage
  location: {
    lat: 40.7128,
    lng: -74.0060
  },
  shock: 0          // g-force
};
```

## Directory Structure
```
backend/
├── server.js
├── routes/
│   ├── auth.js
│   └── transport.js
├── middleware/
│   └── auth.js
├── mqtt/
│   └── mqttService.js
├── blockchain/
│   ├── TransportContract.js
│   └── contracts/
├── iot/
│   ├── simulator.js
│   └── sensors/
├── config/
│   └── database.js
└── scripts/
    └── init-db.sql
```

## Error Handling

- HTTP Status Codes
- Detailed Error Messages
- Blockchain Transaction Errors
- IoT Communication Errors
- Database Errors

## Security Features

- JWT Authentication
- Password Hashing
- Role-Based Access
- Input Validation
- SQL Injection Prevention
- Rate Limiting

## Dependencies

- express: Web framework
- socket.io: Real-time communication
- mqtt: IoT communication
- ethers: Blockchain interaction
- sqlite3: Database management
- jsonwebtoken: Authentication
- bcryptjs: Password hashing
- winston: Logging

## Environment Variables
```env
PORT=3000
JWT_SECRET=your-secret-key
MQTT_BROKER=mqtt://localhost:1883
BLOCKCHAIN_URL=http://localhost:8545
DB_PATH=../database/stot.db
```
