const { ethers } = require('ethers');
const contractArtifact = require('../artifacts/contracts/OrganTransport.sol/OrganTransport.json');

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NETWORK || 'http://localhost:8545');
        this.contract = new ethers.Contract(
            process.env.SMART_CONTRACT_ADDRESS,
            contractArtifact.abi,
            this.provider
        );
    }

    async getWallet(privateKey) {
        return new ethers.Wallet(privateKey, this.provider);
    }

    async initiateTransport(hospitalPrivateKey, organId, sourceHospital, destinationHospital) {
        try {
            const wallet = await this.getWallet(hospitalPrivateKey);
            const contractWithSigner = this.contract.connect(wallet);

            const tx = await contractWithSigner.initiateTransport(
                organId,
                sourceHospital,
                destinationHospital
            );
            const receipt = await tx.wait();

            // Get the transport ID from the event
            const event = receipt.logs[0];
            const transportId = event.args[0];

            return {
                success: true,
                transportId: transportId.toString(),
                transactionHash: receipt.hash
            };
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error(`Failed to initiate transport: ${error.message}`);
        }
    }

    async updateTransportStatus(transporterPrivateKey, transportId, status) {
        try {
            const wallet = await this.getWallet(transporterPrivateKey);
            const contractWithSigner = this.contract.connect(wallet);

            const tx = await contractWithSigner.updateStatus(transportId, status);
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash
            };
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error(`Failed to update transport status: ${error.message}`);
        }
    }

    async getTransportStatus(transportId) {
        try {
            const status = await this.contract.getTransportStatus(transportId);
            return {
                organId: status[0],
                sourceHospital: status[1],
                destinationHospital: status[2],
                status: status[3],
                timestamp: new Date(Number(status[4]) * 1000),
                initiator: status[5]
            };
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error(`Failed to get transport status: ${error.message}`);
        }
    }

    async getTransportHistory(transportId) {
        try {
            const updateCount = await this.contract.getUpdateCount(transportId);
            const history = [];

            for (let i = 0; i < updateCount; i++) {
                const update = await this.contract.getStatusUpdate(transportId, i);
                history.push({
                    status: update[0],
                    timestamp: new Date(Number(update[1]) * 1000),
                    updater: update[2]
                });
            }

            return history;
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error(`Failed to get transport history: ${error.message}`);
        }
    }

    // Helper method to check if an address has a specific role
    async hasRole(role, address) {
        try {
            const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));
            return await this.contract.hasRole(roleHash, address);
        } catch (error) {
            console.error('Blockchain error:', error);
            throw new Error(`Failed to check role: ${error.message}`);
        }
    }
}

module.exports = new BlockchainService(); 