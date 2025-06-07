const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Load the deployed contract address
  const contractInfo = JSON.parse(fs.readFileSync("contract-address.json"));
  
  // Get the contract instance
  const OrganTransport = await hre.ethers.getContractFactory("OrganTransport");
  const organTransport = OrganTransport.attach(contractInfo.address);

  // Get signers for different roles
  const [admin, hospital1, hospital2, transporter] = await hre.ethers.getSigners();

  console.log("Interacting with OrganTransport contract at:", contractInfo.address);

  try {
    // Initiate a new transport as hospital1
    console.log("\nInitiating new transport...");
    const tx1 = await organTransport.connect(hospital1).initiateTransport(
      "ORGAN_001",
      "Hospital A",
      "Hospital B"
    );
    const receipt1 = await tx1.wait();
    
    // Get the transport ID from the event
    const event = receipt1.logs[0];
    const transportId = event.args[0];
    console.log("Transport initiated with ID:", transportId);

    // Update transport status as transporter
    console.log("\nUpdating transport status...");
    const tx2 = await organTransport.connect(transporter).updateStatus(
      transportId,
      "in_transit"
    );
    await tx2.wait();
    console.log("Status updated to: in_transit");

    // Get transport status
    console.log("\nGetting transport status...");
    const status = await organTransport.getTransportStatus(transportId);
    console.log("Current transport status:", {
      organId: status[0],
      sourceHospital: status[1],
      destinationHospital: status[2],
      status: status[3],
      timestamp: new Date(Number(status[4]) * 1000).toISOString(),
      initiator: status[5]
    });

    // Get update count
    const updateCount = await organTransport.getUpdateCount(transportId);
    console.log("\nNumber of status updates:", updateCount.toString());

    // Get all status updates
    console.log("\nStatus update history:");
    for (let i = 0; i < updateCount; i++) {
      const update = await organTransport.getStatusUpdate(transportId, i);
      console.log(`Update ${i}:`, {
        status: update[0],
        timestamp: new Date(Number(update[1]) * 1000).toISOString(),
        updater: update[2]
      });
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 