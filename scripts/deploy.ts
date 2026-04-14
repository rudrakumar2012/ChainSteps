import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying DecentralizedMilestoneEscrow...");

  const factory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`Contract deployed to: ${address}`);

  // Save deployment address
  const fs = await import("fs");
  const envContent = `\nCONTRACT_ADDRESS=${address}\n`;
  fs.appendFileSync(".env.local", envContent);
  console.log("Deployment address saved to .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
