const hre = require("hardhat");

async function main() {
    console.log("Deploying OrganTransportVerifier contract...");

    // Deploy the contract
    const OrganTransportVerifier = await hre.ethers.getContractFactory("OrganTransportVerifier");
    const verifier = await OrganTransportVerifier.deploy();
    await verifier.waitForDeployment();

    const address = await verifier.getAddress();
    console.log("OrganTransportVerifier deployed to:", address);

    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployed by:", deployer.address);

    // Setup roles
    const HOSPITAL_ROLE = await verifier.HOSPITAL_ROLE();
    const TRANSPORTER_ROLE = await verifier.TRANSPORTER_ROLE();
    const OPO_ROLE = await verifier.OPO_ROLE();

    // For testing purposes, we'll set up some test accounts with roles
    const [_, hospital1, hospital2, transporter, opo] = await hre.ethers.getSigners();

    console.log("\nSetting up roles...");
    
    // Grant roles
    await verifier.grantRole(HOSPITAL_ROLE, hospital1.address);
    await verifier.grantRole(HOSPITAL_ROLE, hospital2.address);
    await verifier.grantRole(TRANSPORTER_ROLE, transporter.address);
    await verifier.grantRole(OPO_ROLE, opo.address);

    console.log(`Hospital 1 (${hospital1.address}) granted HOSPITAL_ROLE`);
    console.log(`Hospital 2 (${hospital2.address}) granted HOSPITAL_ROLE`);
    console.log(`Transporter (${transporter.address}) granted TRANSPORTER_ROLE`);
    console.log(`OPO (${opo.address}) granted OPO_ROLE`);

    console.log("\nDeployment and setup completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 