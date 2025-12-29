# STOT-UB - Secure and Transparent Organ Transportation using UAVs and Blockchain

<div align="center">

![STOT-UB](https://img.shields.io/badge/STOT--UB-Organ%20Transportation-667eea?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-764ba2?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-10B981?style=for-the-badge)

**A modern, secure platform for managing organ transportation via UAVs with blockchain-based audit trails**

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Usage](#usage) • [API Documentation](#api-documentation)

</div>

---

## 📋 Overview

STOT-UB is a comprehensive system designed to revolutionize organ transportation by combining UAV (Unmanned Aerial Vehicle) technology with blockchain for secure, transparent, and efficient delivery of life-saving organs. The platform provides real-time tracking, environmental monitoring, and tamper-proof audit trails.

### Key Highlights

- 🚁 **UAV Fleet Management** - Track and manage multiple UAVs in real-time
- 🏥 **Organ Tracking** - Complete visibility of organ status and location
- 🔐 **Blockchain Integration** - Immutable audit trail for all transactions
- 📊 **Real-time Monitoring** - Live sensor data (temperature, humidity, shock, battery)
- 🗺️ **Interactive Maps** - Visual tracking with Leaflet integration
- ⚡ **WebSocket Updates** - Real-time notifications and alerts
- 🎨 **Modern UI** - Glassmorphic design with purple gradients

---

## ✨ Features

### Core Functionality

- **Transport Management**
  - Create, track, and manage organ transport missions
  - Assign UAVs to transport missions
  - Monitor transport status in real-time
  - Complete transport workflow automation

- **UAV Management**
  - Fleet overview and status monitoring  
  - Maintenance logging and tracking
  - Battery and health monitoring
  - Assignment to transport missions

- **Real-Time Monitoring**
  - Live GPS tracking on interactive maps
  - Environmental sensor data (temperature, humidity)
  - Shock detection and alerts
  - Battery level monitoring

- **Alert System**
  - Automated threshold-based alerts
  - Critical event notifications
  - Real-time WebSocket notifications
  - Alert history and management

- **Blockchain Integration**
  - Immutable transaction records
  - Smart contract integration
  - Blockchain event viewer
  - Audit trail for compliance

- **Reporting & Analytics**
  - Transport history and analytics
  - Maintenance logs
  - Audit reports
  - Performance metrics

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **UI Library**: Material-UI (MUI) 5.14.19
- **Routing**: React Router v6
- **Maps**: Leaflet with React-Leaflet
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS with MUI, Custom CSS

### Backend
- **Runtime**: Node.js 22.21.1
- **Framework**: Express.js 4.18.2
- **Database**: MySQL (MariaDB compatible)
- **ORM**: Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO 4.7.4
- **MQTT**: MQTT.js for IoT communication
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Blockchain
- **Framework**: Hardhat
- **Language**: Solidity
- **Contracts**: OpenZeppelin
- **Network**: Ethereum-compatible

### Simulation
- **IoT Simulation**: Custom sensor data generator
- **Communication**: MQTT protocol
- **Blockchain**: Ethers.js for contract interaction

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- MySQL/MariaDB
- (Optional) Mosquitto MQTT broker for simulation

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd colloqium_backup
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up MySQL database**
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
mysql -u root -p < backend/src/database/schema.sql
```

4. **Configure environment variables**

The backend `.env` is already configured with:
```env
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password

DB_NAME=stot_ub
BACKEND_PORT=3001
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

5. **Start the application**

**Option 1: Individual modules**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Blockchain (Optional)
cd blockchain
npm run dev

# Terminal 4 - Simulation (Optional, requires MQTT)
cd simulation
npm start
```

**Option 2: All modules concurrently** (if dependencies allow)
```bash
npm run dev
```

---

## 📱 Usage

### Access the Application

1. **Frontend Dashboard**: http://localhost:3000
2. **Backend API**: http://localhost:3001
3. **Health Check**: http://localhost:3001/health

### Default Login Credentials

```
Username: admin
Password: admin123
```

### Dashboard Features

Once logged in, you can:

1. **View Dashboard** - Real-time overview of active transports
2. **Create Transport** - Initiate new organ transport mission
3. **Manage UAVs** - View and manage UAV fleet
4. **View Alerts** - Monitor system alerts and notifications
5. **Blockchain Events** - View blockchain transaction history
6. **Generate Reports** - Create audit and performance reports

---

## 🗂️ Project Structure

```
stot-ub/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── database/     # Database configuration
│   │   ├── utils/        # Utility functions
│   │   └── server.js     # Entry point
│   └── package.json
│
├── frontend/             # React dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
│
├── blockchain/           # Smart contracts
│   ├── contracts/        # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── hardhat.config.js
│
├── simulation/           # IoT simulation
│   ├── index.js          # Main simulation
│   ├── sensorSimulator.js
│   └── mqttClient.js
│
└── package.json          # Root package.json
```

---

## 🔌 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

#### Transports
- `GET /api/transports` - List all transports
- `POST /api/transports` - Create new transport
- `GET /api/transports/:id` - Get transport details
- `POST /api/transports/:id/complete` - Complete transport

#### UAVs
- `GET /api/uavs` - List all UAVs
- `POST /api/uavs` - Register new UAV
- `GET /api/uavs/:id` - Get UAV details
- `PATCH /api/uavs/:id` - Update UAV

#### Organs
- `GET /api/organs` - List all organs
- `POST /api/organs` - Register new organ
- `GET /api/organs/:id` - Get organ details

#### Alerts
- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/read` - Mark alert as read
- `DELETE /api/alerts/clear` - Clear all alerts

#### Blockchain
- `POST /api/blockchain/update-transport` - Update transport on blockchain
- `GET /api/blockchain/events` - Get blockchain events

---

## 🎨 UI Features

### Design Elements

- **Color Scheme**: Purple gradient theme (#667eea → #764ba2)
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Animations**: Smooth transitions and micro-interactions
- **Typography**: Inter font family with multiple weights
- **Responsive**: Mobile-friendly design

### Key Pages

1. **Login Page** - Glassmorphic card with gradient background
2. **Dashboard** - Real-time overview with statistics
3. **Transport Management** - Create and track transports
4. **UAV Management** - Fleet overview and control
5. **Map View** - Interactive Leaflet map with UAV tracking
6. **Alert Panel** - Real-time notifications
7. **Reports** - Analytics and audit trails

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS protection
- Input validation
- SQL injection prevention (Sequelize ORM)
- XSS protection

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Blockchain tests
cd blockchain
npm test
```

---

## 📊 Database Schema

### Key Tables

- **users** - User accounts and authentication
- **uavs** - UAV fleet information
- **organs** - Organ inventory
- **transports** - Transport missions
- **sensor_data** - Real-time sensor readings
- **blockchain_events** - Blockchain transaction log
- **alerts** - System alerts
- **maintenance_logs** - UAV maintenance records
- **audit_logs** - System audit trail

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**STOT-UB Development Team**

---

## 🐛 Known Issues

1. **Blockchain Module**: Workspace dependency conflicts - requires separate installation
2. **Simulation**: Requires MQTT broker (Mosquitto) to be installed locally

---

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- Leaflet for mapping capabilities
- Socket.IO for real-time functionality
- Hardhat for blockchain development tools

---

<div align="center">

**Made with ❤️ for saving lives through technology**

© 2025 STOT-UB. All rights reserved.

</div>
