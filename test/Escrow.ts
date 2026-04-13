import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("DecentralizedMilestoneEscrow", function () {
  let escrow: any;
  let client: any;
  let freelancer: any;

  beforeEach(async function () {
    [client, freelancer] = await ethers.getSigners();
    const EscrowFactory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
    escrow = await EscrowFactory.deploy();
    await escrow.waitForDeployment();
  });

  it("should create an escrow", async function () {
    const tx = await escrow.createEscrow(freelancer.address);
    const receipt = await tx.wait();
    const event = receipt?.logs[0];
    expect(event?.fragment.name).to.equal("EscrowCreated");
  });

  it("should add a milestone", async function () {
    await escrow.createEscrow(freelancer.address);
    await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
    const [, , , , milestoneCount] = await escrow.getEscrow(0);
    expect(milestoneCount).to.equal(1);
  });

  it("should fund and activate escrow", async function () {
    await escrow.createEscrow(freelancer.address);
    await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
    await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
    const [, , state] = await escrow.getEscrow(0);
    expect(state).to.equal(1); // Active state
  });
});
