import { ethers } from 'ethers';
import OrganTransportABI from '../abi/OrganTransport.json';

// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = '0xb959E091A1fd86F108E30A065C98dB7C54741Fd7';

export async function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, OrganTransportABI.abi, signerOrProvider);
}

export async function startTransport({ transportId, organId, startLocation, estimatedDuration }) {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  const tx = await contract.startTransport(transportId, organId, startLocation, estimatedDuration);
  return tx;
}

export async function completeTransport({ transportId, endLocation, finalStatus, distanceCovered, averageSpeed }) {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  const tx = await contract.completeTransport(transportId, endLocation, finalStatus, distanceCovered, averageSpeed);
  return tx;
}

export async function alertOnChain({ transportId, reason }) {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = await getContract(signer);
  // Assuming emergencyStop is the alert function
  const tx = await contract.emergencyStop(transportId, reason);
  return tx;
} 