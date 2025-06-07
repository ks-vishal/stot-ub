const Web3 = require('web3');

// ABI would be generated from your actual smart contract
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "transportId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "TransportStatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_transportId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_organType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_source",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_destination",
        "type": "string"
      }
    ],
    "name": "initiateTransport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

class TransportContract {
  constructor() {
    this.web3 = new Web3(process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545');
    this.contract = new this.web3.eth.Contract(
      CONTRACT_ABI,
      process.env.SMART_CONTRACT_ADDRESS
    );
  }

  async initiateTransport(transportId, organType, source, destination) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      const result = await this.contract.methods
        .initiateTransport(transportId, organType, source, destination)
        .send({ from: accounts[0] });
      
      return {
        success: true,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Blockchain error:', error);
      throw new Error('Failed to initiate transport on blockchain');
    }
  }

  async getTransportHistory(transportId) {
    try {
      const events = await this.contract.getPastEvents('TransportStatusUpdated', {
        filter: { transportId },
        fromBlock: 0,
        toBlock: 'latest'
      });

      return events.map(event => ({
        status: event.returnValues.status,
        timestamp: new Date(event.returnValues.timestamp * 1000),
        transactionHash: event.transactionHash
      }));
    } catch (error) {
      console.error('Blockchain error:', error);
      throw new Error('Failed to fetch transport history from blockchain');
    }
  }
}

module.exports = new TransportContract(); 