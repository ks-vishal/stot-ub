const { ethers } = require('ethers');
const axios = require('axios');

let jwtToken = null;

async function loginAndGetToken() {
  const res = await axios.post('http://localhost:3001/api/auth/login', {
    username: 'admin',
    password: 'admin123'
  });
  jwtToken = res.data.token;
}

function hashSensorData(data) {
  // Hash the JSON string of the data
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
}

async function sendHashToBackend(transportId, hash, sensorData) {
  if (!jwtToken) {
    await loginAndGetToken();
  }
  try {
    await axios.post(
      'http://localhost:3001/api/blockchain/update-transport',
      {
        transportId,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        location: `${sensorData.latitude},${sensorData.longitude}`,
        dataHash: hash // optional, for audit
      },
      {
        headers: { Authorization: `Bearer ${jwtToken}` }
      }
    );
  } catch (err) {
    if (err.response && err.response.status === 401) {
      // Token might have expired, try to login again
      await loginAndGetToken();
      // Retry the request
      try {
        await axios.post(
          'http://localhost:3001/api/blockchain/update-transport',
          {
            transportId,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            location: `${sensorData.latitude},${sensorData.longitude}`,
            dataHash: hash
          },
          {
            headers: { Authorization: `Bearer ${jwtToken}` }
          }
        );
      } catch (err2) {
        console.error('[Blockchain] Failed to send hash to backend after re-login:', err2.message);
      }
    } else {
      console.error('[Blockchain] Failed to send hash to backend:', err.message);
    }
  }
}

function getJwtToken() {
  return jwtToken;
}

module.exports = {
  hashSensorData,
  sendHashToBackend,
  loginAndGetToken,
  getJwtToken
};
