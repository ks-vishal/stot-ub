const hre = require("hardhat");

async function main() {
  console.log("Deploying OrganTransport contract...");

  // Deploy the contract
  const OrganTransport = await hre.ethers.getContractFactory("OrganTransport");
  const organTransport = await OrganTransport.deploy();
  await organTransport.waitForDeployment();

  const address = await organTransport.getAddress();
  console.log("OrganTransport deployed to:", address);

  // Grant roles to test accounts
  const [admin, hospital1, hospital2, transporter] = await hre.ethers.getSigners();

  // Role constants from the contract
  const HOSPITAL_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("HOSPITAL_ROLE"));
  const TRANSPORT_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TRANSPORT_ROLE"));

  // Grant roles
  await organTransport.grantRole(HOSPITAL_ROLE, hospital1.address);
  await organTransport.grantRole(HOSPITAL_ROLE, hospital2.address);
  await organTransport.grantRole(TRANSPORT_ROLE, transporter.address);

  console.log("Roles granted to test accounts:");
  console.log("Hospital 1:", hospital1.address);
  console.log("Hospital 2:", hospital2.address);
  console.log("Transporter:", transporter.address);

  // Save the contract address to a file
  const fs = require("fs");
  const contractInfo = {
    address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "contract-address.json",
    JSON.stringify(contractInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 