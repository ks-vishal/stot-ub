const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying STOT-UB Smart Contracts...");

  // Get the contract factories
  const STOTAccessControl = await ethers.getContractFactory("STOTAccessControl");
  const SensorData = await ethers.getContractFactory("SensorData");
  const ChainOfCustody = await ethers.getContractFactory("ChainOfCustody");
  const OrganTransport = await ethers.getContractFactory("OrganTransport");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy contracts in order
  console.log("Deploying AccessControl...");
  const accessControl = await STOTAccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log("AccessControl deployed to:", accessControlAddress);
  
  console.log("Deploying SensorData...");
  const sensorData = await SensorData.deploy();
  await sensorData.waitForDeployment();
  const sensorDataAddress = await sensorData.getAddress();
  console.log("SensorData deployed to:", sensorDataAddress);
  
  console.log("Deploying ChainOfCustody...");
  const chainOfCustody = await ChainOfCustody.deploy();
  await chainOfCustody.waitForDeployment();
  const chainOfCustodyAddress = await chainOfCustody.getAddress();
  console.log("ChainOfCustody deployed to:", chainOfCustodyAddress);
  
  console.log("Deploying OrganTransport...");
  const organTransport = await OrganTransport.deploy(sensorDataAddress, chainOfCustodyAddress);
  await organTransport.waitForDeployment();
  const organTransportAddress = await organTransport.getAddress();
  console.log("OrganTransport deployed to:", organTransportAddress);
  
  // Set up roles and permissions
  console.log("Setting up roles and permissions...");
  
  // First, grant admin role to deployer (this should work as deployer is the default admin)
  const adminRole = await accessControl.ADMIN_ROLE();
  const hospitalRole = await accessControl.HOSPITAL_ROLE();
  const transportRole = await accessControl.TRANSPORT_ROLE();
  const operatorRole = await accessControl.OPERATOR_ROLE();
  const sensorRole = await accessControl.SENSOR_ROLE();
  const authorityRole = await accessControl.AUTHORITY_ROLE();
  
  console.log("Granting roles to contracts...");
  
  // Grant roles to OrganTransport contract
  await accessControl.grantRole(hospitalRole, organTransportAddress);
  await accessControl.grantRole(transportRole, organTransportAddress);
  await accessControl.grantRole(operatorRole, organTransportAddress);
  await accessControl.grantRole(sensorRole, organTransportAddress);
  
  // Grant roles to SensorData contract
  await accessControl.grantRole(sensorRole, sensorDataAddress);
  await accessControl.grantRole(operatorRole, sensorDataAddress);
  await accessControl.grantRole(hospitalRole, sensorDataAddress);
  await accessControl.grantRole(authorityRole, sensorDataAddress);
  
  // Grant roles to ChainOfCustody contract
  await accessControl.grantRole(hospitalRole, chainOfCustodyAddress);
  await accessControl.grantRole(transportRole, chainOfCustodyAddress);
  await accessControl.grantRole(authorityRole, chainOfCustodyAddress);
  
  console.log("Deployment completed successfully!");
  
  // Save deployment info
  const deploymentInfo = {
    contracts: {
      accessControl: accessControlAddress,
      sensorData: sensorDataAddress,
      chainOfCustody: chainOfCustodyAddress,
      organTransport: organTransportAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Verify contracts are properly connected
  console.log("Verifying contract connections...");
  
  const organTransportContract = await ethers.getContractAt("OrganTransport", organTransportAddress);
  const sensorDataContract = await organTransportContract.sensorDataContract();
  const chainOfCustodyContract = await organTransportContract.chainOfCustodyContract();
  
  console.log("OrganTransport sensor data contract:", sensorDataContract);
  console.log("OrganTransport chain of custody contract:", chainOfCustodyContract);
  
  if (sensorDataContract === sensorDataAddress && chainOfCustodyContract === chainOfCustodyAddress) {
    console.log("✅ Contract connections verified successfully!");
  } else {
    console.log("❌ Contract connections verification failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 