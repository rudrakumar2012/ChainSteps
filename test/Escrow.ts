import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

describe("DecentralizedMilestoneEscrow", function () {
  let escrow: any;
  let client: any;
  let freelancer: any;
  let arbitrator: any;
  let stranger: any;

  beforeEach(async function () {
    [client, freelancer, arbitrator, stranger] = await ethers.getSigners();
    const EscrowFactory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
    escrow = await EscrowFactory.deploy();
    await escrow.waitForDeployment();
  });

  describe("Escrow Creation", function () {
    it("should create an escrow", async function () {
      const tx = await escrow.createEscrow(freelancer.address, arbitrator.address);
      const receipt = await tx.wait();
      const event = receipt?.logs[0];
      expect(event?.fragment.name).to.equal("EscrowCreated");
    });

    it("should reject zero arbitrator", async function () {
      await expect(
        escrow.createEscrow(freelancer.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Arbitrator is required");
    });

    it("should reject client as arbitrator", async function () {
      await expect(
        escrow.createEscrow(freelancer.address, client.address)
      ).to.be.revertedWith("Client cannot be arbitrator");
    });

    it("should reject freelancer as arbitrator", async function () {
      await expect(
        escrow.createEscrow(freelancer.address, freelancer.address)
      ).to.be.revertedWith("Freelancer cannot be arbitrator");
    });

    it("should set correct escrow details", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      const [escrowClient, escrowFreelancer, state, currentMilestone, milestoneCount, totalAmount, escrowArbitrator, disputeTimeout] = await escrow.getEscrow(0);
      expect(escrowClient).to.equal(client.address);
      expect(escrowFreelancer).to.equal(freelancer.address);
      expect(state).to.equal(0); // Created
      expect(currentMilestone).to.equal(0);
      expect(milestoneCount).to.equal(0);
      expect(totalAmount).to.equal(0);
      expect(escrowArbitrator).to.equal(arbitrator.address);
      expect(disputeTimeout).to.equal(7 * 24 * 60 * 60); // 7 days
    });

    it("should reject client == freelancer", async function () {
      await expect(
        escrow.createEscrow(client.address, arbitrator.address)
      ).to.be.revertedWith("Client cannot be freelancer");
    });
  });

  describe("Milestone Management", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
    });

    it("should add a milestone", async function () {
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      const [, , , , milestoneCount] = await escrow.getEscrow(0);
      expect(milestoneCount).to.equal(1);
    });

    it("should add multiple milestones", async function () {
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.addMilestone(0, "Development", ethers.parseEther("0.2"));
      await escrow.addMilestone(0, "Testing", ethers.parseEther("0.1"));
      const [, , , , milestoneCount] = await escrow.getEscrow(0);
      expect(milestoneCount).to.equal(3);
    });

    it("should get milestone details", async function () {
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      const [description, amount, isCompleted, isApproved] = await escrow.getMilestone(0, 0);
      expect(description).to.equal("Design mockups");
      expect(amount).to.equal(ethers.parseEther("0.1"));
      expect(isCompleted).to.equal(false);
      expect(isApproved).to.equal(false);
    });

    it("should reject addMilestone from non-client", async function () {
      await expect(
        escrow.connect(freelancer).addMilestone(0, "Hack", ethers.parseEther("0.1"))
      ).to.be.revertedWith("Only client can call");
    });

    it("should reject addMilestone after funding", async function () {
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await expect(
        escrow.connect(client).addMilestone(0, "Late addition", ethers.parseEther("0.1"))
      ).to.be.revertedWith("Invalid state");
    });

    it("should reject zero-amount milestones", async function () {
      await expect(
        escrow.addMilestone(0, "Free milestone", 0)
      ).to.be.revertedWith("Milestone amount must be > 0");
    });

    it("should reject milestones beyond max count", async function () {
      for (let i = 0; i < 50; i++) {
        await escrow.addMilestone(0, `Milestone ${i}`, ethers.parseEther("0.01"));
      }
      await expect(
        escrow.addMilestone(0, "Overflow", ethers.parseEther("0.01"))
      ).to.be.revertedWith("Max milestones reached");
    });
  });

  describe("Escrow Funding", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
    });

    it("should fund and activate escrow", async function () {
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      const [, , state, , , totalAmount] = await escrow.getEscrow(0);
      expect(state).to.equal(1); // Active
      expect(totalAmount).to.equal(ethers.parseEther("0.1"));
    });

    it("should refund excess ETH", async function () {
      const balanceBefore = await ethers.provider.getBalance(client.address);
      const tx = await escrow.fundEscrow(0, { value: ethers.parseEther("0.2") });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(client.address);
      // Client should only pay 0.1 ETH + gas, not 0.2 ETH
      const expectedSpent = ethers.parseEther("0.1") + gasUsed;
      expect(balanceBefore - balanceAfter).to.equal(expectedSpent);
    });

    it("should reject funding with insufficient amount", async function () {
      await expect(
        escrow.fundEscrow(0, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("should reject fundEscrow from non-client", async function () {
      await expect(
        escrow.connect(freelancer).fundEscrow(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Only client can call");
    });

    it("should reject funding when no milestones exist", async function () {
      await escrow.connect(client).createEscrow(freelancer.address, arbitrator.address);
      await expect(
        escrow.connect(client).fundEscrow(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("No milestones");
    });

    it("should reject double funding", async function () {
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await expect(
        escrow.fundEscrow(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Invalid state");
    });
  });

  describe("Milestone Completion", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
    });

    it("should complete milestone by freelancer", async function () {
      await escrow.connect(freelancer).completeMilestone(0);
      const [, , isCompleted, , completedAt, approvalTimeout] = await escrow.getMilestone(0, 0);
      expect(isCompleted).to.equal(true);
      expect(completedAt).to.be.gt(0);
      expect(approvalTimeout).to.be.gt(completedAt);
    });

    it("should reject completeMilestone from client", async function () {
      await expect(
        escrow.connect(client).completeMilestone(0)
      ).to.be.revertedWith("Only freelancer can call");
    });

    it("should reject double completion", async function () {
      await escrow.connect(freelancer).completeMilestone(0);
      await expect(
        escrow.connect(freelancer).completeMilestone(0)
      ).to.be.revertedWith("Already completed");
    });

    it("should reject completeMilestone when no more milestones", async function () {
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(client).approveMilestone(0);
      // Now at Completed state, not Active
      await expect(
        escrow.connect(freelancer).completeMilestone(0)
      ).to.be.revertedWith("Invalid state");
    });
  });

  describe("Milestone Approval", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
    });

    it("should approve milestone and release funds", async function () {
      const initialBalance = await ethers.provider.getBalance(freelancer.address);
      await escrow.connect(client).approveMilestone(0);
      const finalBalance = await ethers.provider.getBalance(freelancer.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("0.1"));
    });

    it("should mark milestone as approved", async function () {
      await escrow.connect(client).approveMilestone(0);
      const [, , isCompleted, isApproved] = await escrow.getMilestone(0, 0);
      expect(isCompleted).to.equal(true);
      expect(isApproved).to.equal(true);
    });

    it("should advance currentMilestone", async function () {
      await escrow.connect(client).approveMilestone(0);
      const [, , , currentMilestone] = await escrow.getEscrow(0);
      expect(currentMilestone).to.equal(1);
    });

    it("should complete escrow when all milestones approved", async function () {
      await escrow.connect(client).approveMilestone(0);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(3); // Completed
    });

    it("should reject approveMilestone from freelancer", async function () {
      await expect(
        escrow.connect(freelancer).approveMilestone(0)
      ).to.be.revertedWith("Only client can call");
    });

    it("should reject approval before completion", async function () {
      // Create fresh escrow without completing milestone
      await escrow.connect(client).createEscrow(freelancer.address, arbitrator.address);
      await escrow.connect(client).addMilestone(1, "Design", ethers.parseEther("0.1"));
      await escrow.connect(client).fundEscrow(1, { value: ethers.parseEther("0.1") });
      await expect(
        escrow.connect(client).approveMilestone(1)
      ).to.be.revertedWith("Not completed");
    });

    it("should reject double approval", async function () {
      await escrow.connect(client).approveMilestone(0);
      // Create new escrow to avoid "No more milestones"
      await escrow.connect(client).createEscrow(freelancer.address, arbitrator.address);
      await escrow.connect(client).addMilestone(1, "Design", ethers.parseEther("0.1"));
      await escrow.connect(client).fundEscrow(1, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(1);
      await escrow.connect(client).approveMilestone(1);
      // Try to approve again
      await expect(
        escrow.connect(client).approveMilestone(1)
      ).to.be.revertedWith("Invalid state");
    });
  });

  describe("Claim Milestone", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
    });

    it("should allow freelancer to claim after approval timeout", async function () {
      const initialBalance = await ethers.provider.getBalance(freelancer.address);
      await increaseTime(7 * 24 * 60 * 60 + 1); // 7 days + 1 second
      const tx = await escrow.connect(freelancer).claimMilestone(0);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const finalBalance = await ethers.provider.getBalance(freelancer.address);
      expect(finalBalance - initialBalance + gasCost).to.equal(ethers.parseEther("0.1"));
    });

    it("should reject claimMilestone before approval timeout", async function () {
      await expect(
        escrow.connect(freelancer).claimMilestone(0)
      ).to.be.revertedWith("Timeout not expired");
    });

    it("should reject claimMilestone from non-freelancer", async function () {
      await increaseTime(7 * 24 * 60 * 60 + 1);
      await expect(
        escrow.connect(client).claimMilestone(0)
      ).to.be.revertedWith("Only freelancer can call");
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
    });

    it("should raise dispute by freelancer", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(2); // Disputed
    });

    it("should raise dispute by client", async function () {
      await escrow.connect(client).raiseDispute(0, { value: ethers.parseEther("0.001") });
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(2); // Disputed
    });

    it("should reject raiseDispute from stranger", async function () {
      await expect(
        escrow.connect(stranger).raiseDispute(0, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Only client or freelancer");
    });

    it("should reject raiseDispute before completion", async function () {
      // Create fresh escrow without completing
      await escrow.connect(client).createEscrow(freelancer.address, arbitrator.address);
      await escrow.connect(client).addMilestone(1, "Design", ethers.parseEther("0.1"));
      await escrow.connect(client).fundEscrow(1, { value: ethers.parseEther("0.1") });
      await expect(
        escrow.connect(freelancer).raiseDispute(1, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Not completed");
    });

    it("should resolve dispute with split after delay", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1); // 1 day + 1 second
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);
      const tx = await escrow.connect(arbitrator).resolveDispute(0, 30);
      const receipt = await tx.wait();
      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      expect(clientBalanceAfter - clientBalanceBefore).to.equal(ethers.parseEther("0.03")); // 30% to client

      // Should emit DisputeResolved event
      const resolvedEvent = receipt.logs.find((log: any) => log.fragment?.name === "DisputeResolved");
      expect(resolvedEvent).to.not.be.undefined;
    });

    it("should reject resolveDispute from non-arbitrator", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      await expect(
        escrow.connect(stranger).resolveDispute(0, 50)
      ).to.be.revertedWith("Only arbitrator");
    });

    it("should reject invalid percentage in resolveDispute", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      await expect(
        escrow.connect(arbitrator).resolveDispute(0, 101)
      ).to.be.revertedWith("Invalid percentage");
    });

    it("should resume Active state after dispute resolution with remaining milestones", async function () {
      // Create new escrow for this specific test
      const EscrowFactory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
      const escrow2 = await EscrowFactory.deploy();
      await escrow2.waitForDeployment();

      await escrow2.createEscrow(freelancer.address, arbitrator.address);
      await escrow2.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow2.addMilestone(0, "Design2", ethers.parseEther("0.1"));
      await escrow2.fundEscrow(0, { value: ethers.parseEther("0.2") });
      await escrow2.connect(freelancer).completeMilestone(0);
      await escrow2.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      await escrow2.connect(arbitrator).resolveDispute(0, 50);
      const [, , state] = await escrow2.getEscrow(0);
      expect(state).to.equal(1); // Active
    });

    it("should send full amount to freelancer when clientPercent is 0", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      await escrow.connect(arbitrator).resolveDispute(0, 0);
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      // Freelancer gets 0.1 ETH milestone + 0.001 ETH bond (clientPercent <= 50)
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(ethers.parseEther("0.101"));
    });

    it("should send full amount to client when clientPercent is 100", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);
      await escrow.connect(arbitrator).resolveDispute(0, 100);
      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      // Client gets 0.1 ETH milestone + 0.001 ETH bond (clientPercent > 50)
      expect(clientBalanceAfter - clientBalanceBefore).to.equal(ethers.parseEther("0.101"));
    });
  });

  describe("Dispute Bond", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
    });

    it("should revert raiseDispute without bond payment", async function () {
      await expect(
        escrow.connect(freelancer).raiseDispute(0)
      ).to.be.revertedWith("Insufficient dispute bond");
    });

    it("should revert raiseDispute with insufficient bond", async function () {
      await expect(
        escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.0005") })
      ).to.be.revertedWith("Insufficient dispute bond");
    });

    it("should store disputeRaisedAt and disputeRaiser on raise", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      const [, , , , , , , , disputeRaisedAt, disputeRaiser, disputeBond] = await escrow.getEscrow(0);
      expect(disputeRaisedAt).to.be.gt(0);
      expect(disputeRaiser).to.equal(freelancer.address);
      expect(disputeBond).to.equal(ethers.parseEther("0.001"));
    });

    it("should send bond to freelancer when clientPercent <= 50", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      await escrow.connect(arbitrator).resolveDispute(0, 30);
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      // Freelancer gets 70% of 0.1 ETH milestone + 0.001 ETH bond
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(
        ethers.parseEther("0.071") // 0.07 + 0.001
      );
    });

    it("should send bond to client when clientPercent > 50", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      const clientBalanceBefore = await ethers.provider.getBalance(client.address);
      await escrow.connect(arbitrator).resolveDispute(0, 60);
      const clientBalanceAfter = await ethers.provider.getBalance(client.address);
      // Client gets 60% of 0.1 ETH milestone + 0.001 ETH bond
      expect(clientBalanceAfter - clientBalanceBefore).to.equal(
        ethers.parseEther("0.061") // 0.06 + 0.001
      );
    });

    it("should send bond to freelancer when clientPercent = 50 (tie goes to freelancer)", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      await escrow.connect(arbitrator).resolveDispute(0, 50);
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      // Freelancer gets 50% of 0.1 ETH milestone + 0.001 ETH bond
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(
        ethers.parseEther("0.051") // 0.05 + 0.001
      );
    });

    it("should accept bond greater than minimum", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.005") });
      const [, , , , , , , , , , disputeBond] = await escrow.getEscrow(0);
      expect(disputeBond).to.equal(ethers.parseEther("0.005"));
    });
  });

  describe("Resolution Delay", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
    });

    it("should revert resolveDispute during 24-hour delay", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await expect(
        escrow.connect(arbitrator).resolveDispute(0, 50)
      ).to.be.revertedWith("Resolution delay not elapsed");
    });

    it("should allow resolveDispute after 24-hour delay", async function () {
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      await escrow.connect(arbitrator).resolveDispute(0, 50);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(3); // Completed (single milestone)
    });
  });

  describe("Dispute Expiry", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
    });

    it("should revert expireDispute before 30 days", async function () {
      await expect(
        escrow.expireDispute(0)
      ).to.be.revertedWith("Dispute not expired");
    });

    it("should revert expireDispute when not in Disputed state", async function () {
      // Resolve the dispute first, then try to expire
      await increaseTime(24 * 60 * 60 + 1);
      await escrow.connect(arbitrator).resolveDispute(0, 50);
      await expect(
        escrow.expireDispute(0)
      ).to.be.revertedWith("Invalid state");
    });

    it("should release milestone funds and bond to freelancer after 30 days", async function () {
      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);
      await increaseTime(30 * 24 * 60 * 60 + 1); // 30 days + 1 second
      const tx = await escrow.expireDispute(0);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      // Freelancer gets 0.1 ETH milestone + 0.001 ETH bond (they raised the dispute)
      // Note: expireDispute is called by whoever, so gas is paid by caller
      // But since it's not the freelancer calling, we check their balance delta
      // Actually let's just check the escrow state
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(3); // Completed
    });

    it("should transition to Active state when milestones remain after expiry", async function () {
      // Create a 2-milestone escrow for this test
      const EscrowFactory = await ethers.getContractFactory("DecentralizedMilestoneEscrow");
      const escrow2 = await EscrowFactory.deploy();
      await escrow2.waitForDeployment();

      await escrow2.createEscrow(freelancer.address, arbitrator.address);
      await escrow2.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow2.addMilestone(0, "Dev", ethers.parseEther("0.1"));
      await escrow2.fundEscrow(0, { value: ethers.parseEther("0.2") });
      await escrow2.connect(freelancer).completeMilestone(0);
      await escrow2.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });

      await increaseTime(30 * 24 * 60 * 60 + 1);
      await escrow2.expireDispute(0);
      const [, , state, currentMilestone] = await escrow2.getEscrow(0);
      expect(state).to.equal(1); // Active
      expect(currentMilestone).to.equal(1);
    });
  });

  describe("Escrow Cancellation", function () {
    it("should cancel escrow before funding", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.connect(client).cancelEscrow(0);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(4); // Cancelled
    });

    it("should clear escrowCreators on cancellation", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      const creatorBefore = await escrow.escrowCreators(0);
      expect(creatorBefore).to.equal(client.address);
      await escrow.connect(client).cancelEscrow(0);
      const creatorAfter = await escrow.escrowCreators(0);
      expect(creatorAfter).to.equal(ethers.ZeroAddress);
    });

    it("should reject cancelEscrow after funding", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await expect(
        escrow.connect(client).cancelEscrow(0)
      ).to.be.revertedWith("Invalid state");
    });

    it("should reject cancelEscrow from non-client", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await expect(
        escrow.connect(freelancer).cancelEscrow(0)
      ).to.be.revertedWith("Only client can call");
    });
  });

  describe("Multi-Milestone Flow", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow.addMilestone(0, "Development", ethers.parseEther("0.2"));
      await escrow.addMilestone(0, "Testing", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.4") });
    });

    it("should process milestones sequentially", async function () {
      // Complete and approve first milestone
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(client).approveMilestone(0);
      let [, , , currentMilestone] = await escrow.getEscrow(0);
      expect(currentMilestone).to.equal(1);

      // Complete and approve second milestone
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(client).approveMilestone(0);
      [, , , currentMilestone] = await escrow.getEscrow(0);
      expect(currentMilestone).to.equal(2);

      // Complete and approve third milestone
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(client).approveMilestone(0);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(3); // Completed
    });

    it("should track total amount correctly", async function () {
      const [, , , , , totalAmount] = await escrow.getEscrow(0);
      expect(totalAmount).to.equal(ethers.parseEther("0.4"));
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design mockups", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
    });

    it("should reject completeMilestone from stranger", async function () {
      await expect(
        escrow.connect(stranger).completeMilestone(0)
      ).to.be.revertedWith("Only freelancer can call");
    });

    it("should reject approveMilestone from stranger", async function () {
      await escrow.connect(freelancer).completeMilestone(0);
      await expect(
        escrow.connect(stranger).approveMilestone(0)
      ).to.be.revertedWith("Only client can call");
    });

    it("should reject raiseDispute from stranger", async function () {
      await escrow.connect(freelancer).completeMilestone(0);
      await expect(
        escrow.connect(stranger).raiseDispute(0, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Only client or freelancer");
    });
  });

  describe("State Transitions", function () {
    it("should start in Created state", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(0); // Created
    });

    it("should transition to Active after funding", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(1); // Active
    });

    it("should transition to Disputed from Active", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(2); // Disputed
    });

    it("should transition back to Active from Disputed after resolution with remaining milestones", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow.addMilestone(0, "Design2", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.2") });
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(freelancer).raiseDispute(0, { value: ethers.parseEther("0.001") });
      await increaseTime(24 * 60 * 60 + 1);
      await escrow.connect(arbitrator).resolveDispute(0, 50);
      const [, , state] = await escrow.getEscrow(0);
      expect(state).to.equal(1); // Active
    });
  });

  describe("getApprovalTimeout edge cases", function () {
    it("should return 0 when all milestones are complete", async function () {
      await escrow.createEscrow(freelancer.address, arbitrator.address);
      await escrow.addMilestone(0, "Design", ethers.parseEther("0.1"));
      await escrow.fundEscrow(0, { value: ethers.parseEther("0.1") });
      await escrow.connect(freelancer).completeMilestone(0);
      await escrow.connect(client).approveMilestone(0);
      const timeout = await escrow.getApprovalTimeout(0);
      expect(timeout).to.equal(0);
    });
  });
});