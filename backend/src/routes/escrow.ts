import { Router } from "express";
import { getEscrow, getMilestone, getApprovalTimeout } from "../services/web3.js";

const router = Router();

// GET /escrow/:id - Get escrow details
router.get("/:id", async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: "Invalid escrow ID" });
    }
    const escrow = await getEscrow(escrowId);
    res.json(escrow);
  } catch (error: any) {
    console.error("Error fetching escrow:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id/milestone/:milestoneId - Get milestone details
router.get("/:id/milestone/:milestoneId", async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    const milestoneId = parseInt(req.params.milestoneId as string);
    if (isNaN(escrowId) || isNaN(milestoneId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const milestone = await getMilestone(escrowId, milestoneId);
    res.json(milestone);
  } catch (error: any) {
    console.error("Error fetching milestone:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:id/timeout - Get remaining approval timeout
router.get("/:id/timeout", async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id as string);
    if (isNaN(escrowId)) {
      return res.status(400).json({ error: "Invalid escrow ID" });
    }
    const timeout = await getApprovalTimeout(escrowId);
    res.json({ remainingSeconds: timeout });
  } catch (error: any) {
    console.error("Error fetching timeout:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
