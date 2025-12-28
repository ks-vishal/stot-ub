import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import flightCursor from './flight-cursor.svg';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const flightIcon = new L.Icon({
  iconUrl: flightCursor,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [0, -16],
  className: 'flight-cursor-icon',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const TransportMap = ({ transport, pathHistory, latestSensorData }) => {
  // Extract coordinates
  const donorLat = transport?.organ?.donor_location_lat;
  const donorLng = transport?.organ?.donor_location_lng;
  const recipientLat = transport?.organ?.recipient_location_lat;
  const recipientLng = transport?.organ?.recipient_location_lng;
  const currentLocation = transport?.currentLocation;

  // Fallback if no coordinates
  if (!donorLat || !donorLng || !recipientLat || !recipientLng) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No route/location data available for this transport
        </Typography>
      </Box>
    );
  }

  // Center map on current UAV location or donor hospital
  const center = currentLocation && currentLocation.lat && currentLocation.lng
    ? [currentLocation.lat, currentLocation.lng]
    : [donorLat, donorLng];

  // Route polyline (donor to recipient)
  const routeLine = [
    [donorLat, donorLng],
    [recipientLat, recipientLng],
  ];

  // Path history polyline
  const pathLine = pathHistory && pathHistory.length > 1
    ? pathHistory.map(p => [p.lat, p.lng])
    : [];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          label={transport.status} 
          color={transport.status === 'completed' ? 'success' : 'primary'}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          {transport.transportId || transport.transport_id}
        </Typography>
      </Box>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: 8 }}
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Donor Hospital Marker */}
        <Marker position={[donorLat, donorLng]}>
          <Popup>
            Donor Hospital<br />{transport?.organ?.donor_hospital}
          </Popup>
        </Marker>
        {/* Recipient Hospital Marker */}
        <Marker position={[recipientLat, recipientLng]}>
          <Popup>
            Recipient Hospital<br />{transport?.organ?.recipient_hospital}
          </Popup>
        </Marker>
        {/* UAV Current Location Marker */}
        {currentLocation && currentLocation.lat && currentLocation.lng && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={flightIcon}>
            {/* Permanent Tooltip with key info */}
            <Tooltip direction="top" offset={[0, -20]} permanent>
              <div style={{ fontSize: '0.95em', lineHeight: 1.3 }}>
                <strong>UAV:</strong> {transport?.uav_id || transport?.uav?.uav_id || 'N/A'}<br />
                <strong>Organ:</strong> {transport?.organ_id || transport?.organ?.organ_id || 'N/A'}<br />
                <strong>Lat:</strong> {currentLocation.lat?.toFixed(5)}<br />
                <strong>Lng:</strong> {currentLocation.lng?.toFixed(5)}<br />
                <strong>Temp:</strong> {latestSensorData?.temperature !== undefined ? `${latestSensorData.temperature}°C` : 'N/A'}<br />
                <strong>Pressure:</strong> {latestSensorData?.pressure !== undefined ? `${latestSensorData.pressure} hPa` : 'N/A'}
              </div>
            </Tooltip>
            <Popup>
              <div>
                <strong>UAV Current Location</strong><br />
                Lat: {currentLocation.lat}<br />
                Lng: {currentLocation.lng}<br />
                {latestSensorData && (
                  <>
                    {latestSensorData.speed !== undefined && (
                      <>
                        Speed: {latestSensorData.speed} km/h<br />
                      </>
                    )}
                    {latestSensorData.battery_level !== undefined && (
                      <>
                        Battery: {latestSensorData.battery_level}%<br />
                      </>
                    )}
                    {latestSensorData.timestamp && (
                      <>
                        Time: {new Date(latestSensorData.timestamp).toLocaleString()}<br />
                      </>
                    )}
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        {/* Route Polyline */}
        <Polyline positions={routeLine} color="blue" weight={3} dashArray="6,8" />
        {/* Path History Polyline */}
        {pathLine.length > 1 && <Polyline positions={pathLine} color="red" weight={4} />} 
      </MapContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Donor: {transport.organ?.donor_hospital}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Recipient: {transport.organ?.recipient_hospital}
          </Typography>
        </Box>
        {transport.status === 'completed' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="success.main">
              Delivered
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

TransportMap.propTypes = {
  transport: PropTypes.object.isRequired,
  pathHistory: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  })),
  latestSensorData: PropTypes.object,
};

export default TransportMap; 