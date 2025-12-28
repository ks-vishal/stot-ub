const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
require('dotenv').config();

// Load contract ABIs and addresses
const contracts = {};
const deploymentPath = path.join(__dirname, '../../../blockchain/deployment.json');
if (fs.existsSync(deploymentPath)) {
  Object.assign(contracts, require(deploymentPath));
}

// Initialize provider and wallet only if valid private key is provided
let provider, wallet, blockchainEnabled = false;

try {
  const privateKey = process.env.PRIVATE_KEY;
  if (privateKey && privateKey !== 'your_ethereum_private_key_here' && privateKey.length === 66) {
    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://localhost:8545');
    wallet = new ethers.Wallet(privateKey, provider);
    blockchainEnabled = true;
    logger.info('Blockchain integration enabled');
  } else {
    logger.warn('Blockchain integration disabled - invalid or missing private key');
  }
} catch (error) {
  logger.warn('Blockchain integration disabled - error initializing wallet:', error.message);
}

function getContract(name) {
  if (!blockchainEnabled) {
    throw new Error('Blockchain integration is disabled');
  }
  
  const abiPath = path.join(__dirname, `../../../blockchain/artifacts/contracts/${name}.sol/${name}.json`);
  if (!fs.existsSync(abiPath)) {
    throw new Error(`Contract ABI not found: ${abiPath}`);
  }
  
  const abi = JSON.parse(fs.readFileSync(abiPath)).abi;
  const address = contracts[name];
  if (!address) {
    throw new Error(`Contract address not found for: ${name}`);
  }
  
  return new ethers.Contract(address, abi, wallet);
}

// Mock implementations for when blockchain is disabled
const mockResponse = (data) => ({
  hash: '0x' + '0'.repeat(64),
  wait: async () => ({ status: 1 }),
  ...data
});

exports.registerOrgan = async (data) => {
  if (!blockchainEnabled) {
    logger.info('Mock: registerOrgan', data);
    return mockResponse(data);
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.registerOrgan(
      data.organId,
      data.organType,
      data.donor,
      data.recipient,
      data.location,
      data.notes
    );
  } catch (error) {
    logger.error('Blockchain registerOrgan failed:', error.message);
    return mockResponse(data);
  }
};

exports.startTransport = async (data) => {
  if (!blockchainEnabled) {
    logger.info('Mock: startTransport', data);
    return mockResponse(data);
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.startTransport(
      data.transportId,
      data.organId,
      data.startLocation,
      data.estimatedDuration
    );
  } catch (error) {
    logger.error('Blockchain startTransport failed:', error.message, { data, stack: error.stack, full: error });
    return mockResponse(data);
  }
};

exports.updateTransport = async (data) => {
  if (!blockchainEnabled) {
    logger.info('Mock: updateTransport', data);
    return mockResponse(data);
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.updateTransport(
      data.transportId,
      data.temperature,
      data.humidity,
      data.location
    );
  } catch (error) {
    logger.error('Blockchain updateTransport failed:', error.message, { data, stack: error.stack, full: error });
    return mockResponse(data);
  }
};

exports.completeTransport = async (data) => {
  if (!blockchainEnabled) {
    logger.info('Mock: completeTransport', data);
    return mockResponse(data);
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.completeTransport(
      data.transportId,
      data.endLocation,
      data.finalStatus,
      data.distanceCovered,
      data.averageSpeed
    );
  } catch (error) {
    logger.error('Blockchain completeTransport failed:', error.message, { data, stack: error.stack, full: error });
    return mockResponse(data);
  }
};

exports.getOrgan = async (organId) => {
  if (!blockchainEnabled) {
    logger.info('Mock: getOrgan', { organId });
    return { organId, status: 'mock' };
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.getOrgan(organId);
  } catch (error) {
    logger.error('Blockchain getOrgan failed:', error.message);
    return { organId, status: 'error' };
  }
};

exports.getTransport = async (transportId) => {
  if (!blockchainEnabled) {
    logger.info('Mock: getTransport', { transportId });
    return { transportId, status: 'mock' };
  }
  
  try {
    const contract = getContract('OrganTransport');
    return await contract.getTransport(transportId);
  } catch (error) {
    logger.error('Blockchain getTransport failed:', error.message);
    return { transportId, status: 'error' };
  }
};

exports.isBlockchainEnabled = () => blockchainEnabled; 