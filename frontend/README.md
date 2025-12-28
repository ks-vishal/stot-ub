# STOT-UB Frontend

A modern React.js dashboard for the Secure and Transparent Organ Transportation system using UAVs and blockchain technology.

## Features

### 🚁 Real-time Monitoring
- **Live Transport Tracking**: Interactive maps showing UAV positions and routes
- **Environmental Monitoring**: Real-time temperature and humidity charts
- **WebSocket Integration**: Instant updates for transport status and sensor data
- **Alert System**: Real-time notifications for environmental violations and system alerts

### 🏥 Transport Management
- **Transport Initiation**: Multi-step form for creating new organ transports
- **UAV Assignment**: Intelligent UAV selection based on availability and range
- **Route Planning**: Visual route display with estimated arrival times
- **Status Tracking**: Comprehensive transport status with progress indicators

### 🔗 Blockchain Integration
- **Chain of Custody**: Complete timeline of custody transfers
- **Transaction History**: View all blockchain transactions and events
- **Audit Trail**: Comprehensive audit logs for compliance
- **Smart Contract Events**: Real-time blockchain event monitoring

### 👥 Role-based Access
- **Admin**: Full system access and user management
- **Coordinator**: Transport initiation and monitoring
- **Doctor**: Organ and patient information access
- **Technician**: UAV and sensor management
- **Viewer**: Read-only access to transport data

### 📊 Analytics & Reporting
- **Environmental Charts**: Temperature and humidity visualization
- **Transport Analytics**: Performance metrics and statistics
- **Audit Reports**: Comprehensive reporting and export capabilities
- **Data Export**: CSV/PDF export functionality

## Tech Stack

- **React 18.2.0**: Modern React with hooks and functional components
- **Material-UI 5**: Professional UI components and theming
- **React Router 6**: Client-side routing and navigation
- **Socket.io Client**: Real-time WebSocket communication
- **Leaflet**: Interactive maps for transport tracking
- **Recharts**: Data visualization and charts
- **Axios**: HTTP client for API communication
- **Date-fns**: Date manipulation and formatting

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── TransportMap.js           # Interactive map component
│   │   ├── EnvironmentalCharts.js    # Temperature/humidity charts
│   │   ├── ChainOfCustody.js         # Custody timeline
│   │   ├── AlertPanel.js             # Alert notifications
│   │   └── TransportStatus.js        # Transport status display
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.js            # Authentication state
│   │   ├── WebSocketContext.js       # WebSocket connection
│   │   └── AlertContext.js           # Alert management
│   ├── hooks/             # Custom React hooks
│   │   ├── useWebSocket.js           # WebSocket hook
│   │   └── useApi.js                 # API call hook
│   ├── pages/             # Page components
│   │   ├── LoginPage.js              # Authentication page
│   │   ├── DashboardPage.js          # Main dashboard
│   │   ├── TransportFormPage.js      # Transport initiation
│   │   └── AuditReportsPage.js       # Reports and analytics
│   ├── api/               # API integration
│   │   └── index.js                   # API functions
│   ├── utils/             # Utility functions
│   │   ├── constants.js               # Application constants
│   │   └── helpers.js                 # Helper functions
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 3001

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stot-ub/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_MAP_API_KEY=your_map_api_key
```

## Available Scripts

- `npm start` - Start development server
- `npm run dev` - Alias for start
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Key Components

### TransportMap
Interactive map component using Leaflet for real-time UAV tracking:
- Real-time UAV position updates
- Source and destination markers
- Route visualization
- Custom markers and popups

### EnvironmentalCharts
Real-time environmental monitoring using Recharts:
- Temperature and humidity area charts
- Threshold indicators
- Color-coded status display
- Historical data visualization

### ChainOfCustody
Timeline component for blockchain custody tracking:
- Chronological event display
- Blockchain transaction hashes
- Status indicators
- Interactive timeline

### AlertPanel
Real-time alert management system:
- Live alert notifications
- Alert categorization
- Dismiss functionality
- Alert history

## API Integration

The frontend communicates with the backend through REST APIs and WebSocket connections:

### REST APIs
- Authentication (`/api/auth/*`)
- Transport management (`/api/transport/*`)
- Sensor data (`/api/sensors/*`)
- Blockchain data (`/api/blockchain/*`)
- Reports (`/api/reports/*`)

### WebSocket Events
- `transport_update` - Real-time transport status
- `sensor_data` - Environmental sensor readings
- `alert` - System alerts and notifications
- `uav_status` - UAV status updates
- `blockchain_event` - Blockchain transaction events

## State Management

The application uses React Context for state management:

### AuthContext
- User authentication state
- Token management
- Role-based access control
- Login/logout functionality

### WebSocketContext
- WebSocket connection management
- Real-time event handling
- Connection status monitoring

### AlertContext
- Alert state management
- Alert creation and removal
- Alert history

## Styling

The application uses Material-UI (MUI) for consistent styling:
- Material Design principles
- Responsive design
- Dark/light theme support
- Custom component theming

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- Different screen orientations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- Code splitting with React.lazy()
- Memoization with React.memo()
- Optimized re-renders
- Efficient data fetching
- Image optimization

## Security Features

- JWT token authentication
- Role-based access control
- Secure API communication
- Input validation
- XSS protection

## Testing

The application includes:
- Unit tests with Jest
- Component testing with React Testing Library
- Integration tests
- E2E testing capabilities

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with external systems
