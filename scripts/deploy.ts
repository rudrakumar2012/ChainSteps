import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying DecentralizedMilestoneEscrow...");

  const factory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`Contract deployed to: ${address}`);

  // Save deployment address — replace existing CONTRACT_ADDRESS if present
  const fs = await import("fs");
  const path = await import("path");
  const envPath = path.resolve(".env.local");

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(/^CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${address}`);
  }
  if (!envContent.includes("CONTRACT_ADDRESS=")) {
    envContent += `\nCONTRACT_ADDRESS=${address}\n`;
  }
  fs.writeFileSync(envPath, envContent);
  console.log("Deployment address saved to .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});